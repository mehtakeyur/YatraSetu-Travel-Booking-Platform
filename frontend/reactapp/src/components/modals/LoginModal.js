import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        alert('Login successful!');
        onClose();
        setFormData({ email: '', password: '' });
        
        // Redirect admin to dashboard
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        }
      } else {
        alert(result.error || 'Login failed');
      }
    } catch (error) {
      alert('Server error during login');
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
    setFormData({ email: '', password: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-2xl hover:text-gray-600"
        >
          &times;
        </button>
        
        <h2 className="text-2xl mb-4 font-semibold text-center">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 w-full rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;