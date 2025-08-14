import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  bookingData, 
  item, 
  searchType, 
  onSuccess 
}) => {
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
    bankSelect: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.cvv) {
        alert('Please enter card number and CVV.');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId || !formData.upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. user@upi).');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bankSelect || !formData.accountHolder || !formData.accountNumber || !formData.ifscCode) {
        alert('Please fill all netbanking fields including IFSC, account number and name.');
        return false;
      }
    }
    return true;
  };

  const handlePayNow = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1️⃣ Create booking
      const bookingRes = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingType: searchType,
          serviceId: item._id,
          passengers: bookingData.passengers,
          totalAmount: amount,
          travelDate: new Date().toISOString(),
          contactDetails: bookingData.contactDetails,
          specialRequests: ''
        })
      });

      const bookingResult = await bookingRes.json();
      if (!bookingRes.ok) {
        alert(bookingResult.error || 'Booking failed');
        return;
      }

      const bookingId = bookingResult.booking.bookingId;

      // 2️⃣ Process payment
      const paymentRes = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod
        })
      });

      const paymentResult = await paymentRes.json();
      if (!paymentRes.ok) {
        alert(paymentResult.error || 'Payment processing failed');
        return;
      }

      alert('✅ Payment successful!\nBooking ID: ' + bookingId);
      onSuccess();
      
    } catch (err) {
      console.error('Payment error:', err);
      alert('❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-center">Complete Your Payment</h2>
        <p className="text-center text-gray-700">Amount: ₹<span className="font-bold">{amount}</span></p>

        {/* Payment Method Tabs */}
        <div className="flex space-x-2 border-b pb-2">
          <button
            onClick={() => handlePaymentMethodChange('card')}
            className={`px-4 py-2 font-semibold ${
              paymentMethod === 'card' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Card
          </button>
          <button
            onClick={() => handlePaymentMethodChange('upi')}
            className={`px-4 py-2 font-semibold ${
              paymentMethod === 'upi' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            UPI
          </button>
          <button
            onClick={() => handlePaymentMethodChange('netbanking')}
            className={`px-4 py-2 font-semibold ${
              paymentMethod === 'netbanking' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            NetBanking
          </button>
        </div>

        {/* Payment Forms */}
        {paymentMethod === 'card' && (
          <div className="space-y-2">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleInputChange}
                className="w-1/2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleInputChange}
                className="w-1/2 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'upi' && (
          <div className="space-y-2">
            <input
              type="text"
              name="upiId"
              placeholder="Enter your UPI ID (e.g., name@upi)"
              value={formData.upiId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {paymentMethod === 'netbanking' && (
          <div className="space-y-2">
            <select
              name="bankSelect"
              value={formData.bankSelect}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Bank</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="SBI">State Bank of India</option>
              <option value="AXIS">Axis Bank</option>
            </select>
            <input
              type="text"
              name="accountHolder"
              placeholder="Account Holder Name"
              value={formData.accountHolder}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="accountNumber"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="ifscCode"
              placeholder="IFSC Code"
              value={formData.ifscCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={handlePayNow}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="block mx-auto text-sm text-gray-500 mt-2 hover:underline"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;