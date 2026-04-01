from pydantic import BaseModel
from typing import List, Optional

class DonorBase(BaseModel):
    name: str
    phone: str
    email: str
    dob: str
    aadhar: str
    weight: float
    blood_group: str
    address_city: str
    address_state: str
    address_pin: str
    latitude: float
    longitude: float
    last_donation_date: str

class DonorCreate(DonorBase):
    pass

class Donor(DonorBase):
    id: int

    class Config:
        from_attributes = True

class HospitalBase(BaseModel):
    name: str
    registration_number: str
    hospital_type: str
    contact_details: str
    email: str
    in_charge_name: str
    number_of_beds: int
    opening_time: str
    closing_time: str
    address: str
    latitude: float
    longitude: float

class HospitalCreate(HospitalBase):
    pass

class Hospital(HospitalBase):
    id: int

    class Config:
        from_attributes = True

class BloodRequestBase(BaseModel):
    hospital_id: int
    blood_type: str
    units_required: int
    urgency_level: str
    message: str

class BloodRequestCreate(BloodRequestBase):
    pass

class BloodRequest(BloodRequestBase):
    id: int

    class Config:
        from_attributes = True

class BloodRequestResponse(BaseModel):
    request: BloodRequest
    notified_donors: List[Donor]
    other_donors: List[Donor]

class DonationCampBase(BaseModel):
    hospital_id: int
    camp_name: str
    date: str
    location: str

class DonationCampCreate(DonationCampBase):
    pass

class DonationCamp(DonationCampBase):
    id: int

    class Config:
        from_attributes = True
