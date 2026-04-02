import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    <i className="fas fa-heartbeat me-2 text-danger"></i>
                    <span>BloodFlow</span>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link text-white px-3" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white px-3" to="/donors-list">Find Donors</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white px-3" to="/history">History</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link btn btn-danger btn-sm text-white px-3 ms-2" to="/request">Request Blood</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
