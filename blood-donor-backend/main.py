from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import math
from datetime import datetime, timedelta
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables from .env file
load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# Initialize Twilio Client
def is_valid_credential(cred):
    return cred and not cred.startswith("your_")

print("\n--- Twilio Configuration Check ---")
valid_sid = is_valid_credential(TWILIO_ACCOUNT_SID)
valid_token = is_valid_credential(TWILIO_AUTH_TOKEN)
valid_phone = is_valid_credential(TWILIO_PHONE_NUMBER)

if TWILIO_ACCOUNT_SID:
    if valid_sid:
        print(f"[INFO] TWILIO_ACCOUNT_SID: {TWILIO_ACCOUNT_SID[:4]}******")
    else:
        print("[ERROR] TWILIO_ACCOUNT_SID is a placeholder!")
else:
    print("[ERROR] TWILIO_ACCOUNT_SID is missing!")

if not valid_token:
    if TWILIO_AUTH_TOKEN and TWILIO_AUTH_TOKEN.startswith("your_"):
        print("[ERROR] TWILIO_AUTH_TOKEN is a placeholder!")
    else:
        print("[ERROR] TWILIO_AUTH_TOKEN is missing!")

if TWILIO_PHONE_NUMBER:
    if valid_phone:
        print(f"[INFO] TWILIO_PHONE_NUMBER: {TWILIO_PHONE_NUMBER}")
    else:
        print("[ERROR] TWILIO_PHONE_NUMBER is a placeholder!")
else:
    print("[ERROR] TWILIO_PHONE_NUMBER is missing!")

try:
    if valid_sid and valid_token and valid_phone:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print("[SUCCESS] Twilio client initialized with real credentials.")
    else:
        twilio_client = None
        print("[ERROR] Invalid Twilio credentials detected. Automatic SMS will be skipped.")
except Exception as e:
    twilio_client = None
    print(f"[ERROR] Failed to initialize Twilio client: {e}")
print("----------------------------------\n")
print("----------------------------------\n")

import models
import schemas
from database import engine, get_db, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blood Donor Alert Platform API")

# CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Database Seeding (Demo Data)
# -----------------------------
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        # --- Task 1: One-time Cleanup of Duplicates ---
        # Find duplicates (same name, date, location) and keep the one with lowest ID
        print("[CLEANUP] Removing duplicate news entries...")
        all_camps = db.query(models.DonationCamp).all()
        seen = set()
        duplicates = []
        for camp in all_camps:
            identifier = (camp.camp_name, camp.date, camp.location)
            if identifier in seen:
                duplicates.append(camp)
            else:
                seen.add(identifier)
        
        for dup in duplicates:
            db.delete(dup)
        if duplicates:
            db.commit()
            print(f"[CLEANUP] Deleted {len(duplicates)} duplicate entries.")

        # --- Task 2: Robust Seeding (Hospitals & Donors) ---
        if db.query(models.Hospital).count() < 2:
            print("[SEED] Adding demo hospitals...")
            hospitals = [
                models.Hospital(
                    name="Apollo Hospital",
                    registration_number="HOSP001",
                    hospital_type="Private",
                    contact_details="044-28293333",
                    email="info@apollohospitals.com",
                    in_charge_name="Dr. Prathap Reddy",
                    number_of_beds=500,
                    opening_time="00:00",
                    closing_time="23:59",
                    address="Greams Road, Chennai",
                    latitude=13.0607,
                    longitude=80.2512
                ),
                models.Hospital(
                    name="Global Health City",
                    registration_number="HOSP002",
                    hospital_type="Specialty",
                    contact_details="044-44777000",
                    email="contact@globalhealth.org",
                    in_charge_name="Dr. K. Ravindranath",
                    number_of_beds=300,
                    opening_time="09:00",
                    closing_time="21:00",
                    address="Perumbakkam, Chennai",
                    latitude=12.9231,
                    longitude=80.1982
                )
            ]
            db.add_all(hospitals)
            db.commit()

        # --- Task 3: Unique Sample News Seeding ---
        sample_news = [
            {"name": "City Blood Donation Camp", "loc": "Marina Beach, Chennai", "date": "2026-04-10"},
            {"name": "Emergency Blood Drive", "loc": "Apollo Hospital, Chennai", "date": "2026-04-12"},
            {"name": "College Blood Donation Event", "loc": "SRM University, Kattankulathur", "date": "2026-04-15"},
        ]

        first_hosp = db.query(models.Hospital).first()
        if first_hosp:
            for item in sample_news:
                # Check for uniqueness before inserting
                exists = db.query(models.DonationCamp).filter(
                    models.DonationCamp.camp_name == item["name"],
                    models.DonationCamp.location == item["loc"],
                    models.DonationCamp.date == item["date"]
                ).first()
                if not exists:
                    print(f"[SEED] Adding unique news: {item['name']}")
                    new_camp = models.DonationCamp(
                        hospital_id=first_hosp.id,
                        camp_name=item["name"],
                        location=item["loc"],
                        date=item["date"]
                    )
                    db.add(new_camp)
            db.commit()

    except Exception as e:
        print(f"[ERROR] Startup processing failed: {e}")
        db.rollback()
    finally:
        db.close()

