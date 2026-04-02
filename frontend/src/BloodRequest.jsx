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
        return (
            <div className="registration-page">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="feature-card">
                            <Link to="/" className="btn btn-back mb-3 d-inline-flex align-items-center">
                                <i className="fas fa-arrow-left me-2"></i> Back to Home
                            </Link>

                            <div className="text-center mb-4">
                                <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                                <h2 className="text-success">Request Posted Successfully!</h2>
                                <p className="text-muted">
                                    A total of <strong>{result.matched_donors.length}</strong> donors were matched based on priority.
                                </p>
                            </div>

                            <hr />

                            <div className="row">
                                <div className="col-md-6 border-end">
                                    <h4 className="mb-4"><i className="fas fa-bell text-success me-2"></i> Notified Donors</h4>
                                    {result.matched_donors.slice(0, 3).length > 0 ? (
                                        result.matched_donors.slice(0, 3).map((donor, idx) => {
                                            console.log("Rendering Match:", donor);
                                            return (
                                                <div key={idx} className="donor-list-item notified-donor">
                                                    <div className="donor-icon">
                                                        <i className="fas fa-user-check fa-2x text-success"></i>
                                                    </div>
                                                    <div className="donor-info">
                                                        <h5>{donor.name}</h5>
                                                        <p><i className="fas fa-phone-alt me-1"></i> {donor.phone}</p>
                                                        <p><i className="fas fa-tint me-1"></i> {donor.blood_group}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-muted">No immediate donors matched the criteria.</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <h4 className="mb-4"><i className="fas fa-users text-info me-2"></i> Waiting List</h4>
                                    {result.matched_donors.slice(3).length > 0 ? (
                                        result.matched_donors.slice(3).map((donor, idx) => (
                                            <div key={idx} className="donor-list-item not-selected-donor">
                                                <div className="donor-icon">
                                                    <i className="fas fa-user-clock fa-2x text-muted"></i>
                                                </div>
                                                <div className="donor-info">
                                                    <h5>{donor.name}</h5>
                                                    <p><i className="fas fa-phone-alt me-1"></i> {donor.phone}</p>
                                                    <p><i className="fas fa-tint me-1"></i> {donor.blood_group}</p>
                                                    <small className="text-muted">Will be notified if units are still needed.</small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted">No other eligible donors found within 10km.</p>
                                    )}
                                </div>
                            </div>

                            <div className="text-center mt-5">
                                <button className="btn btn-hospital me-3" onClick={() => setView('form')}>
                                    <i className="fas fa-plus me-2"></i> Post Another Request
                                </button>
                                <Link to="/" className="btn btn-outline-secondary">
                                    <i className="fas fa-home me-2"></i> Return Home
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
