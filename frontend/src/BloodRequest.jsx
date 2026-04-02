import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createBloodRequest } from './services/api';
import './DonorRegistration.css';

const BloodRequest = () => {
    // ... initialFormData and state ...
    const initialFormData = {
        hospital_id: '',
        blood_type: '',
        units_required: '',
        urgency_level: '',
        message: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [view, setView] = useState('form'); // 'form' or 'results'

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const urgencyLevels = ['low', 'medium', 'high', 'critical'];

    const handleChange = (e) => {
        const { id, value } = e.target;
        const fieldMap = {
            'hospitalId': 'hospital_id',
            'requestBloodType': 'blood_type',
            'unitsNeeded': 'units_required',
            'urgency': 'urgency_level',
            'requestMessage': 'message'
        };
        setFormData(prev => ({
            ...prev,
            [fieldMap[id]]: value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        setIsSubmitting(true);
        try {
            const data = await createBloodRequest(formData);
            setResult(data);
            setView('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error creating blood request:', error);
            alert('Failed to post blood request. Please check if the Hospital ID is valid.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'results' && result) {
        // Updated: notifiedCount should be the number of available matched donors
        const notifiedCount = result.matched_donors.filter(d => d.is_available).length;
        
        return (
            <div className="registration-page container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="feature-card p-4 p-md-5 animate__animated animate__fadeIn">
                            <Link to="/" className="btn btn-back mb-4 d-inline-flex align-items-center">
                                <i className="fas fa-arrow-left me-2"></i> Back to Dashboard
                            </Link>

                            <div className="text-center mb-5">
                                <div className="mb-3">
                                    <i className="fas fa-check-circle fa-4x text-success shadow-sm rounded-circle"></i>
                                </div>
                                <h2 className="text-success fw-bold">Request Posted Successfully!</h2>
                                <div className="alert alert-info d-inline-block px-4 py-2 rounded-pill mt-2 border-0 shadow-sm">
                                    <i className="fas fa-paper-plane me-2"></i>
                                    <strong>{notifiedCount}</strong> urgent notifications sent to available nearby donors.
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6 border-end">
                                    <h5 className="mb-4 text-secondary d-flex align-items-center">
                                        <i className="fas fa-satellite-dish text-success me-2"></i> 
                                        Ranked Matches (Priority)
                                    </h5>
                                    {result.matched_donors.length > 0 ? (
                                        result.matched_donors.map((donor, idx) => (
                                            <div key={idx} className={`donor-list-item p-3 mb-3 border rounded-3 shadow-sm bg-white d-flex align-items-center ${!donor.is_available ? 'opacity-50' : 'notified-donor'}`}>
                                                <div className="donor-icon me-3 bg-light rounded-circle p-3">
                                                    <i className={`fas ${donor.is_available ? 'fa-user-check text-success' : 'fa-user-clock text-warning'} fa-lg`}></i>
                                                </div>
                                                <div className="donor-info flex-grow-1">
                                                    <h6 className="mb-1 fw-bold">{donor.name}</h6>
                                                    {donor.is_available ? (
                                                        <div className="small text-muted mb-1">
                                                            <i className="fas fa-phone-alt me-1 text-success"></i> {donor.phone}
                                                        </div>
                                                    ) : (
                                                        <div className="small text-warning mb-1">
                                                            <i className="fas fa-clock me-1"></i> Busy / Unavailable
                                                        </div>
                                                    )}
                                                    <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1 small me-2">
                                                        {donor.blood_group}
                                                    </span>
                                                    {donor.distance !== undefined && (
                                                        <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                                                            <i className="fas fa-map-marker-alt me-1"></i> {donor.distance} km
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-light rounded-3">
                                            <p className="text-muted mb-0 small">No donors matched within searching radius.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <div className="p-4 bg-light rounded-4 h-100 border">
                                        <h5 className="text-secondary mb-3"><i className="fas fa-info-circle me-2"></i> How Matching Works</h5>
                                        <ul className="small text-muted ps-3">
                                            <li className="mb-2"><strong>Smart Ranking</strong>: Pre-sorts available donors within reach, followed by those nearby but currently unavailable.</li>
                                            <li className="mb-2"><strong>Emergency Handling</strong>: Radius automatically expands to 20km for critical requests.</li>
                                            <li className="mb-2"><strong>Compatibility</strong>: Includes universal donors (like O-) and other compatible matches if exact types are scarce.</li>
                                            <li><strong>Fairness</strong>: Uses a 24-hour cooldown after notification to prevent volunteer fatigue.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-5 pt-4 border-top">
                                <button className="btn btn-danger btn-lg px-4 me-3 rounded-pill shadow-sm" onClick={() => { setView('form'); setResult(null); }}>
                                    <i className="fas fa-plus me-2"></i> New Request
                                </button>
                                <Link to="/" className="btn btn-outline-secondary btn-lg px-4 rounded-pill">
                                    <i className="fas fa-home me-2"></i> Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="feature-card">
                        <Link to="/" className="btn btn-back mb-3 d-inline-flex align-items-center">
                            <i className="fas fa-arrow-left me-2"></i> Back to Home
                        </Link>

                        <div className="text-center mb-4">
                            <i className="fas fa-hand-holding-medical fa-4x text-success mb-3"></i>
                            <h2>Post a Blood Request</h2>
                            <p className="text-muted">Fill out the details below to notify nearby donors instantly.</p>
                        </div>

                        <form id="requestForm" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-hospital"></i> Hospital ID *</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="hospitalId" 
                                    placeholder="Enter your registered Hospital ID" 
                                    value={formData.hospital_id}
                                    onChange={handleChange}
                                    required 
                                />
                                <small className="text-muted">Numerical ID provided during hospital registration.</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-tint"></i> Blood Type *</label>
                                <select 
                                    className="form-control" 
                                    id="requestBloodType" 
                                    value={formData.blood_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Blood Type</option>
                                    {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-syringe"></i> Units Needed (in pints) *</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="unitsNeeded" 
                                    placeholder="e.g., 2" 
                                    min="1" 
                                    value={formData.units_required}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-exclamation-triangle"></i> Urgency Level *</label>
                                <select 
                                    className="form-control" 
                                    id="urgency" 
                                    value={formData.urgency_level}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Urgency</option>
                                    {urgencyLevels.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><i className="fas fa-comment-medical"></i> Additional Message</label>
                                <textarea 
                                    className="form-control" 
                                    id="requestMessage" 
                                    rows="3" 
                                    placeholder="e.g., Patient is in critical condition and needs blood within 2 hours."
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-hospital w-100 py-3" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Posting Request...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-bullhorn me-2"></i> Post Request
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

export default BloodRequest;
