import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerDonor } from './services/api';
import './DonorRegistration.css';

const DonorRegistration = () => {
    // ... same state and logic ...
    const initialFormData = {
        name: '',
        phone: '',
        email: '',
        dob: '',
        aadhar: '',
        weight: '',
        blood_group: '',
        address: '', // From donorAddress textarea
        address_city: '',
        address_state: '',
        address_pin: '',
        latitude: '',
        longitude: '',
        last_donation_date: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [notificationsAgreed, setNotificationsAgreed] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleChange = (e) => {
        const { id, value, name } = e.target;
        // In home.html, IDs were used. I'll map them to our internal state.
        const fieldMap = {
            'donorName': 'name',
            'donorPhone': 'phone',
            'donorEmail': 'email',
            'donorDob': 'dob',
            'donorAadhar': 'aadhar',
            'donorWeight': 'weight',
            'donorAddress': 'address',
            'donorCity': 'address_city',
            'donorState': 'address_state',
            'donorPin': 'address_pin',
            'donorLat': 'latitude',
            'donorLng': 'longitude',
            'lastDonation': 'last_donation_date'
        };

        setFormData(prev => ({
            ...prev,
            [fieldMap[id] || name]: value
        }));
    };

    const selectBloodType = (type) => {
        setFormData(prev => ({ ...prev, blood_group: type }));
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
        
        if (!formData.blood_group) {
            alert('Please select your blood type');
            return;
        }

        if (!termsAgreed) {
            alert('Please agree to the Terms and Conditions');
            return;
        }

        setIsSubmitting(true);
        setIsSuccess(false);

        try {
            // Mapping internal state to what registerDonor expects if different
            // Based on previous task, registerDonor takes data directly.
            // But we should ensure mandatory fields are filled.
            await registerDonor(formData);
            setIsSuccess(true);
            setFormData(initialFormData);
            setTermsAgreed(false);
            setNotificationsAgreed(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error registering donor:', error);
            alert('Failed to register donor. Please check if the backend is running.');
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
                            <i className="fas fa-user-plus fa-4x text-danger mb-3"></i>
                            <h2>Donor Registration</h2>
                            <p className="text-muted">Join our community of life savers</p>
                        </div>
                        
                        {!isSuccess ? (
                            <form id="donorForm" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-user"></i> Full Name *</label>
                                            <input type="text" className="form-control" id="donorName" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-phone"></i> Phone Number *</label>
                                            <input type="tel" className="form-control" id="donorPhone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-envelope"></i> Email Address *</label>
                                            <input type="email" className="form-control" id="donorEmail" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-calendar"></i> Date of Birth *</label>
                                            <input type="date" className="form-control" id="donorDob" value={formData.dob} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-id-card"></i> Aadhar Number *</label>
                                            <input type="text" className="form-control" id="donorAadhar" placeholder="XXXX XXXX XXXX" maxLength="14" value={formData.aadhar} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label"><i className="fas fa-weight"></i> Weight (kg) *</label>
                                            <input type="number" className="form-control" id="donorWeight" placeholder="50" min="45" value={formData.weight} onChange={handleChange} required />
                                            <small className="text-muted">Minimum 45kg required</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label"><i className="fas fa-tint"></i> Blood Type *</label>
                                    <div className="blood-type-grid">
                                        {bloodGroups.map(type => (
                                            <div 
                                                key={type}
                                                className={`blood-type-option ${formData.blood_group === type ? 'selected' : ''}`} 
                                                onClick={() => selectBloodType(type)}
                                            >
                                                <strong>{type}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-map-marker-alt"></i> Address *</label>
                                    <textarea className="form-control" id="donorAddress" rows="3" placeholder="Enter your complete address" value={formData.address} onChange={handleChange} required></textarea>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">City *</label>
                                            <input type="text" className="form-control" id="donorCity" placeholder="Your city" value={formData.address_city} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">State *</label>
                                            <input type="text" className="form-control" id="donorState" placeholder="Your state" value={formData.address_state} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">PIN Code *</label>
                                            <input type="text" className="form-control" id="donorPin" placeholder="110001" maxLength="6" value={formData.address_pin} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Latitude</label>
                                            <input type="number" step="0.000001" className="form-control" id="donorLat" placeholder="28.6139" value={formData.latitude} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Longitude</label>
                                            <input type="number" step="0.000001" className="form-control" id="donorLng" placeholder="77.2090" value={formData.longitude} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <button type="button" className="btn btn-outline-secondary" onClick={getLocation}>
                                        <i className="fas fa-crosshairs"></i> Use My Current Location
                                    </button>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label"><i className="fas fa-calendar-alt"></i> Last Donation Date (if any)</label>
                                    <input type="date" className="form-control" id="lastDonation" value={formData.last_donation_date} onChange={handleChange} />
                                    <small className="text-muted">Leave blank if you're a first-time donor</small>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="donorTerms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} required />
                                        <label className="form-check-label" htmlFor="donorTerms">
                                            I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="donorNotifications" checked={notificationsAgreed} onChange={(e) => setNotificationsAgreed(e.target.checked)} />
                                        <label className="form-check-label" htmlFor="donorNotifications">
                                            I want to receive SMS/WhatsApp notifications for urgent blood requests
                                        </label>
                                    </div>
                                </div>
                                
                                <button type="submit" className="btn btn-donor w-100 py-3" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-check"></i> Complete Registration
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div id="donorSuccess" className="success-message">
                                <i className="fas fa-check-circle fa-2x mb-3"></i>
                                <h4>Registration Successful!</h4>
                                <p>Thank you for joining our community of life savers. You'll receive notifications when hospitals near you need your blood type.</p>
                                <button className="btn btn-light mt-3" onClick={() => setIsSuccess(false)}>Register Another Donor</button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="col-md-4">
                    <div className="requirements-card">
                        <h5><i className="fas fa-info-circle text-primary"></i> Donor Requirements</h5>
                        <ul className="list-unstyled">
                            <li><i className="fas fa-check text-success"></i> Age: 18-65 years</li>
                            <li><i className="fas fa-check text-success"></i> Weight: Minimum 45kg</li>
                            <li><i className="fas fa-check text-success"></i> Good general health</li>
                            <li><i className="fas fa-check text-success"></i> No recent illness</li>
                            <li><i className="fas fa-check text-success"></i> 3 months gap between donations</li>
                        </ul>
                    </div>
                    
                    <div className="requirements-card mt-3">
                        <h5><i className="fas fa-heart text-danger"></i> Benefits</h5>
                        <ul className="list-unstyled">
                            <li><i className="fas fa-check text-success"></i> Save up to 3 lives per donation</li>
                            <li><i className="fas fa-check text-success"></i> Free health checkup</li>
                            <li><i className="fas fa-check text-success"></i> Donation certificate</li>
                            <li><i className="fas fa-check text-success"></i> Community recognition</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorRegistration;
