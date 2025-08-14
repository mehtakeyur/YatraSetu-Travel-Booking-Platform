import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Calendar, Plane, Train, Bus, Hotel, X } from 'lucide-react';
import PassengerForm from './PassengerForm';
import PaymentModal from './PaymentModal';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

const BookingModal = ({ isOpen, onClose, item, searchType }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (item) {
      const price = item.price || item.rooms?.[0]?.price || 0;
      setSelectedPrice(price);
    }
  }, [item]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      alert('Please log in to continue booking');
      return;
    }
    setShowPassengerForm(true);
  };

  const handlePassengerSubmit = (passengerData) => {
    setBookingData(passengerData);
    setShowPassengerForm(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onClose();
    navigate('/my-bookings');
  };

  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-2xl hover:text-gray-600">&times;</button>
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          <div className="space-y-3 mb-6">
            {searchType === 'flight' && (
              <>
                <p><strong>Airline:</strong> {item.airline}</p>
                <p><strong>Flight:</strong> {item.flightNumber}</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
                <p><strong>Class:</strong> {item.class}</p>
              </>
            )}
            {searchType === 'hotel' && (
              <>
                <p><strong>Hotel:</strong> {item.name}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Rating:</strong> {item.rating}★</p>
                {item.amenities && <p><strong>Amenities:</strong> {item.amenities.join(', ')}</p>}
              </>
            )}
            {searchType === 'train' && (
              <>
                <p><strong>Train:</strong> {item.trainName} ({item.trainNumber})</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
              </>
            )}
            {searchType === 'bus' && (
              <>
                <p><strong>Operator:</strong> {item.operator}</p>
                <p><strong>Bus:</strong> {item.busNumber}</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Type:</strong> {item.busType}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
              </>
            )}
            <div className="border-t pt-3">
              <p className="text-lg font-bold">Total: ₹{selectedPrice}</p>
            </div>
          </div>
          <button onClick={handleBookNow} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Proceed to Book
          </button>
        </div>
      </div>
      <PassengerForm
        isOpen={showPassengerForm}
        onClose={() => setShowPassengerForm(false)}
        onSubmit={handlePassengerSubmit}
        item={item}
        searchType={searchType}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedPrice}
        bookingData={bookingData}
        item={item}
        searchType={searchType}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default BookingModal;
