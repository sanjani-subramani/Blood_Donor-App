from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    email = Column(String)
    dob = Column(String)
    aadhar = Column(String)
    weight = Column(Float)
    blood_group = Column(String)
    address_city = Column(String)
    address_state = Column(String)
    address_pin = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    last_donation_date = Column(String)

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    registration_number = Column(String)
    hospital_type = Column(String)
    contact_details = Column(String)
    email = Column(String)
    in_charge_name = Column(String)
    number_of_beds = Column(Integer)
    opening_time = Column(String)
    closing_time = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    blood_type = Column(String)
    units_required = Column(Integer)
    urgency_level = Column(String)
    message = Column(String)

    hospital = relationship("Hospital")

class DonationCamp(Base):
    __tablename__ = "donation_camps"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    camp_name = Column(String)
    date = Column(String)
    location = Column(String)

    hospital = relationship("Hospital")
