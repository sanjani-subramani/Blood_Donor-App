import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import DonorRegistration from './DonorRegistration';
import HospitalRegistration from './HospitalRegistration';
import BloodRequest from './BloodRequest';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donor" element={<DonorRegistration />} />
          <Route path="/hospital" element={<HospitalRegistration />} />
          <Route path="/request" element={<BloodRequest />} />
        </Routes>
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '40px', color: '#fff' }}>
        <p>© 2024 Blood Donor Alert Platform. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
