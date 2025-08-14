import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './modals/LoginModal';
import SignupModal from './modals/SignupModal';

const Navbar = ({ onTabChange, activeTab }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                YatraSetu
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                {onTabChange && (
                  <>
                    <button
                      onClick={() => handleTabClick('flights')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'flights' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      Flights
                    </button>
                    <button
                      onClick={() => handleTabClick('hotels')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'hotels' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      Hotels
                    </button>
                    <button
                      onClick={() => handleTabClick('trains')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'trains' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      Trains
                    </button>
                    <button
                      onClick={() => handleTabClick('buses')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        activeTab === 'buses' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-800 hover:text-blue-600'
                      }`}
                    >
                      Buses
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Auth Area */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-800">
                    Welcome, {user?.firstName || 'User'}!
                  </span>
                  <Link
                    to="/my-bookings"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    My Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      className="text-purple-600 hover:underline"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </>
  );
};

export default Navbar;