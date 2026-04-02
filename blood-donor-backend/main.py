from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import math
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
from database import engine, get_db

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

    # 3. Find nearby donors (10km + blood group)
    nearby_donors = []
    all_donors = db.query(models.Donor).filter(models.Donor.blood_group == request.blood_type).all()
    
    for donor in all_donors:
        if donor.latitude and donor.longitude:
            dist = calculate_distance(
                hospital.latitude,
                hospital.longitude,
                donor.latitude,
                donor.longitude
            )
            if dist <= 10.0:
                nearby_donors.append(donor)

    # 4. SEND SMS NOTIFICATIONS
    if twilio_client:
        for donor in nearby_donors:
            try:
                # Format phone number for Twilio (ensure + prefix)
                to_phone = donor.phone.strip()
                if not to_phone.startswith('+'):
                    to_phone = f"+91{to_phone}"  # Assuming +91 as per project context
                
                message_body = f"🚨 URGENT: Blood needed ({request.blood_type}) at {hospital.name}. Please respond immediately."
                
                twilio_client.messages.create(
                    body=message_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=to_phone
                )
                print(f"[SMS SUCCESS] SMS sent to {donor.name}")
            except Exception as e:
                print(f"[SMS ERROR] Error sending SMS to {donor.phone}: {e}")
    else:
        # Fallback: Simulate notifications in the terminal
        for donor in nearby_donors:
            print(f"[SMS MOCK] Sending SMS to {donor.name} ({donor.phone})")

    # 5. Debug logs
    print(f"\n[ALERT] Blood Request Posted for {request.blood_type}")
    print(f"Hospital: {hospital.name}")
    print(f"Matched donors: {len(nearby_donors)}")
    print("-" * 30)

    # Convert to serializable format
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
                "blood_group": d.blood_group
            } for d in nearby_donors
        ]
    }


# -----------------------------
# CREATE DONATION CAMP
# -----------------------------
@app.post("/camp", response_model=schemas.DonationCamp)
def create_donation_camp(camp: schemas.DonationCampCreate, db: Session = Depends(get_db)):
    db_camp = models.DonationCamp(**camp.dict())
    db.add(db_camp)
    db.commit()
    db.refresh(db_camp)
    return db_camp


# -----------------------------
# GET COMMUNITY NEWS
# -----------------------------
@app.get("/news", response_model=List[schemas.DonationCamp])
def get_community_news(db: Session = Depends(get_db)):
    return db.query(models.DonationCamp).all()


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