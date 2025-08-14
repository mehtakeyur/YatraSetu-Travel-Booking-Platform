import React, { useState, useEffect, useRef } from 'react';

const AutocompleteInput = ({ placeholder, value, onChange, type, field, icon }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const backendBaseUrl = 'http://localhost:5000';
      let url = '';
      
      if (type === 'hotels') {
        url = `${backendBaseUrl}/api/${type}/suggestions?query=${encodeURIComponent(query)}`;
      } else {
        url = `${backendBaseUrl}/api/${type}/suggestions?field=${field}&query=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    fetchSuggestions(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
      {icon && (
        <span className="absolute right-3 top-3 text-gray-400">
          {icon}
        </span>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-10 top-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;