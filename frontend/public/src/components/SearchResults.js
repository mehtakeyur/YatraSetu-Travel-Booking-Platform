import React, { useState } from 'react';
import BookingModal from './modals/BookingModal';

const SearchResults = ({ results, searchType }) => {
  const [sortBy, setSortBy] = useState('');
  const [sortedResults, setSortedResults] = useState(results);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  React.useEffect(() => {
    setSortedResults(results);
  }, [results]);

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    let sorted = [...results];

    switch (sortValue) {
      case 'priceAsc':
        sorted.sort((a, b) => (a.price || a.rooms?.[0]?.price || 0) - (b.price || b.rooms?.[0]?.price || 0));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => (b.price || b.rooms?.[0]?.price || 0) - (a.price || a.rooms?.[0]?.price || 0));
        break;
      case 'ratingDesc':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'departureAsc':
        if (['flight', 'train', 'bus'].includes(searchType)) {
          sorted.sort((a, b) => new Date(a.departure) - new Date(b.departure));
        }
        break;
      case 'departureDesc':
        if (['flight', 'train', 'bus'].includes(searchType)) {
          sorted.sort((a, b) => new Date(b.departure) - new Date(a.departure));
        }
        break;
      case 'nameAsc':
        if (searchType === 'hotel') {
          sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        break;
      default:
        sorted = [...results];
    }

    setSortedResults(sorted);
  };

  const handleBookNow = (item) => {
    setSelectedItem(item);
    setShowBookingModal(true);
  };

  const renderResultCard = (item) => {
    const price = item.price || item.rooms?.[0]?.price || 0;
    
    switch (searchType) {
      case 'flight':
        return (
          <div key={item._id} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{item.airline}</h3>
                <p className="text-gray-600">Flight {item.flightNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{price}</p>
                <p className="text-sm text-gray-500">{item.class}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-medium">{new Date(item.departure).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium">{new Date(item.arrival).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        );

      case 'hotel':
        return (
          <div key={item._id} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">📍 {item.location}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{item.rating || 'N/A'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{price}</p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>
            {item.amenities && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Amenities</p>
                <p className="text-sm">{item.amenities.join(', ')}</p>
              </div>
            )}
            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Book Hotel
            </button>
          </div>
        );

      case 'train':
        return (
          <div key={item._id} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{item.trainName}</h3>
                <p className="text-gray-600">Train {item.trainNumber}</p>
                <p className="text-sm text-gray-500">{item.from} → {item.to}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">₹{price}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-medium">{new Date(item.departure).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium">{new Date(item.arrival).toLocaleString()}</p>
              </div>
            </div>
            {item.classes && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Available Classes</p>
                <p className="text-sm">{item.classes.map(c => `${c.type} - ₹${c.price}`).join(', ')}</p>
              </div>
            )}
            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition-colors"
            >
              Book Train
            </button>
          </div>
        );

      case 'bus':
        return (
          <div key={item._id} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{item.operator}</h3>
                <p className="text-gray-600">Bus {item.busNumber}</p>
                <p className="text-sm text-gray-500">{item.from} → {item.to}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">₹{price}</p>
                <p className="text-sm text-gray-500">{item.busType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Departure</p>
                <p className="font-medium">{new Date(item.departure).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival</p>
                <p className="font-medium">{new Date(item.arrival).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => handleBookNow(item)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              Book Bus
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="mt-10 px-4 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold mb-4">No results found</h3>
          <p className="text-gray-600">Try different city names or dates</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Search Results ({results.length})</h3>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            {searchType === 'hotel' && <option value="ratingDesc">Rating: High to Low</option>}
            {searchType === 'hotel' && <option value="nameAsc">Name: A → Z</option>}
            {['flight', 'train', 'bus'].includes(searchType) && (
              <>
                <option value="departureAsc">Departure: Earliest First</option>
                <option value="departureDesc">Departure: Latest First</option>
              </>
            )}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

export default SearchResults;