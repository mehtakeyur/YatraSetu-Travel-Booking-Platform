import React, { useState, useEffect } from 'react';
import FlightForm from './forms/FlightForm';
import HotelForm from './forms/HotelForm';
import TrainForm from './forms/TrainForm';
import BusForm from './forms/BusForm';

const BookingWidget = ({ activeTab, onTabChange, onSearch }) => {
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'trains', label: 'Trains', icon: '🚂' },
    { id: 'buses', label: 'Buses', icon: '🚌' }
  ];

  const handleSearch = async (searchData, type) => {
    setLoading(true);
    try {
      let apiUrl = '';
      const backendBaseUrl = 'http://localhost:5000';

      if (['flight', 'train', 'bus'].includes(type)) {
        const pluralType = type === 'bus' ? 'buses' : `${type}s`;
        apiUrl = `${backendBaseUrl}/api/${pluralType}/search?from=${encodeURIComponent(searchData.from)}&to=${encodeURIComponent(searchData.to)}&departure=${encodeURIComponent(searchData.departure)}`;
      } else if (type === 'hotel') {
        apiUrl = `${backendBaseUrl}/api/hotels/search?location=${encodeURIComponent(searchData.location)}&checkin=${searchData.checkin}&checkout=${searchData.checkout}`;
      }

      const response = await fetch(apiUrl);
      const results = await response.json();
      
      if (Array.isArray(results)) {
        onSearch(results);
      } else {
        onSearch([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      onSearch([]);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    const commonProps = { onSearch: handleSearch, loading };
    
    switch (activeTab) {
      case 'flights':
        return <FlightForm {...commonProps} />;
      case 'hotels':
        return <HotelForm {...commonProps} />;
      case 'trains':
        return <TrainForm {...commonProps} />;
      case 'buses':
        return <BusForm {...commonProps} />;
      default:
        return <FlightForm {...commonProps} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto">
      {/* Booking Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      {renderForm()}
    </div>
  );
};

export default BookingWidget;