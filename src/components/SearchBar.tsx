import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search recipes..." }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded && searchQuery === '') {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, searchQuery]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearchClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (searchQuery === '') {
        setIsExpanded(false);
      } else {
        setSearchQuery('');
        onSearch('');
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center"
    >
      {/* Search Circle/Bar Container */}
      <div
        className={`
          relative flex items-center justify-center
          bg-white rounded-full shadow-lg
          transition-all duration-300 ease-in-out
          ${isExpanded 
            ? 'w-80 h-10 px-4' 
            : 'w-10 h-10 cursor-pointer hover:shadow-xl hover:scale-105'
          }
        `}
        onClick={handleSearchClick}
      >
        {/* Search Icon */}
        <Search 
          className={`
            text-gray-600 transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-4 h-4 mr-2 flex-shrink-0' : 'w-5 h-5'}
          `}
        />
        
        {/* Search Input */}
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            border-none bg-transparent p-0 h-auto
            focus:ring-0 focus:outline-none focus:border-none focus:shadow-none
            focus-visible:ring-0 focus-visible:ring-offset-0
            transition-all duration-300 ease-in-out
            ${isExpanded 
              ? 'w-full opacity-100 pointer-events-auto' 
              : 'w-0 opacity-0 pointer-events-none'
            }
          `}
        />
        
        {/* Clear Button */}
        {isExpanded && searchQuery && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
