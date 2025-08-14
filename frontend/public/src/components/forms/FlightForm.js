import React, { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';

const FlightForm = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departure: '',
    passengers: '1 Adult'
  });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.departure) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.departure < today) {
      alert('Please select a valid departure date');
      return;
    }

    onSearch(formData, 'flight');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <AutocompleteInput
            placeholder="Delhi"
            value={formData.from}
            onChange={(value) => handleInputChange('from', value)}
            type="flights"
            field="from"
            icon="✈️"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <AutocompleteInput
            placeholder="Mumbai"
            value={formData.to}
            onChange={(value) => handleInputChange('to', value)}
            type="flights"
            field="to"
            icon="🛬"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Departure</label>
          <input
            type="date"
            min={today}
            value={formData.departure || today}
            onChange={(e) => handleInputChange('departure', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Searching...
          </>
        ) : (
          <>
            🔍 Search Flights
          </>
        )}
      </button>
    </form>
  );
};

export default FlightForm;