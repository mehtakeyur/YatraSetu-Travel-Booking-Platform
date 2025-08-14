import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyBookings = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('You must be logged in to view My Bookings!');
      navigate('/');
      return;
    }
    loadBookings();
  }, [isAuthenticated, navigate, token]);

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBookings(Array.isArray(data) ? data : []);
      } else {
        alert(data.error || 'Failed to load bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'Booking cancelled successfully');
        loadBookings(); // Reload bookings
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'train': return '🚂';
      case 'bus': return '🚌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">YatraSetu</h1>
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-8 px-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold mb-4">No bookings found</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Total Bookings: {bookings.length}
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getTypeIcon(booking.bookingType)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-lg">
                          {booking.bookingType?.charAt(0).toUpperCase() + booking.bookingType?.slice(1)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {booking.bookingId}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">₹{booking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-medium ${
                        booking.paymentStatus === 'completed' 
                          ? 'text-green-600' 
                          : booking.paymentStatus === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booked on:</span>
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                    {booking.travelDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travel Date:</span>
                        <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {booking.bookingStatus !== 'cancelled' && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;