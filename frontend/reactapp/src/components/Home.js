import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import BookingWidget from './BookingWidget';
import SearchResults from './SearchResults';
import PopularServices from './PopularServices';
import WhyChooseUs from './WhyChooseUs';
import Testimonials from './Testimonials';
import Footer from './Footer';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('flights');
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['flights', 'hotels', 'trains', 'buses'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowResults(false);
    setSearchResults(null);
  };

  const handleSearch = (results) => {
    setSearchResults(results);
    setShowResults(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar onTabChange={handleTabChange} activeTab={activeTab} />
      
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-float">
              Your Journey Begins Here
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book flights, hotels, trains, and buses at the best prices
            </p>
          </div>

          {/* Booking Widget */}
          <BookingWidget 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Search Results */}
      {showResults && (
        <SearchResults 
          results={searchResults}
          searchType={activeTab}
        />
      )}

      {/* Other Sections */}
      <PopularServices />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;