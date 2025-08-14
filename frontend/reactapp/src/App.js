import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import MyBookings from './components/MyBookings';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;