'use client';
import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface SearchBarDropdownOption {
  value: string;
  label: string;
}

interface SearchBarDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchBarDropdownOption[];
  onDropdownClose?: () => void;
  showBackdrop: boolean;
  onBackdropClick?: () => void;
}

export default function SearchBarDropdown({
  value,
  onChange,
  options,
  onDropdownClose,
  showBackdrop,
  onBackdropClick,
}: SearchBarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    // Call the callback to focus the search input after selection
    if (onDropdownClose) {
      // Use setTimeout to ensure the dropdown closes first
      setTimeout(() => {
        onDropdownClose();
      }, 0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
        // Don't call onDropdownClose here since parent handles backdrop
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent event bubbling when clicking inside dropdown
  const handleDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={dropdownRef}
      className={`${showBackdrop && `z-[11111]`} relative w-[290px]`}
      onClick={handleDropdownClick}
    >
      {/* Dropdown Button */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className='bg-gray-200 text-gray-700 text-sm font-medium rounded-l-lg px-4 pr-8 cursor-pointer focus:outline-none border border-gray-300 flex items-center justify-between h-11 relative'
        style={{
          zIndex: isOpen ? 1001 : 11111,
        }}
      >
        <span className='flex-1 w-[100px] truncate leading-tight'>{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className='w-[320px] flex flex-col gap-y-[5px] items-start justify-center absolute top-full left-0 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto'
          style={{ zIndex: 1000 }}
          onClick={handleDropdownClick}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSelect(option.value);
              }}
              className={`w-full truncate px-4 py-2.5 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 break-words leading-tight ${
                value === option.value ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Parent-controlled backdrop - only show when showBackdrop is true */}
      {showBackdrop && (
        <div
          className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm'
          style={{ zIndex: 999 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onBackdropClick) {
              onBackdropClick();
            }
          }}
        />
      )}
    </div>
  );
}
