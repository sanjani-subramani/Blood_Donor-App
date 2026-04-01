import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div className="container">
                <Link className="navbar-brand" to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    <i className="fas fa-heartbeat me-2"></i> Blood Donor Alert Platform
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
