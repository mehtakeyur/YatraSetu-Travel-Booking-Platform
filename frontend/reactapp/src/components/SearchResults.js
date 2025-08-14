import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Calendar, Plane, Train, Bus, Hotel, X, Users } from 'lucide-react';
import PassengerForm from './modals/PassengerForm';
import PaymentModal from './modals/PaymentModal';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

const SearchResults = ({ results = [], searchType = 'hotel' }) => {
  const [sortBy, setSortBy] = useState('');
  const [sortedResults, setSortedResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({}); 

  const normalizeSearchType = (type) => {
    const normalized = type.toLowerCase();
    if (normalized === 'hotels') return 'hotel';
    if (normalized === 'flights') return 'flight';
    if (normalized === 'trains') return 'train';
    if (normalized === 'buses') return 'bus';
    return normalized;
  };

  const getIcon = (type) => {
    const normalized = normalizeSearchType(type);
    switch (normalized) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      default: return null;
    }
  };

  useEffect(() => {
    const initialOptions = {};
    results.forEach((item, index) => {
      const itemId = item._id || item.id || index;
      const normalizedType = normalizeSearchType(searchType);
      
      if (normalizedType === 'train' && item.classes && item.classes.length > 0) {
       
        initialOptions[itemId] = {
          selectedClass: item.classes[0],
          selectedClassIndex: 0
        };
      } else if (normalizedType === 'bus') {
       
        initialOptions[itemId] = {
          passengerCount: 1
        };
      }
    });
    setSelectedOptions(initialOptions);
  }, [results, searchType]);

  useEffect(() => {
    const normalizedType = normalizeSearchType(searchType);
    let sorted = [...results];
    
    switch (sortBy) {
      case 'priceAsc':
        sorted.sort((a, b) => {
          const priceA = getItemPrice(a, a._id || a.id || sorted.indexOf(a));
          const priceB = getItemPrice(b, b._id || b.id || sorted.indexOf(b));
          return priceA - priceB;
        });
        break;
      case 'priceDesc':
        sorted.sort((a, b) => {
          const priceA = getItemPrice(a, a._id || a.id || sorted.indexOf(a));
          const priceB = getItemPrice(b, b._id || b.id || sorted.indexOf(b));
          return priceB - priceA;
        });
        break;
      case 'ratingDesc':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'departureAsc':
        if (['flight', 'train', 'bus'].includes(normalizedType)) {
          sorted.sort((a, b) => {
            const dateA = new Date(a.departure);
            const dateB = new Date(b.departure);
            return isNaN(dateA) ? 1 : isNaN(dateB) ? -1 : dateA - dateB;
          });
        }
        break;
      case 'departureDesc':
        if (['flight', 'train', 'bus'].includes(normalizedType)) {
          sorted.sort((a, b) => {
            const dateA = new Date(a.departure);
            const dateB = new Date(b.departure);
            return isNaN(dateB) ? 1 : isNaN(dateA) ? -1 : dateB - dateA;
          });
        }
        break;
      case 'nameAsc':
        if (normalizedType === 'hotel') {
          sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        break;
      default:
        break;
    }
    
    setSortedResults(sorted);
  }, [results, sortBy, searchType, selectedOptions]);

  const getItemPrice = (item, itemId) => {
    const normalizedType = normalizeSearchType(searchType);
    const options = selectedOptions[itemId];
    
    if (normalizedType === 'train' && options?.selectedClass) {
      return options.selectedClass.price || 0;
    } else if (normalizedType === 'bus' && options?.passengerCount) {
      const basePrice = item.price || 0;
      return basePrice * options.passengerCount;
    } else {
      return item.price || (item.rooms && item.rooms[0]?.price) || 0;
    }
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleBookNow = (item) => {
    const itemId = item._id || item.id || sortedResults.indexOf(item);
    const options = selectedOptions[itemId];
    
    const itemWithOptions = {
      ...item,
      selectedOptions: options
    };
    
    setSelectedItem(itemWithOptions);
    setShowBookingModal(true);
  };

  const handleOptionChange = (itemId, optionType, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [optionType]: value
      }
    }));
  };

  const renderResultCard = (item, index) => {
    const itemId = item._id || item.id || index;
    const normalizedType = normalizeSearchType(searchType);
    const price = getItemPrice(item, itemId);
    
    switch (normalizedType) {
      case 'flight':
        return (
          <div key={itemId} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.airline || 'Unknown Airline'}</h3>
                  <p className="text-gray-600">Flight {item.flightNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{item.from} → {item.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.class || 'Economy'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-medium text-sm">{formatDate(item.departure)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Arrival</p>
                  <p className="font-medium text-sm">{formatDate(item.arrival)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Book Flight
            </button>
          </div>
        );

      case 'hotel':
        return (
          <div key={itemId} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.name || 'Unknown Hotel'}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600 text-sm">{item.location || 'Location not specified'}</p>
                  </div>
                  {item.rating && (
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{item.rating}</span>
                      <span className="ml-1 text-gray-400 text-sm">rating</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>

            {item.amenities && item.amenities.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Amenities</p>
                <p className="text-sm text-gray-700">{item.amenities.join(', ')}</p>
              </div>
            )}

            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Book Hotel
            </button>
          </div>
        );

      case 'train':
        const selectedClass = selectedOptions[itemId]?.selectedClass || (item.classes && item.classes[0]) || {};
        
        return (
          <div key={itemId} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Train className="w-5 h-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.trainName || 'Unknown Train'}</h3>
                  <p className="text-gray-600">Train {item.trainNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{item.from} → {item.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">₹{price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{selectedClass.type || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-medium text-sm">{formatDate(item.departure)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Arrival</p>
                  <p className="font-medium text-sm">{formatDate(item.arrival)}</p>
                </div>
              </div>
            </div>

            {item.classes && item.classes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Select Class</p>
                <select
                  value={selectedOptions[itemId]?.selectedClassIndex || 0}
                  onChange={(e) => {
                    const classIndex = parseInt(e.target.value);
                    const selectedClass = item.classes[classIndex];
                    handleOptionChange(itemId, 'selectedClass', selectedClass);
                    handleOptionChange(itemId, 'selectedClassIndex', classIndex);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {item.classes.map((classItem, classIndex) => (
                    <option key={classIndex} value={classIndex}>
                      {classItem.type || `Class ${classIndex + 1}`} - ₹{classItem.price || 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Book Train
            </button>
          </div>
        );

      case 'bus':
        const passengerCount = selectedOptions[itemId]?.passengerCount || 1;
        const basePrice = item.price || 0;
        
        return (
          <div key={itemId} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{item.operator || 'Unknown Operator'}</h3>
                  <p className="text-gray-600">Bus {item.busNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{item.from} → {item.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">₹{price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.busType || 'Standard'}</p>
                <p className="text-xs text-gray-400">₹{basePrice} × {passengerCount} passenger{passengerCount > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-medium text-sm">{formatDate(item.departure)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Arrival</p>
                  <p className="font-medium text-sm">{formatDate(item.arrival)}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Number of Passengers
              </p>
              <select
                value={passengerCount}
                onChange={(e) => handleOptionChange(itemId, 'passengerCount', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num} Passenger{num > 1 ? 's' : ''} - ₹{(basePrice * num).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Book Bus
            </button>
          </div>
        );

      default:
        return (
          <div key={itemId} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white">
            <p className="text-gray-600">Unknown search type: {searchType} (normalized: {normalizedType})</p>
            <p className="text-sm text-gray-500 mb-2">Raw data preview:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="mt-10 px-4 max-w-6xl mx-auto">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-4">
            {getIcon(searchType)}
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">No results found</h3>
          <p className="text-gray-600">Try different search criteria or check your filters</p>
        </div>
      </div>
    );
  }

  const normalizedType = normalizeSearchType(searchType);

  return (
    <>
      <div className="mt-10 px-4 max-w-6xl mx-auto">
   
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            {getIcon(searchType)}
            <h3 className="text-2xl font-semibold text-gray-800">
              Search Results ({results.length})
            </h3>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            {normalizedType === 'hotel' && (
              <>
                <option value="ratingDesc">Rating: High to Low</option>
                <option value="nameAsc">Name: A → Z</option>
              </>
            )}
            {['flight', 'train', 'bus'].includes(normalizedType) && (
              <>
                <option value="departureAsc">Departure: Earliest First</option>
                <option value="departureDesc">Departure: Latest First</option>
              </>
            )}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedResults.map(renderResultCard)}
        </div>
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        item={selectedItem}
        searchType={searchType}
      />
    </>
  );
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
      const normalizedType = normalizeSearchType(searchType);
      let price = 0;

      if (normalizedType === 'train' && item.selectedOptions?.selectedClass) {
        price = item.selectedOptions.selectedClass.price || 0;
      } else if (normalizedType === 'bus' && item.selectedOptions?.passengerCount) {
        const basePrice = item.price || 0;
        price = basePrice * item.selectedOptions.passengerCount;
      } else {
        price = item.price || (item.rooms && item.rooms[0]?.price) || 0;
      }

      setSelectedPrice(price);
    }
  }, [item, searchType]);

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

  const normalizeSearchType = (type) => {
    const normalized = type.toLowerCase();
    if (normalized === 'hotels') return 'hotel';
    if (normalized === 'flights') return 'flight';
    if (normalized === 'trains') return 'train';
    if (normalized === 'buses') return 'bus';
    return normalized;
  };

  if (!isOpen || !item) return null;

  const normalizedType = normalizeSearchType(searchType);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-2xl hover:text-gray-600">&times;</button>
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          <div className="space-y-3 mb-6">
            {normalizedType === 'flight' && (
              <>
                <p><strong>Airline:</strong> {item.airline}</p>
                <p><strong>Flight:</strong> {item.flightNumber}</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
                <p><strong>Class:</strong> {item.class}</p>
              </>
            )}
            {normalizedType === 'hotel' && (
              <>
                <p><strong>Hotel:</strong> {item.name}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Rating:</strong> {item.rating}★</p>
                {item.amenities && <p><strong>Amenities:</strong> {item.amenities.join(', ')}</p>}
              </>
            )}
            {normalizedType === 'train' && (
              <>
                <p><strong>Train:</strong> {item.trainName} ({item.trainNumber})</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
                {item.selectedOptions?.selectedClass && (
                  <p><strong>Selected Class:</strong> {item.selectedOptions.selectedClass.type} - ₹{item.selectedOptions.selectedClass.price}</p>
                )}
              </>
            )}
            {normalizedType === 'bus' && (
              <>
                <p><strong>Operator:</strong> {item.operator}</p>
                <p><strong>Bus:</strong> {item.busNumber}</p>
                <p><strong>Route:</strong> {item.from} → {item.to}</p>
                <p><strong>Type:</strong> {item.busType}</p>
                <p><strong>Departure:</strong> {formatDate(item.departure)}</p>
                <p><strong>Arrival:</strong> {formatDate(item.arrival)}</p>
                {item.selectedOptions?.passengerCount && (
                  <>
                    <p><strong>Passengers:</strong> {item.selectedOptions.passengerCount}</p>
                    <p><strong>Price per passenger:</strong> ₹{item.price || 0}</p>
                  </>
                )}
              </>
            )}
            <div className="border-t pt-3">
              <p className="text-lg font-bold">Total: ₹{selectedPrice.toLocaleString()}</p>
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

export default SearchResults;