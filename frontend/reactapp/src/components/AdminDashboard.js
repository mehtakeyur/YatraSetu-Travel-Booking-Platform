import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { token, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Session expired. Please log in again.');
      navigate('/');
      return;
    }

    if (!isAdmin) {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, isAdmin, navigate, token]);

  useEffect(() => {
    // Filter bookings based on selected filter
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.bookingType === filter));
    }
  }, [filter, bookings]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        cache: 'no-store' 
      });

      if (!response.ok) {
        throw new Error('Unauthorized or server error');
      }

      const data = await response.json();
      setStats(data.stats || {});
      setBookings(data.recentBookings || []);
      setFilteredBookings(data.recentBookings || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      alert('Access denied. Please log in again.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color = 'bg-white' }) => (
    <div className={`${color} p-4 rounded-lg shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value || 0}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="📋"
          />
          <StatCard
            title="Total Flights"
            value={stats.totalFlights}
            icon="✈️"
          />
          <StatCard
            title="Total Hotels"
            value={stats.totalHotels}
            icon="🏨"
          />
          <StatCard
            title="Total Trains"
            value={stats.totalTrains}
            icon="🚂"
          />
          <StatCard
            title="Total Buses"
            value={stats.totalBuses}
            icon="🚌"
          />
        </div>

        {/* Revenue Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Revenue</p>
                <p className="text-4xl font-bold">
                  ₹{stats.totalRevenue?.[0]?.total?.toLocaleString() || 0}
                </p>
              </div>
              <span className="text-5xl">💰</span>
            </div>
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Bookings ({filteredBookings.length})
              </h2>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="flight">Flights</option>
                <option value="train">Trains</option>
                <option value="bus">Buses</option>
                <option value="hotel">Hotels</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-500">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const user = booking.userId || {};
                  return (
                    <div
                      key={booking._id}
                      className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getTypeIcon(booking.bookingType)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              Booking ID: {booking.bookingId}
                            </h3>
                            <p className="text-gray-600">
                              {user.firstName} {user.lastName} • {booking.bookingType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            ₹{booking.totalAmount}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        <p>Booked on: {new Date(booking.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;