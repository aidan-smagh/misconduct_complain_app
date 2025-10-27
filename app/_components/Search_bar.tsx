"use client";
import React, { useState, useRef, useEffect } from "react";
import { NominatimSuggestion } from "@/lib/types/nominatim";

const Search_bar = ({ show_map_btn = true, onSearch, onSuggestionsFetch, onSuggestionClick }) => {
  const [input, setInput] = useState(""); // Manage input state
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]); // Manage suggestions state
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Handle clicks outside of suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setSuggestions([]); // Hide suggestions
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (onSearch && input.trim()) {
      onSearch(input); // Pass the input value to the parent function
    }
    setSuggestions([]); // Clear suggestions after search
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value); // Update input value

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!value.trim() || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (onSuggestionsFetch) {
      setLoading(true);

      // Debounce suggestions fetch (300ms)
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const fetchedSuggestions = await onSuggestionsFetch(value);
          setSuggestions(fetchedSuggestions); // Update suggestions state
        } catch (err) {
          console.error("Failed to fetch suggestions:", err);
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: NominatimSuggestion) => {
    setInput(suggestion.display_name);
    setSuggestions([]); // Clear suggestions
    if (onSuggestionClick) {
      onSuggestionClick(suggestion); // Trigger search with the selected suggestion
    }
  };

  return (
    <div className="relative flex items-center justify-center mt-5 w-full">
      <form
        onSubmit={handleSearch}
        className="flex relative w-full max-w-3xl rounded-md shadow-md"
      >
        {/* Input Field */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search Location"
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input} // Bind input value
          onChange={handleInputChange} // Update state on input
          aria-label="Search address"
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute top-1/2 right-[70px] transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
        
        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute top-full left-0 w-full max-w-3xl bg-white border border-gray-300 rounded-md shadow-md mt-2 z-[401]"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </form>


      {/* Map button - maintaining compatibility with your original component */}
      {show_map_btn && (
        <button
          type="button"
          className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={() => {
            window.location.href = "/map";
          }}
        >
          Map View
        </button>
      )}
    </div>
  );
};

export default Search_bar;
