import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerHospital } from './services/api';
import './DonorRegistration.css';

const HospitalRegistration = () => {
    // ... initialFormData and state ...
    const initialFormData = {
        hospital_name: '',
        registration_number: '',
        hospital_type: '',
        contact_number: '',
        emergency_contact: '',
        email: '',
        incharge_name: '',
        incharge_contact: '', // Map from inchargePhone
        number_of_beds: '',
        opening_time: '',
        closing_time: '',
        address_street: '', // Map from hospitalAddress
        address_city: '',
        address_state: '',
        address_pin: '',
        latitude: '',
        longitude: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        const fieldMap = {
            'hospitalName': 'hospital_name',
            'hospitalRegNo': 'registration_number',
            'hospitalType': 'hospital_type',
            'hospitalPhone': 'contact_number',
            'hospitalEmergencyPhone': 'emergency_contact',
            'hospitalEmail': 'email',
            'bloodBankIncharge': 'incharge_name',
            'inchargePhone': 'incharge_contact',
            'hospitalBeds': 'number_of_beds',
            'hospitalOpenTime': 'opening_time',
            'hospitalCloseTime': 'closing_time',
            'hospitalAddress': 'address_street',
            'hospitalCity': 'address_city',
            'hospitalState': 'address_state',
            'hospitalPin': 'address_pin',
            'hospitalLat': 'latitude',
            'hospitalLng': 'longitude'
        };

        setFormData(prev => ({
            ...prev,
            [fieldMap[id]]: value
        }));
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                    alert('Location captured successfully!');
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!termsAgreed) {
            alert('Please agree to the Terms and Conditions');
            return;
        }

        setIsSubmitting(true);
        setIsSuccess(false);

        // Map frontend fields to backend schema (HospitalCreate model)
        const payload = {
            name: formData.hospital_name,
            registration_number: formData.registration_number,
            hospital_type: formData.hospital_type,
            contact_details: `Primary: ${formData.contact_number}, Emergency: ${formData.emergency_contact}, In-charge Phone: ${formData.incharge_contact}`,
            email: formData.email,
            in_charge_name: formData.incharge_name,
            number_of_beds: parseInt(formData.number_of_beds, 10),
            opening_time: formData.opening_time,
            closing_time: formData.closing_time,
            address: `${formData.address_street}, ${formData.address_city}, ${formData.address_state} - ${formData.address_pin}`,
            latitude: parseFloat(formData.latitude) || 0.0,
            longitude: parseFloat(formData.longitude) || 0.0
        };

        console.log("Submitting hospital registration payload:", payload);

        try {
            await registerHospital(payload);
            setIsSuccess(true);
            setFormData(initialFormData);
            setTermsAgreed(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error registering hospital:', error);
            alert('Failed to register hospital. Please check if the backend is running and data is valid.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="registration-page">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="feature-card">
                        <Link to="/" className="btn btn-back mb-3 d-inline-flex align-items-center">
                            <i className="fas fa-arrow-left me-2"></i> Back to Home
                        </Link>
                        
                        <div className="text-center mb-4">
                            <i className="fas fa-hospital fa-4x text-primary mb-3"></i>
                            <h2>Hospital Registration</h2>
                            <p className="text-muted">Join our network to access urgent blood donors</p>
                        </div>
                        
                        {!isSuccess ? (
                            <form id="hospitalForm" onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-hospital"></i> Hospital Name *</label>
                                    <input type="text" className="form-control" id="hospitalName" placeholder="Enter hospital name" value={formData.hospital_name} onChange={handleChange} required />
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-id-badge"></i> Registration Number *</label>
                                            <input type="text" className="form-control" id="hospitalRegNo" placeholder="Hospital registration number" value={formData.registration_number} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-list"></i> Hospital Type *</label>
                                            <select className="form-control" id="hospitalType" value={formData.hospital_type} onChange={handleChange} required>
                                                <option value="">Select Type</option>
                                                <option value="government">Government Hospital</option>
                                                <option value="private">Private Hospital</option>
                                                <option value="charitable">Charitable/Trust Hospital</option>
                                                <option value="specialty">Specialty Hospital</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-phone"></i> Primary Contact Number *</label>
                                            <input type="tel" className="form-control" id="hospitalPhone" placeholder="+91 XXXXX XXXXX" value={formData.contact_number} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-phone-alt"></i> Emergency Contact Number *</label>
                                            <input type="tel" className="form-control" id="hospitalEmergencyPhone" placeholder="+91 XXXXX XXXXX" value={formData.emergency_contact} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-envelope"></i> Official Email Address *</label>
                                    <input type="email" className="form-control" id="hospitalEmail" placeholder="contact@hospital.com" value={formData.email} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-user-md"></i> Blood Bank In-charge Name *</label>
                                    <input type="text" className="form-control" id="bloodBankIncharge" placeholder="Dr. Name" value={formData.incharge_name} onChange={handleChange} required />
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-phone"></i> In-charge Contact *</label>
                                            <input type="tel" className="form-control" id="inchargePhone" placeholder="+91 XXXXX XXXXX" value={formData.incharge_contact} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-bed"></i> Number of Beds *</label>
                                            <input type="number" className="form-control" id="hospitalBeds" placeholder="100" value={formData.number_of_beds} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-clock"></i> Opening Time *</label>
                                            <input type="time" className="form-control" id="hospitalOpenTime" value={formData.opening_time} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-clock"></i> Closing Time *</label>
                                            <input type="time" className="form-control" id="hospitalCloseTime" value={formData.closing_time} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-map-marker-alt"></i> Complete Address *</label>
                                    <textarea className="form-control" id="hospitalAddress" rows="3" placeholder="Enter complete hospital address" value={formData.address_street} onChange={handleChange} required></textarea>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">City *</label>
                                            <input type="text" className="form-control" id="hospitalCity" placeholder="City name" value={formData.address_city} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">State *</label>
                                            <input type="text" className="form-control" id="hospitalState" placeholder="State name" value={formData.address_state} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">PIN Code *</label>
                                            <input type="text" className="form-control" id="hospitalPin" placeholder="110001" maxLength="6" value={formData.address_pin} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Latitude</label>
                                            <input type="number" step="0.000001" className="form-control" id="hospitalLat" placeholder="28.6139" value={formData.latitude} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Longitude</label>
                                            <input type="number" step="0.000001" className="form-control" id="hospitalLng" placeholder="77.2090" value={formData.longitude} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <button type="button" className="btn btn-outline-secondary" onClick={getLocation}>
                                        <i className="fas fa-crosshairs"></i> Use Current Location
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="hospitalTerms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} required />
                                        <label className="form-check-label" htmlFor="hospitalTerms">
                                            I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                                        </label>
                                    </div>
                                </div>
                                
                                <button type="submit" className="btn btn-hospital w-100 py-3" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-hospital-user"></i> Complete Registration
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div id="hospitalSuccess" className="success-message">
                                <i className="fas fa-check-circle fa-2x mb-3"></i>
                                <h4>Hospital Registration Successful!</h4>
                                <p>Thank you for joining our network. You can now post urgent blood requests and save lives.</p>
                                <button className="btn btn-light mt-3" onClick={() => setIsSuccess(false)}>Register Another Hospital</button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="requirements-card">
                        <h5><i className="fas fa-info-circle text-primary"></i> Hospital Requirements</h5>
                        <ul className="list-unstyled">
                            <li><i className="fas fa-check text-success"></i> Valid government registration</li>
                            <li><i className="fas fa-check text-success"></i> 24/7 emergency contact</li>
                            <li><i className="fas fa-check text-success"></i> On-site blood storage facility</li>
                            <li><i className="fas fa-check text-success"></i> Responsible personnel for requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalRegistration;
