import requests

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("--- 1. Register QA Hospital ---")
    hosp_data = {
        "name": "QA Central Hospital",
        "registration_number": "QA-HOSP-001",
        "hospital_type": "Specialty",
        "contact_details": "080-12345678",
        "email": "qa@centralhosp.com",
        "in_charge_name": "QA Lead",
        "number_of_beds": 50,
        "opening_time": "00:00",
        "closing_time": "23:59",
        "address": "MG Road, Bangalore",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    r = requests.post(f"{BASE_URL}/register/hospital", json=hosp_data)
    if r.status_code != 200:
        print(f"Failed to register hospital: {r.text}")
        return
    h_id = r.json()['id']
    print(f"Registered QA Hospital ID: {h_id}")

    print("\n--- 2. Register QA Donors ---")
    donors = [
        {
            "name": "QA Near A+", "phone": "9000000001", "email": "d1@qa.com", "dob": "1990-01-01", "aadhar": "111122223333",
            "weight": 70.0, "blood_group": "A+", "address_city": "Bangalore", "address_state": "Karnataka",
            "address_pin": "560001", "latitude": 12.9816, "longitude": 77.6046, "last_donation_date": "", "is_available": True
        },
        {
            "name": "QA Far Critical A+", "phone": "9000000002", "email": "d2@qa.com", "dob": "1990-01-01", "aadhar": "444455556666",
            "weight": 75.0, "blood_group": "A+", "address_city": "Bangalore", "address_state": "Karnataka",
            "address_pin": "560064", "latitude": 13.1016, "longitude": 77.7246, "last_donation_date": "", "is_available": True
        },
        {
            "name": "QA Universal Donor O-", "phone": "9000000003", "email": "d3@qa.com", "dob": "1990-01-01", "aadhar": "777788889999",
            "weight": 65.0, "blood_group": "O-", "address_city": "Bangalore", "address_state": "Karnataka",
            "address_pin": "560008", "latitude": 12.9916, "longitude": 77.6146, "last_donation_date": "", "is_available": True
        }
    ]
    for i, d in enumerate(donors):
        r = requests.post(f"{BASE_URL}/register/donor", json=d)
        if r.status_code != 200:
            print(f"Failed to register donor {i}: {r.text}")
        else:
            print(f"Registered {d['name']}")

    print("\n--- 3. Testing Standard Request (10km, A+, High) ---")
    req_data = {
        "hospital_id": h_id,
        "blood_type": "A+",
        "units_required": 1,
        "urgency_level": "high",
        "message": "Standard test"
    }
    r = requests.post(f"{BASE_URL}/request/blood", json=req_data)
    if r.status_code == 200:
        matches = r.json().get('matched_donors', [])
        print(f"Standard request matched {len(matches)} donors.")
        for m in matches:
            print(f" - {m['name']} ({m.get('distance')} km)")
    else:
        print(f"Request failed: {r.text}")

    print("\n--- 4. Testing Critical Request (20km, A+, Critical) ---")
    req_data["urgency_level"] = "critical"
    req_data["message"] = "Critical test"
    r = requests.post(f"{BASE_URL}/request/blood", json=req_data)
    if r.status_code == 200:
        matches = r.json().get('matched_donors', [])
        print(f"Critical request matched {len(matches)} donors.")
        for m in matches:
            print(f" - {m['name']} ({m.get('distance')} km)")
    else:
        print(f"Request failed: {r.text}")

    print("\n--- 5. Testing Cooldown (Immediate Repeat) ---")
    r = requests.post(f"{BASE_URL}/request/blood", json=req_data)
    if r.status_code == 200:
        matches = r.json().get('matched_donors', [])
        print(f"Cooldown check matched {len(matches)} donors. (Expected fewer or 0)")
        for m in matches:
            print(f" - {m['name']} ({m.get('distance')} km)")
    else:
        print(f"Request failed: {r.text}")

if __name__ == '__main__':
    run_tests()
