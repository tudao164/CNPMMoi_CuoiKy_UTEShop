import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFuzzySearch from '../hooks/useFuzzySearch';
import FuzzySearchResults from './FuzzySearchResults';
import { useDebounce } from '../hooks/useDebounce';

const SearchBox = ({ products = [], onSearch, className = "" }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Fuzzy search hook
  const { results, isSearching, getHighlightedText, totalResults } = useFuzzySearch(
    products,
    debouncedQuery,
    {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.2 },
        { name: 'category_name', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
    }
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Handle result click
  const handleResultClick = (product) => {
    setQuery(product.name);
    setShowResults(false);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  // Handle blur (delay to allow clicks on results)
  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      searchRef.current?.blur();
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show results when we have query and results
  useEffect(() => {
    if (isFocused && debouncedQuery.trim() && totalResults > 0) {
      setShowResults(true);
    }
  }, [isFocused, debouncedQuery, totalResults]);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm sản phẩm... (hỗ trợ tìm kiếm mờ)"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              showResults ? 'rounded-b-none' : ''
            }`}
          />
          
          {/* Search Icon */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </form>

      {/* Search Results */}
      {showResults && (
        <FuzzySearchResults
          results={results.slice(0, 8)} // Limit to 8 results
          isSearching={isSearching}
          query={debouncedQuery}
          onResultClick={handleResultClick}
          getHighlightedText={getHighlightedText}
        />
      )}

      {/* Search Tips */}
      {isFocused && !query && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 p-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">💡 Mẹo tìm kiếm:</p>
            <ul className="space-y-1 text-xs">
              <li>• Gõ sai chính tả cũng tìm được (vd: "iphon" → "iPhone")</li>
              <li>• Tìm theo tên sản phẩm, mô tả hoặc danh mục</li>
              <li>• Nhấn Enter để xem tất cả kết quả</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
