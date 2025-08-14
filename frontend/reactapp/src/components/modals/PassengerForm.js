import React, { useState, useEffect } from 'react';

const PassengerForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  item, 
  searchType, 
  selectedPrice, 
  setSelectedPrice 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    selectedSeat: '',
    selectedRoom: '',
    selectedTrainClass: ''
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    if (isOpen && item) {
      // Initialize based on search type
      if (searchType === 'hotel') {
        setAvailableRooms(item.rooms || []);
        if (item.rooms && item.rooms.length > 0) {
          setFormData(prev => ({ ...prev, selectedRoom: item.rooms[0].type }));
          setSelectedPrice(item.rooms[0].price);
        }
      } else if (searchType === 'train') {
        setAvailableClasses(item.classes || []);
        if (item.classes && item.classes.length > 0) {
          setFormData(prev => ({ ...prev, selectedTrainClass: item.classes[0].type }));
          setSelectedPrice(item.classes[0].price);
        }
      } else if (searchType === 'bus') {
        // Generate seats for bus
        const seatList = [];
        for (let i = 1; i <= 36; i++) {
          seatList.push(`B${i}`);
        }
        setSeats(seatList);
      }
    }
  }, [isOpen, item, searchType, setSelectedPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update price based on selection
    if (name === 'selectedRoom' && searchType === 'hotel') {
      const room = availableRooms.find(r => r.type === value);
      if (room) {
        setSelectedPrice(room.price);
      }
    } else if (name === 'selectedTrainClass' && searchType === 'train') {
      const trainClass = availableClasses.find(c => c.type === value);
      if (trainClass) {
        setSelectedPrice(trainClass.price);
      }
    }
  };

  const handleSeatClick = (seat) => {
    setFormData(prev => ({ ...prev, selectedSeat: seat }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age) {
      alert('Please fill all required fields');
      return;
    }

    if (searchType === 'bus' && !formData.selectedSeat) {
      alert('Please select a seat');
      return;
    }

    const [firstName, ...rest] = formData.name.split(' ');
    const lastName = rest.join(' ') || '-';

    const passengerData = {
      passengers: [{
        firstName,
        lastName,
        age: parseInt(formData.age),
        gender: formData.gender,
        seatNumber: formData.selectedSeat || generateRandomSeat(),
        class: formData.selectedTrainClass || undefined,
        roomType: formData.selectedRoom || undefined
      }],
      contactDetails: JSON.parse(localStorage.getItem('userContact') || '{}')
    };

    onSubmit(passengerData);
  };

  const generateRandomSeat = () => {
    if (['flight', 'train'].includes(searchType)) {
      const row = Math.floor(Math.random() * 30) + 1;
      const letter = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)];
      return `${row}${letter}`;
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl hover:text-gray-600"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-semibold mb-4">Enter Passenger Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
              min="1"
              max="100"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Hotel Room Selection */}
          {searchType === 'hotel' && availableRooms.length > 0 && (
            <div>
              <label className="block font-medium mb-1">Select Room Type</label>
              <select
                name="selectedRoom"
                value={formData.selectedRoom}
                onChange={handleInputChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              >
                {availableRooms.map((room, index) => (
                  <option key={index} value={room.type}>
                    {room.type} - ₹{room.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Train Class Selection */}
          {searchType === 'train' && availableClasses.length > 0 && (
            <div>
              <label className="block font-medium mb-1">Select Train Class</label>
              <select
                name="selectedTrainClass"
                value={formData.selectedTrainClass}
                onChange={handleInputChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              >
                {availableClasses.map((cls, index) => (
                  <option key={index} value={cls.type}>
                    {cls.type} - ₹{cls.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bus Seat Selection */}
          {searchType === 'bus' && (
            <div>
              <label className="block font-medium mb-2">Select Seat</label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {seats.map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    className={`p-2 text-sm rounded border ${
                      formData.selectedSeat === seat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
              {formData.selectedSeat && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {formData.selectedSeat}
                </p>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-lg font-bold mb-4">Total Amount: ₹{selectedPrice}</p>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassengerForm;