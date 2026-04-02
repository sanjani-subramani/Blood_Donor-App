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
        <div className="container">
            {/* Hero Section */}
            <div className="hero-section">
                <h1 className="display-4 mb-4">
                    <i className="fas fa-hand-holding-heart pulse me-2"></i> Save Lives, One Drop at a Time
                </h1>
                <p className="lead">Connect donors with hospitals instantly when blood is needed most</p>
                <p className="mt-4">Join thousands of heroes who are making a difference in their community</p>
            </div>

            {/* Action Cards */}
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="feature-card donor-card h-100">
                        <div className="text-center mb-3">
                            <i className="fas fa-user-plus fa-3x text-danger"></i>
                        </div>
                        <h3 className="text-center">Be a Life Saver</h3>
                        <p className="text-center">Register as a blood donor and get notified when hospitals in your area need your blood type.</p>
                        <button
                            onClick={() => navigate('/donor')}
                            className="btn btn-donor w-100 mt-3 d-flex align-items-center justify-content-center"
                        >
                            <i className="fas fa-hand-holding-heart me-2"></i> Become a Donor
                        </button>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div
                        className="feature-card hospital-card h-100" style={{ borderLeft: '5px solid var(--hospital-blue)' }}
                    >

                        <div className="text-center mb-3">
                            <i className="fas fa-hospital fa-3x text-primary"></i>
                        </div>
                        <h3 className="text-center text-black">Hospital Registration</h3>
                        <p className="text-center">Register your hospital to get access to our network of urgent blood donors.</p>
                        <button
                            onClick={() => navigate('/hospital')}
                            className="btn btn-hospital w-100 mt-3 d-flex align-items-center justify-content-center"
                        >
                            <i className="fas fa-hand-holding-heart me-2"></i> Hospital Registration
                        </button>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div className="feature-card hospital-card h-100 text-white"
                    >
                        <div className="text-center mb-3">
                            <i className="fas fa-hand-holding-medical fa-3x text-success"></i>
                        </div>
                        <h3 className="text-center text-black">Post a Blood Request</h3>
                        <p className="text-center text-black">Already registered? Post an urgent blood request to notify nearby donors instantly.</p>
                        <button
                            onClick={() => navigate('/request')}
                            className="btn btn-success w-100 mt-3 d-flex align-items-center justify-content-center"
                            style={{ background: 'linear-gradient(45deg, #28a745, #34ce57)', borderRadius: '25px', border: 'none', fontWeight: 'bold', padding: '12px', color: 'white' }}
                        >
                            <i className="fas fa-plus me-2"></i> Post a Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <StatCard value={stats.donors} label="Registered Donors" className="text-danger" />
                </div>
                <div className="col-md-3">
                    <StatCard value={stats.hospitals} label="Partner Hospitals" className="text-primary" />
                </div>
                <div className="col-md-3">
                    <div className="stats-card">
                        <h2 className="text-success">24/7</h2>
                        <p className="mb-0">Alert System</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stats-card" style={{ color: '#854d0e' }}>
                        <h2 className="text-warning">&lt; 5min</h2>
                        <p className="mb-0">Response Time</p>
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
