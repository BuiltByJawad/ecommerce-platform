'use client';

import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { useAppSelector } from '@/app/redux';
import { useRouter } from 'next/navigation';
import SearchBarDropdown from './SearchBarDropdown';

export default function SearchBar() {
  const user = useAppSelector((state) => state.global.currentUser);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showBackdrop, setShowBackdrop] = useState(false);

  // Add ref for the search input
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchBarRef = useRef<HTMLFormElement | null>(null);

  const categoryOptions = [
    {
      value: 'all',
      label: 'All Departments',
    },
    {
      value: 'electronics',
      label: 'Electronics',
    },
    { value: 'books', label: 'Books' },
    {
      value: 'clothing',
      label: 'Clothing',
    },
    {
      value: 'home',
      label: 'Home & Kitchen lorrrrrrrxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate search query
    if (!searchQuery.trim()) {
      return;
    }

    // Navigate to search results page with query parameters
    const searchParams = new URLSearchParams({
      query: searchQuery.trim(),
      category: category,
    });

    router.push(`/search?${searchParams.toString()}`);

    // Clear backdrop and blur input after search
    setShowBackdrop(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Function to focus the search input after dropdown closes
  const handleDropdownClose = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      // Keep backdrop visible since input is focused
      setShowBackdrop(true);
    }
  };

  // Handle backdrop click - hide backdrop and blur input
  const handleBackdropClick = () => {
    setShowBackdrop(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Handle input focus - show backdrop
  const handleInputFocus = () => {
    setShowBackdrop(true);
  };

  // Handle input blur - hide backdrop
  const handleInputBlur = () => {
    setShowBackdrop(false);
  };

  // Handle clicks outside the search bar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (searchBarRef.current && target && !searchBarRef.current.contains(target)) {
        setShowBackdrop(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className='w-full max-w-2xl px-5'>
      {user?.role === 'customer' ? (
        <form
          onSubmit={handleSubmit}
          className='flex items-center bg-white rounded-lg shadow-md border border-gray-300'
          ref={searchBarRef}
        >
          <SearchBarDropdown
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            onDropdownClose={handleDropdownClose}
            showBackdrop={showBackdrop}
            onBackdropClick={handleBackdropClick}
          />
          <input
            ref={searchInputRef}
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder='Search Products'
            className={`${
              showBackdrop && `z-[11111]`
            } w-full px-4 text-gray-900 text-sm focus:outline-none h-11`}
          />
          <button
            type='submit'
            className={`${
              showBackdrop && `z-[11111]`
            } bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 rounded-r-lg 
            flex items-center justify-center h-11`}
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='flex items-center bg-white rounded-lg shadow-md border border-gray-300'
        >
          <input
            type='search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by name or payment ID'
            className='w-full px-4 py-2.5 text-gray-900 text-sm focus:outline-none rounded-l-lg'
          />
          <button
            type='submit'
            className='bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2.5 rounded-r-lg flex items-center justify-center'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
