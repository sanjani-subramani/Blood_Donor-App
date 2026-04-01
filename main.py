from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import sqlite3
import hashlib
from datetime import datetime, timedelta
import math
import os

app = FastAPI(title="Blood Donor Alert Platform", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
def init_db():
    conn = sqlite3.connect('blood_donor.db')
    cursor = conn.cursor()
    
    # Donors table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        dob TEXT NOT NULL,
        aadhar TEXT NOT NULL,
        weight REAL NOT NULL,
        blood_type TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        last_donation DATE,
        receive_notifications BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
    )
    ''')
    
    # Hospitals table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_no TEXT NOT NULL UNIQUE,
        hospital_type TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        emergency_phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        incharge_name TEXT NOT NULL,
        incharge_phone TEXT NOT NULL,
        num_beds INTEGER NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        services TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Blood requests table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS blood_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id INTEGER NOT NULL,
        blood_type TEXT NOT NULL,
        units_needed INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (hospital_id) REFERENCES hospitals (id)
    )
    ''')
    
    # Donor responses table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS donor_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        donor_id INTEGER NOT NULL,
        response TEXT NOT NULL,
        responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES blood_requests (id),
        FOREIGN KEY (donor_id) REFERENCES donors (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class DonorRegistration(BaseModel):
    name: str
    phone: str
    email: str
    dob: str
    aadhar: str
    weight: float
    blood_type: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    last_donation: Optional[str] = None
    receive_notifications: bool = True

class HospitalRegistration(BaseModel):
    name: str = Field(alias='hospitalName')
    reg_no: str = Field(alias='hospitalRegNo')
    hospital_type: str = Field(alias='hospitalType')
    phone: str = Field(alias='hospitalPhone')
    emergency_phone: str = Field(alias='hospitalEmergencyPhone')
    email: str = Field(alias='hospitalEmail')
    incharge_name: str = Field(alias='bloodBankIncharge')
    incharge_phone: str = Field(alias='inchargePhone')
    num_beds: int = Field(alias='hospitalBeds')
    address: str = Field(alias='hospitalAddress')
    city: str = Field(alias='hospitalCity')
    state: str = Field(alias='hospitalState')
    pincode: str = Field(alias='hospitalPin')
    latitude: float = Field(alias='hospitalLat')
    longitude: float = Field(alias='hospitalLng')
    open_time: str = Field(alias='hospitalOpenTime')
    close_time: str = Field(alias='hospitalCloseTime')
    services: Optional[List[str]] = None

class BloodRequest(BaseModel):
    hospital_id: int
    blood_type: str
    units_needed: int
    urgency: str  # "low", "medium", "high", "critical"
    message: Optional[str] = None
    expires_hours: Optional[int] = 24

class DonorResponse(BaseModel):
    request_id: int
    donor_id: int
    response: str  # "available", "not_available"

# Utility functions
def get_db():
    conn = sqlite3.connect('blood_donor.db')
    conn.row_factory = sqlite3.Row
    return conn

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers"""
    R = 6371  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    return R * c

# This function sends a simulated message to the terminal.
def send_sms(phone, message):
    print(f"SMS would be sent to {phone}: {message}")
    return True

# API Endpoints
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>Blood Donor Alert Platform</title></head>
        <body>
            <h1>🩸 Blood Donor Alert Platform API</h1>
            <p>Backend is running successfully!</p>
            <p><a href="/docs">View API Documentation</a></p>
        </body>
    </html>
    """

@app.post("/register/donor")
async def register_donor(donor: DonorRegistration):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO donors (name, phone, email, dob, aadhar, weight, blood_type, address, city, state, pincode, latitude, longitude, last_donation, receive_notifications)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            donor.name, donor.phone, donor.email, donor.dob, donor.aadhar, donor.weight, 
            donor.blood_type, donor.address, donor.city, donor.state, donor.pincode, 
            donor.latitude, donor.longitude, donor.last_donation, donor.receive_notifications
        ))
        
        donor_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"message": "Donor registered successfully", "donor_id": donor_id}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Phone or email already registered")

@app.post("/register/hospital")
async def register_hospital(hospital: HospitalRegistration):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO hospitals (name, reg_no, hospital_type, phone, emergency_phone, email, incharge_name, incharge_phone, num_beds, address, city, state, pincode, latitude, longitude, open_time, close_time, services)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            hospital.name, hospital.reg_no, hospital.hospital_type, hospital.phone, 
            hospital.emergency_phone, hospital.email, hospital.incharge_name, 
            hospital.incharge_phone, hospital.num_beds, hospital.address, 
            hospital.city, hospital.state, hospital.pincode, hospital.latitude, 
            hospital.longitude, hospital.open_time, hospital.close_time, 
            str(hospital.services) if hospital.services else None
        ))
        
        hospital_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"message": "Hospital registered successfully", "hospital_id": hospital_id}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Phone, registration number, or email already registered")

