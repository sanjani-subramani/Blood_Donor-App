import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DonorRegistration.css';

// Custom hook for animated numbers
const useCountUp = (target, duration = 2000) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    
    useEffect(() => {
        // Defensive check: only animate if target is a valid number
        if (typeof target !== 'number' || isNaN(target)) {
            setCount(target || 0);
            return;
        }

        let start = null;
        const initialCount = countRef.current;
        
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const currentCount = Math.floor(progress * (target - initialCount) + initialCount);
            setCount(currentCount);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                countRef.current = target;
            }
        };
        
        window.requestAnimationFrame(step);
    }, [target, duration]);
    
    return count;
};

const StatCard = ({ value, label, className }) => {
    const animatedValue = useCountUp(value);
    return (
        <div className="stats-card">
            <h2 className={className}>{animatedValue}{label === "Response Time" ? "" : ""}</h2>
            <p className="mb-0">{label}</p>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        donors: 0,
        hospitals: 0
    });
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats and news in parallel using axios
                const [statsRes, newsRes] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/stats"),
                    axios.get("http://127.0.0.1:8000/news")
                ]);
                
                setStats(statsRes.data);
                setNews(newsRes.data);
            } catch (error) {
                console.error("Error fetching home data:", error);
            }
        };

        fetchData();
        // Polling every 10 seconds for "Live" updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container py-5">
            {/* Hero Section */}
            <div className="hero-section text-center py-5 mb-5 rounded-5 shadow-lg animate__animated animate__fadeIn" 
                 style={{ background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(0, 123, 255, 0.8))', backdropFilter: 'blur(10px)', color: 'white' }}>
                <div className="py-4">
                    <h1 className="display-3 fw-bold mb-3">
                        <i className="fas fa-heartbeat pulse me-3"></i>BloodFlow
                    </h1>
                    <p className="lead fs-3 mb-0">Connecting Life-Savers with Those in Need</p>
                    <p className="opacity-75">A near-instant emergency alert system for blood donors and hospitals.</p>
                    <div className="mt-4">
                        <button onClick={() => navigate('/donors-list')} className="btn btn-light btn-lg rounded-pill px-4 shadow-sm fw-bold text-primary me-3">
                            <i className="fas fa-search me-2"></i> Find a Donor
                        </button>
                        <button onClick={() => navigate('/request')} className="btn btn-outline-light btn-lg rounded-pill px-4 fw-bold">
                            <i className="fas fa-bullhorn me-2"></i> Post Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="row g-4 mb-5">
                <div className="col-lg-4">
                    <div className="feature-card h-100 p-4 border-0 shadow-sm transition-hover">
                        <div className="text-center mb-4">
                            <div className="icon-badge bg-danger-subtle rounded-circle d-inline-flex p-4">
                                <i className="fas fa-user-plus fa-3x text-danger"></i>
                            </div>
                        </div>
                        <h3 className="text-center fw-bold">Be a Life Saver</h3>
                        <p className="text-center text-muted">Join our network of thousands of heroes. Get notified when hospitals nearby need your blood type.</p>
                        <hr className="my-4 opacity-25" />
                        <button
                            onClick={() => navigate('/donor')}
                            className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-sm"
                        >
                            <i className="fas fa-hand-holding-heart me-2"></i> Join as Donor
                        </button>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="feature-card h-100 p-4 border-0 shadow-sm transition-hover border-top border-primary border-5">
                        <div className="text-center mb-4">
                            <div className="icon-badge bg-primary-subtle rounded-circle d-inline-flex p-4">
                                <i className="fas fa-hospital fa-3x text-primary"></i>
                            </div>
                        </div>
                        <h3 className="text-center fw-bold">Hospital Portal</h3>
                        <p className="text-center text-muted">Register your facility to access our massive donor base and automate emergency notifications.</p>
                        <hr className="my-4 opacity-25" />
                        <button
                            onClick={() => navigate('/hospital')}
                            className="btn btn-primary w-100 py-3 rounded-pill fw-bold"
                        >
                            <i className="fas fa-plus-circle me-2"></i> Facility Signup
                        </button>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="feature-card h-100 p-4 border-0 shadow-sm transition-hover">
                        <div className="text-center mb-4">
                            <div className="icon-badge bg-success-subtle rounded-circle d-inline-flex p-4">
                                <i className="fas fa-history fa-3x text-success"></i>
                            </div>
                        </div>
                        <h3 className="text-center fw-bold">Recent History</h3>
                        <p className="text-center text-muted">Track global emergency requests and see how our community is making a difference every day.</p>
                        <hr className="my-4 opacity-25" />
                        <button
                            onClick={() => navigate('/history')}
                            className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm"
                        >
                            <i className="fas fa-list-ul me-2"></i> View History
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-light rounded-5 p-5 mb-5 shadow-inner">
                <div className="row text-center g-4">
                    <div className="col-md-3">
                        <StatCard value={stats.donors} label="Registered Donors" className="text-danger fw-bold display-5" />
                    </div>
                    <div className="col-md-3">
                        <StatCard value={stats.hospitals} label="Partner Hospitals" className="text-primary fw-bold display-5" />
                    </div>
                    <div className="col-md-3">
                        <div className="stats-card p-3">
                            <h2 className="text-success fw-bold display-5">24/7</h2>
                            <p className="mb-0 text-muted">Ready for Alert</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stats-card p-3">
                            <h2 className="text-warning fw-bold display-5">&lt; 5m</h2>
                            <p className="mb-0 text-muted">Avg. Response</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* News & Community Section */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="info-section">
                        <h2 className="text-center"><i className="fas fa-bullhorn"></i> Community & News</h2>
                        <p className="text-center text-muted">Find nearby blood donation drives and stay informed.</p>
                        
                        <div className="list-group mt-4">
                            {news.length > 0 ? news.map((item, idx) => (
                                <div key={item.id || idx} className="list-group-item list-group-item-action flex-column align-items-start mt-2">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1 text-primary">{item.camp_name || 'Blood Donation Drive'}</h5>
                                        <small className="text-muted"><i className="far fa-clock me-1"></i> {item.date}</small>
                                    </div>
                                    <p className="mb-1">{item.description || 'Join us for a blood donation drive and help save lives.'}</p>
                                    <div className="mt-2">
                                        <small className="text-success"><i className="fas fa-calendar-alt me-1"></i> {item.date}</small>
                                        <small className="text-danger ms-3"><i className="fas fa-map-marker-alt me-1"></i> {item.location}</small>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 bg-white rounded-3 shadow-sm">
                                    <p className="text-muted mb-0">No recent news or donation drives found at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
