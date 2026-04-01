import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("Testing Backend Flow...")

    # 1. Register Hospital
    print("Registering Hospital...")
    hospital_data = {
        "name": "City Hospital",
        "registration_number": "H123",
        "hospital_type": "General",
        "contact_details": "1234567890",
        "email": "hosp@test.com",
        "in_charge_name": "Dr. Smith",
        "number_of_beds": 50,
        "opening_time": "09:00 AM",
        "closing_time": "09:00 PM",
        "address": "Bangalore",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    h_resp = requests.post(f"{BASE_URL}/register/hospital", json=hospital_data)
    hospital_id = h_resp.json()["id"]
    print(f"Hospital Registered ID: {hospital_id}")

    # 2. Register Donor 1 (Nearby - ~1.1km)
    donor1_data = {
        "name": "Nearby Donor",
        "phone": "9999999991",
        "email": "donor1@test.com",
        "dob": "1990-01-01",
        "aadhar": "123456789012",
        "weight": 70.0,
        "blood_group": "A+",
        "address_city": "Bangalore",
        "address_state": "Karnataka",
        "address_pin": "560001",
        "latitude": 12.9800,
        "longitude": 77.6000,
        "last_donation_date": "2024-01-01"
    }
    requests.post(f"{BASE_URL}/register/donor", json=donor1_data)
    print("Donor 1 (Nearby) Registered")

    # 3. Register Donor 2 (Far - ~14km)
    donor2_data = {
        "name": "Far Donor",
        "phone": "9999999992",
        "email": "donor2@test.com",
        "dob": "1990-02-01",
        "aadhar": "123456789013",
        "weight": 75.0,
        "blood_group": "A+",
        "address_city": "Bangalore North",
        "address_state": "Karnataka",
        "address_pin": "560064",
        "latitude": 13.1000,
        "longitude": 77.6000,
        "last_donation_date": "2024-02-01"
    }
    requests.post(f"{BASE_URL}/register/donor", json=donor2_data)
    print("Donor 2 (Far) Registered")

    # 4. Post Blood Request
    request_data = {
        "hospital_id": hospital_id,
        "blood_type": "A+",
        "units_required": 2,
        "urgency_level": "High",
        "message": "Urgent A+ blood needed."
    }
    print("Posting Blood Request...")
    r_resp = requests.post(f"{BASE_URL}/request/blood", json=request_data)
    print(f"Response Status: {r_resp.status_code}")
    print("Check backend console output for donor notifications.")

    # 5. Create Donation Camp (News)
    camp_data = {
        "hospital_id": hospital_id,
        "camp_name": "Blood Drive 2024",
        "date": "2024-05-10",
        "location": "Central Park"
    }
    requests.post(f"{BASE_URL}/camp", json=camp_data)
    print("Donation Camp Created")

    # 6. Fetch News
    n_resp = requests.get(f"{BASE_URL}/news")
    print(f"News Sample: {n_resp.json()[0]['camp_name']}")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"Error: {e}")
