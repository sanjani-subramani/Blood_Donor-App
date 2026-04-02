import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerDonor } from './services/api';
import './DonorRegistration.css';

const DonorRegistration = () => {
    const initialFormData = {
        name: '',
        phone: '',
        email: '',
        dob: '',
        aadhar: '',
        weight: '',
        blood_group: '',
        address: '',
        address_city: '',
        address_state: '',
        address_pin: '',
        latitude: '',
        longitude: '',
        last_donation_date: '',
        is_available: true
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleChange = (e) => {
        const { id, value, name, type, checked } = e.target;
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
            'lastDonation': 'last_donation_date',
            'availSwitch': 'is_available'
        };

        setFormData(prev => ({
            ...prev,
            [fieldMap[id] || name]: type === 'checkbox' ? checked : value
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
                },
                (error) => {
                    setError('Error getting location: ' + error.message);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        
        if (!formData.blood_group) {
            setError('Please select your blood type');
            return;
        }

        if (!termsAgreed) {
            setError('Please agree to the Terms and Conditions');
            return;
        }

        setIsSubmitting(true);

        try {
            await registerDonor(formData);
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Submission Error:", err);
            setError("Failed to register. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="registration-page container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="feature-card text-center p-5 animate__animated animate__fadeIn">
                            <i className="fas fa-check-circle fa-5x text-success mb-4 text-gradient"></i>
                            <h2 className="text-success mb-3">Registration Successful!</h2>
                            <p className="text-muted lead">You are now a part of our life-saving network. We will notify you when someone nearby needs your blood type.</p>
                            <Link to="/" className="btn btn-danger btn-lg px-5 mt-4 rounded-pill shadow">
                                <i className="fas fa-home me-2"></i> Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-page container py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="feature-card p-4 p-md-5">
                        <Link to="/" className="btn btn-back mb-3 d-inline-flex align-items-center">
                            <i className="fas fa-arrow-left me-2"></i> Back
                        </Link>

                        <div className="text-center mb-4">
                            <i className="fas fa-user-plus fa-4x text-danger mb-3 pulse"></i>
                            <h2 className="text-danger">Donor Registration</h2>
                            <p className="text-muted">Join our emergency network and help save lives.</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger fade show border-0 shadow-sm mb-4" role="alert">
                                <i className="fas fa-exclamation-circle me-2"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Personal Details Section */}
                            <div className="form-section mb-4">
                                <h5 className="section-title mb-4 border-bottom pb-2 text-secondary">
                                    <i className="fas fa-user me-2 text-danger"></i> Personal Details
                                </h5>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Full Name *</label>
                                        <input type="text" className="form-control" id="donorName" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Date of Birth *</label>
                                        <input type="date" className="form-control" id="donorDob" value={formData.dob} onChange={handleChange} required />
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Phone Number *</label>
                                        <input type="tel" className="form-control" id="donorPhone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Email Address *</label>
                                        <input type="email" className="form-control" id="donorEmail" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Aadhar Number *</label>
                                        <input type="text" className="form-control" id="donorAadhar" placeholder="XXXX XXXX XXXX" maxLength="14" value={formData.aadhar} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Weight (kg) *</label>
                                        <input type="number" className="form-control" id="donorWeight" placeholder="50" min="45" value={formData.weight} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Medical Info Section */}
                            <div className="form-section mb-4">
                                <h5 className="section-title mb-4 border-bottom pb-2 text-secondary">
                                    <i className="fas fa-tint me-2 text-danger"></i> Medical Info
                                </h5>
                                <div className="mb-4">
                                    <label className="form-label text-muted ms-1 small">Blood Type *</label>
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

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Last Donation Date</label>
                                        <input type="date" className="form-control" id="lastDonation" value={formData.last_donation_date} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3 d-flex align-items-end">
                                        <div className="form-check form-switch p-0 ms-2 d-flex align-items-center mb-2">
                                            <label className="form-check-label me-auto text-muted small" htmlFor="availSwitch">Available for immediate donation?</label>
                                            <input className="form-check-input ms-3" type="checkbox" id="availSwitch" checked={formData.is_available} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="form-section mb-4">
                                <h5 className="section-title mb-4 border-bottom pb-2 text-secondary">
                                    <i className="fas fa-map-marker-alt me-2 text-danger"></i> Location Details
                                </h5>
                                <div className="mb-3">
                                    <label className="form-label text-muted ms-1 small">Full Address *</label>
                                    <textarea className="form-control" id="donorAddress" rows="2" placeholder="Street, Colony, House No." value={formData.address} onChange={handleChange} required></textarea>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted ms-1 small">City *</label>
                                        <input type="text" className="form-control" id="donorCity" placeholder="City" value={formData.address_city} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted ms-1 small">State *</label>
                                        <input type="text" className="form-control" id="donorState" placeholder="State" value={formData.address_state} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted ms-1 small">PIN Code *</label>
                                        <input type="text" className="form-control" id="donorPin" placeholder="XXXXXX" maxLength="6" value={formData.address_pin} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Latitude</label>
                                        <input type="number" step="any" className="form-control bg-light" id="donorLat" value={formData.latitude} onChange={handleChange} readOnly />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted ms-1 small">Longitude</label>
                                        <input type="number" step="any" className="form-control bg-light" id="donorLng" value={formData.longitude} onChange={handleChange} readOnly />
                                    </div>
                                </div>
                                
                                <button type="button" className="btn btn-outline-danger btn-sm rounded-pill mb-3" onClick={getLocation}>
                                    <i className="fas fa-location-arrow me-2"></i> Auto-detect My Location
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="terms" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />
                                    <label className="form-check-label small text-muted" htmlFor="terms">
                                        I agree to the terms and authorize the platform to notify me for blood requests.
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-danger w-100 py-3 rounded-3 shadow-sm mt-2" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle me-2"></i> Register as Donor
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorRegistration;
