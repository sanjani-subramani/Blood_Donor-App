import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import DonorRegistration from './DonorRegistration';
import HospitalRegistration from './HospitalRegistration';
import BloodRequest from './BloodRequest';
import RequestHistory from './RequestHistory';
import DonorList from './DonorList';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donor" element={<DonorRegistration />} />
          <Route path="/hospital" element={<HospitalRegistration />} />
          <Route path="/request" element={<BloodRequest />} />
          <Route path="/history" element={<RequestHistory />} />
          <Route path="/donors-list" element={<DonorList />} />
        </Routes>
      </main>

      <footer className="py-5 mt-5">
        <div className="container text-center">
            <div className="mb-4">
                <i className="fas fa-heartbeat fa-2x text-danger mb-2"></i>
                <h5 className="text-white">BloodFlow Platform</h5>
                <p className="text-muted small">Saving lives through near-instant connections.</p>
            </div>
            <hr className="bg-light opacity-25" />
            <p className="text-muted small mb-0">© 2024 BloodFlow Alert Platform. Academic Project Submission.</p>
        </div>
      </footer>
    </Router>
  );
}

export default App;
