import React, { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';

const HotelForm = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    location: '',
    checkin: '',
    checkout: ''
  });

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.location || !formData.checkin || !formData.checkout) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.checkin < today) {
      alert('Check-in date cannot be in the past');
      return;
    }

    if (formData.checkout <= formData.checkin) {
      alert('Check-out date must be after check-in date');
      return;
    }

    onSearch(formData, 'hotel');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Destination</label>
          <AutocompleteInput
            placeholder="e.g. Goa"
            value={formData.location}
            onChange={(value) => handleInputChange('location', value)}
            type="hotels"
            field="location"
            icon="📍"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Check-in Date</label>
            <input
              type="date"
              min={today}
              value={formData.checkin || today}
              onChange={(e) => handleInputChange('checkin', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Check-out Date</label>
            <input
              type="date"
              min={formData.checkin || tomorrow}
              value={formData.checkout || tomorrowStr}
              onChange={(e) => handleInputChange('checkout', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Searching...
          </>
        ) : (
          <>
            🔍 Search Hotels
          </>
        )}
      </button>
    </form>
  );
};

export default HotelForm;