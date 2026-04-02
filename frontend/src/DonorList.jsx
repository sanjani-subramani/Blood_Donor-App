import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDonors } from './services/api';

const DonorList = () => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterGroup, setFilterGroup] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        const loadDonors = async () => {
            try {
                setLoading(true);
                const data = await fetchDonors(filterGroup, availableOnly);
                setDonors(data);
            } catch (err) {
                console.error("Error loading donors:", err);
                setError("Failed to fetch donor list.");
            } finally {
                setLoading(false);
            }
        };
        loadDonors();
    }, [filterGroup, availableOnly]);

    return (
        <div className="container py-4">
            <div className="d-flex align-items-center mb-4">
                <Link to="/" className="btn btn-outline-light btn-sm me-3">
                    <i className="fas fa-arrow-left"></i>
                </Link>
                <h2 className="text-white mb-0">Discover Blood Donors</h2>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-4 p-4 shadow-sm mb-5">
                <div className="row align-items-end">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <label className="form-label text-muted ms-2"><i className="fas fa-tint me-1 text-danger"></i> Blood Group</label>
                        <select className="form-select border-0 bg-light" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                            <option value="">All Blood Groups</option>
                            {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="form-check form-switch ms-2 d-flex align-items-center h-100 mt-md-4">
                            <input className="form-check-input" type="checkbox" id="availSwitch" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                            <label className="form-check-label ms-3 text-muted" htmlFor="availSwitch">Show Only Available Donors</label>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end pt-md-2">
                        <span className="badge bg-light text-primary py-2 px-3">
                            <i className="fas fa-users me-2"></i> {donors.length} Donors Found
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i> {error}
                </div>
            )}

            <div className="row">
                {loading ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-white" role="status"></div>
                        <p className="mt-3 text-white">Searching for life-saving donors...</p>
                    </div>
                ) : donors.length > 0 ? (
                    donors.map(donor => (
                        <div key={donor.id} className="col-md-6 col-lg-3 mb-4">
                            <div className="feature-card h-100 p-4 text-center">
                                <div className="mb-3">
                                    <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center p-3 mb-2 shadow-sm" style={{ width: '70px', height: '70px' }}>
                                        <i className={`fas fa-user fa-2x ${donor.is_available ? 'text-danger' : 'text-muted'}`}></i>
                                    </div>
                                    <h5 className="mb-1 text-dark">{donor.name}</h5>
                                    <div className="d-flex justify-content-center gap-2 mb-2">
                                        <span className={`badge rounded-pill ${donor.is_available ? 'bg-success' : 'bg-secondary'}`}>
                                            {donor.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                        <span className="badge rounded-pill bg-danger">{donor.blood_group}</span>
                                    </div>
                                </div>
                                <hr className="my-3 opacity-25" />
                                <div className="text-muted small mb-3">
                                    <p className="mb-1"><i className="fas fa-map-marker-alt me-1 text-danger"></i> {donor.address_city}, {donor.address_state}</p>
                                    <p className="mb-0"><i className="fas fa-phone-alt me-1 text-success"></i> {donor.phone.substring(0, 6)}****</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="bg-white rounded-4 p-5 shadow-sm">
                            <i className="fas fa-user-slash fa-4x text-muted mb-3"></i>
                            <h3 className="text-muted">No donors matched your search.</h3>
                            <p className="text-secondary text-center px-4">Try adjusting your filters or search for another blood group.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorList;