# -----------------------------
# Haversine Formula
# -----------------------------
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float):
    R = 6371.0  # Earth radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.asin(math.sqrt(a))
    return R * c


# -----------------------------
# DONOR REGISTRATION
# -----------------------------
@app.post("/register/donor", response_model=schemas.Donor)
def register_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    db_donor = models.Donor(**donor.dict())
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor


# -----------------------------
# HOSPITAL REGISTRATION
# -----------------------------
@app.post("/register/hospital", response_model=schemas.Hospital)
def register_hospital(hospital: schemas.HospitalCreate, db: Session = Depends(get_db)):
    db_hospital = models.Hospital(**hospital.dict())
    db.add(db_hospital)
    db.commit()
    db.refresh(db_hospital)
    return db_hospital


# -----------------------------
# -----------------------------
# BLOOD COMPATIBILITY reglas
# -----------------------------
# Key: Patient Blood Group, Value: List of Compatible Donor Blood Groups
BLOOD_COMPATIBILITY = {
    "O-": ["O-"],
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
}

# -----------------------------
# BLOOD REQUEST + MATCHING
# -----------------------------
@app.post("/request/blood", response_model=dict)
def create_blood_request(request: schemas.BloodRequestCreate, db: Session = Depends(get_db)):

    # 1. Save request
    db_request = models.BloodRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # 2. Get hospital
    hospital = db.query(models.Hospital).filter(
        models.Hospital.id == request.hospital_id
    ).first()

    if not hospital:
        return {
            "request": db_request,
            "matched_donors": []
        }

    # 3. Determine Radius & Cooldown
    max_dist = 20.0 if request.urgency_level.lower() == "critical" else 10.0
    cooldown_threshold = datetime.utcnow() - timedelta(hours=24)

    # 4. Find all potential donors (including compatibility + cooldown)
    # Filter for compatible blood groups
    compatible_groups = BLOOD_COMPATIBILITY.get(request.blood_type, [request.blood_type])
    
    # Base query: Compatible blood type AND (never notified OR notified > 24h ago)
    # We still want to see potential donors even if unavailable, to rank them
    all_donors = db.query(models.Donor).filter(
        models.Donor.blood_group.in_(compatible_groups),
        (models.Donor.last_notified == None) | (models.Donor.last_notified < cooldown_threshold)
    ).all()
    
    nearby_donors = []
    for donor in all_donors:
        if donor.latitude and donor.longitude:
            dist = calculate_distance(
                hospital.latitude,
                hospital.longitude,
                donor.latitude,
                donor.longitude
            )
            if dist <= max_dist:
                donor.distance = round(dist, 2)
                nearby_donors.append(donor)

    # 5. Priority Ranking: Available first, then nearest
    nearby_donors.sort(key=lambda d: (not d.is_available, d.distance))

    # 6. SEND NOTIFICATIONS (Only to Available Donors)
    notified_donors = [d for d in nearby_donors if d.is_available]
    
    if twilio_client:
        for donor in notified_donors:
            try:
                to_phone = donor.phone.strip()
                if not to_phone.startswith('+'):
                    to_phone = f"+91{to_phone}"
                
                message_body = f"🚨 URGENT: Blood needed ({request.blood_type}) at {hospital.name}. Distance: {donor.distance}km. Please respond!"
                
                twilio_client.messages.create(
                    body=message_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=to_phone
                )
                # Update last_notified timestamp
                donor.last_notified = datetime.utcnow()
                print(f"[SMS SUCCESS] SMS sent to {donor.name}")
            except Exception as e:
                print(f"[SMS ERROR] Error sending SMS to {donor.phone}: {e}")
    else:
        # MOCK NOTIFICATIONS
        for donor in notified_donors:
            donor.last_notified = datetime.utcnow()
            print(f"[SMS MOCK] Sending SMS to {donor.name} ({donor.phone}) - Distance: {donor.distance}km")
    
    db.commit() # Save the updated last_notified timestamps

    # 5. Debug logs
    print(f"\n[ALERT] Blood Request Posted for {request.blood_type}")
    print(f"Urgency: {request.urgency_level} (Radius: {max_dist}km)")
    print(f"Hospital: {hospital.name}")
    print(f"Matched & Notified donors: {len(notified_donors)}")
    print("-" * 30)

    # Convert to serializable format
    # Return all nearby compatible donors so dashboard shows everyone in range
    return {
        "request": {
            "id": db_request.id,
            "hospital_id": db_request.hospital_id,
            "blood_type": db_request.blood_type,
            "units_required": db_request.units_required,
            "urgency_level": db_request.urgency_level,
            "message": db_request.message
        },
        "matched_donors": [
            {
                "id": d.id,
                "name": d.name,
                "phone": d.phone,
                "blood_group": d.blood_group,
                "distance": d.distance,
                "is_available": d.is_available
            } for d in nearby_donors
        ]
    }