@app.post("/request/blood")
async def create_blood_request(request: BloodRequest):
    conn = get_db()
    cursor = conn.cursor()
    
    # Calculate expiry time
    expires_at = datetime.now() + timedelta(hours=request.expires_hours)
    
    cursor.execute('''
        INSERT INTO blood_requests (hospital_id, blood_type, units_needed, urgency, message, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        request.hospital_id, request.blood_type, request.units_needed, 
        request.urgency, request.message, expires_at
    ))
    
    request_id = cursor.lastrowid
    
    # Get hospital details
    cursor.execute('SELECT * FROM hospitals WHERE id = ?', (request.hospital_id,))
    hospital = cursor.fetchone()
    
    if not hospital:
        conn.close()
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # --- PRIORITY SCHEDULING LOGIC ---
    # 1. Find all eligible donors who have the matching blood type
    cursor.execute('''
        SELECT * FROM donors 
        WHERE blood_type = ? AND is_active = 1
    ''', (request.blood_type,))
    all_eligible_donors = cursor.fetchall()
    
    # 2. Sort donors by distance to the hospital (closest first)
    donors_with_distance = []
    for donor in all_eligible_donors:
        distance = calculate_distance(
            hospital['latitude'], hospital['longitude'],
            donor['latitude'], donor['longitude']
        )
        donors_with_distance.append({'donor_id': donor['id'], 'distance': distance, 'phone': donor['phone'], 'name': donor['name']})
    
    donors_with_distance.sort(key=lambda x: x['distance'])
    
    # 3. Select the top N donors and mark the rest as 'not_selected'
    top_donors = donors_with_distance[:request.units_needed]
    all_other_donors = donors_with_distance[request.units_needed:]
    
    # 4. Save the responses to the database
    for top_donor in top_donors:
        cursor.execute('''
            INSERT INTO donor_responses (request_id, donor_id, response)
            VALUES (?, ?, ?)
        ''', (request_id, top_donor['donor_id'], 'available'))
        
        # Simulate sending a notification to the top donors
        urgency_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴", "critical": "🚨"}
        message = f"{urgency_emoji.get(request.urgency, '🩸')} URGENT: {hospital['name']} needs {request.blood_type} blood ({request.units_needed} units). Distance: {top_donor['distance']:.1f}km. We've selected you as a top priority. Please contact the hospital at {hospital['phone']}."
        send_sms(top_donor['phone'], message)
        
    for other_donor in all_other_donors:
        cursor.execute('''
            INSERT INTO donor_responses (request_id, donor_id, response)
            VALUES (?, ?, ?)
        ''', (request_id, other_donor['donor_id'], 'not_selected'))

    conn.commit()
    conn.close()
    
    return {
        "message": f"Blood request created successfully. {len(top_donors)} donors notified.",
        "request_id": request_id,
        "notified_donors": [d['name'] for d in top_donors],
        "not_selected_donors": [d['name'] for d in all_other_donors]
    }

@app.post("/respond")
async def donor_respond(response: DonorResponse):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO donor_responses (request_id, donor_id, response)
        VALUES (?, ?, ?)
    ''', (response.request_id, response.donor_id, response.response))
    
    conn.commit()
    conn.close()
    
    return {"message": "Response recorded successfully"}

@app.get("/dashboard/hospital/{hospital_id}")
async def hospital_dashboard(hospital_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM hospitals WHERE id = ?', (hospital_id,))
    hospital_data = cursor.fetchone()
    if not hospital_data:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    cursor.execute('''
        SELECT br.*, COUNT(CASE WHEN dr.response = 'available' THEN 1 END) as available_responses,
                     COUNT(CASE WHEN dr.response = 'not_selected' THEN 1 END) as not_selected_responses
        FROM blood_requests br
        LEFT JOIN donor_responses dr ON br.id = dr.request_id
        WHERE br.hospital_id = ?
        GROUP BY br.id
        ORDER BY br.created_at DESC
    ''', (hospital_id,))
    
    requests = [dict(row) for row in cursor.fetchall()]
    
    response_data = []
    for req in requests:
        cursor.execute('''
            SELECT d.name, d.phone, d.blood_type, dr.response
            FROM donor_responses dr
            JOIN donors d ON dr.donor_id = d.id
            WHERE dr.request_id = ?
            ORDER BY dr.responded_at
        ''', (req['id'],))
        
        donors_for_request = [dict(row) for row in cursor.fetchall()]
        
        response_data.append({
            "request_id": req['id'],
            "blood_type": req['blood_type'],
            "units_needed": req['units_needed'],
            "urgency": req['urgency'],
            "available_donors_count": req['available_responses'],
            "notified_donors": [d for d in donors_for_request if d['response'] == 'available'],
            "not_selected_donors": [d for d in donors_for_request if d['response'] == 'not_selected']
        })
    
    conn.close()
    return {"hospital_name": hospital_data['name'], "requests": response_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)