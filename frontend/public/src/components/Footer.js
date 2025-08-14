import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-4">YatraSetu</h3>
            <p className="text-gray-400 mb-4">
              Your trusted travel companion for all your journey needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                💼
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/?tab=flights" className="text-gray-400 hover:text-white transition-colors">Flight Booking</Link></li>
              <li><Link to="/?tab=hotels" className="text-gray-400 hover:text-white transition-colors">Hotel Booking</Link></li>
              <li><Link to="/?tab=trains" className="text-gray-400 hover:text-white transition-colors">Train Booking</Link></li>
              <li><Link to="/?tab=buses" className="text-gray-400 hover:text-white transition-colors">Bus Booking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2">
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">📞</span>
                +91 9876543210
              </p>
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">✉️</span>
                yatrasetu@gmail.com
              </p>
              <p className="text-gray-400 flex items-center">
                <span className="mr-2">📍</span>
                Ahmedabad, India
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 YatraSetu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;