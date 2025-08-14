import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SignupModal = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });

      if (result.success) {
        alert('Sign up successful!');
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      alert('Server error during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-2xl hover:text-gray-600 z-10"
        >
          &times;
        </button>
        
        <h2 className="text-2xl mb-4 font-semibold text-center">Sign Up</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile (10 digits)"
            pattern="[0-9]{10}"
            value={formData.mobile}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-3 w-full rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;