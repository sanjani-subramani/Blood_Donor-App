from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import math

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

    # 4. Debug logs
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
        "notified_donors": [
            {
                "id": d.id,
                "name": d.name,
                "phone": d.phone,
                "blood_group": d.blood_group
            } for d in nearby_donors[:3]
        ],
        "other_donors": [
            {
                "id": d.id,
                "name": d.name,
                "phone": d.phone,
                "blood_group": d.blood_group
            } for d in nearby_donors[3:]
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