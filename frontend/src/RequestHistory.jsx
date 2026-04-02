import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRequestHistory } from './services/api';

const RequestHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                const data = await fetchRequestHistory();
                setHistory(data);
            } catch (err) {
                console.error("Error loading history:", err);
                setError("Failed to load historical data.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getUrgencyBadge = (level) => {
        const levels = {
            'critical': 'bg-danger text-white pulse',
            'high': 'bg-warning text-dark',
            'medium': 'bg-primary text-white',
            'low': 'bg-success text-white'
        };
        return `badge rounded-pill ${levels[level.toLowerCase()] || 'bg-secondary'}`;
    };

    if (loading) return (
        <div className="container text-center py-5">
            <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading history...</span>
            </div>
            <p className="mt-3 text-white">Fetching blood request history...</p>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="d-flex align-items-center mb-4">
                <Link to="/" className="btn btn-outline-light btn-sm me-3">
                    <i className="fas fa-arrow-left"></i>
                </Link>
                <h2 className="text-white mb-0">Blood Request History</h2>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i> {error}
                </div>
            )}

            <div className="row">
                {history.length > 0 ? (
                    history.map((item) => (
                        <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="feature-card h-100 p-4" style={{ borderLeft: '4px solid #dc3545' }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h4 className="text-danger mb-0">{item.blood_type} Needed</h4>
                                    <span className={getUrgencyBadge(item.urgency_level)}>
                                        {item.urgency_level.toUpperCase()}
                                    </span>
                                </div>
                                <h5 className="mb-3 text-secondary">{item.hospital_name}</h5>
                                <p className="mb-2"><strong>Units:</strong> {item.units_required}</p>
                                {item.message && (
                                    <div className="mt-3 p-2 bg-light rounded shadow-sm">
                                        <small className="text-muted italic fst-italic">"{item.message}"</small>
                                    </div>
                                )}
                                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                                    <small className="text-muted"><i className="far fa-clock me-1"></i> ID: #{item.id}</small>
                                    <span className="text-success small">Notifications Sent <i className="fas fa-check-circle"></i></span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="bg-white rounded-4 p-5 shadow-sm">
                            <i className="fas fa-history fa-4x text-muted mb-3"></i>
                            <h3 className="text-muted">No historical requests found.</h3>
                            <p className="text-secondary">All urgent blood requests of our network will appear here.</p>
                            <Link to="/request" className="btn btn-danger px-4 mt-3">Post First Request</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestHistory;