# -----------------------------
# CREATE DONATION CAMP
# -----------------------------
@app.post("/camp", response_model=schemas.DonationCamp)
def create_donation_camp(camp: schemas.DonationCampCreate, db: Session = Depends(get_db)):
    # Prevent future duplicates (same name, location, and date)
    existing = db.query(models.DonationCamp).filter(
        models.DonationCamp.camp_name == camp.camp_name,
        models.DonationCamp.location == camp.location,
        models.DonationCamp.date == camp.date
    ).first()
    
    if existing:
        return existing # Or raise HTTPException if preferred
        
    db_camp = models.DonationCamp(**camp.dict())
    db.add(db_camp)
    db.commit()
    db.refresh(db_camp)
    return db_camp


@app.get("/news", response_model=List[schemas.DonationCamp])
def get_news(db: Session = Depends(get_db)):
    # Sort by date DESC and then ID DESC
    return db.query(models.DonationCamp).order_by(
        models.DonationCamp.date.desc(), 
        models.DonationCamp.id.desc()
    ).all()


# -----------------------------
# DISCOVER & FILTER DONORS
# -----------------------------
@app.get("/donors", response_model=List[schemas.Donor])
def get_donors(
    blood_group: Optional[str] = None, 
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(models.Donor)
    if blood_group:
        query = query.filter(models.Donor.blood_group == blood_group)
    if available_only:
        query = query.filter(models.Donor.is_available == True)
    return query.all()


# -----------------------------
# BLOOD REQUEST HISTORY
# -----------------------------
@app.get("/history/requests")
def get_request_history(db: Session = Depends(get_db)):
    requests = db.query(models.BloodRequest).order_by(models.BloodRequest.id.desc()).all()
    history = []
    for r in requests:
        history.append({
            "id": r.id,
            "hospital_name": r.hospital.name,
            "blood_type": r.blood_type,
            "units_required": r.units_required,
            "urgency_level": r.urgency_level,
            "message": r.message
        })
    return history


# -----------------------------
# STATS (FOR FRONTEND COUNTER)
# -----------------------------
@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    donor_count = db.query(models.Donor).count()
    hospital_count = db.query(models.Hospital).count()

    return {
        "donors": donor_count,
        "hospitals": hospital_count
    }


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)