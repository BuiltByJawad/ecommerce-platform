'use client';

import { useAppDispatch, useAppSelector } from '../../redux';
import { setCurrentUser } from '../../state';
import { ShoppingCart, User } from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosResponse } from 'axios';
import Image from 'next/image';
import Loading from '@/app/loading';
import SearchBar from './SearchBar/SearchBar';
import SubMenu from './SubMenu';
import Notifications from './Notifications';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.global.currentUser);
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { post } = useAxios();
  const cartItems = useAppSelector((state) => state.global.cartItems);

  // Calculate cart items count by summing the quantity of each CartItem
  const cartItemsCount = cartItems
    ? Object.values(cartItems).reduce((total, item) => total + (item.quantity || 0), 0)
    : 0;

  const toggleDropdown = (): void => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      const response: AxiosResponse = await post('/logout', {});
      if (response.status === 200) {
        // Immediately clear auth state and navigate away
        dispatch(setCurrentUser(null));
        setIsDropdownOpen(false);
        toast.success(`Logged out successfully`, {
          position: 'top-right',
          autoClose: 1100,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
        // Use replace to avoid going back to the protected page
        router.replace('/signin');
        // Keep loading true until this component unmounts on navigation
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.data?.error || 'An error occurred', {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
      setLoading(false);
    }
  };

  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <nav
          className={`flex items-center sticky w-full z-20 top-0 py-7 px-6 left-0 h-16 ${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
          }`}
        >
          <div className={`w-full flex items-center justify-between mx-auto`}>
            {user?.role !== 'admin' && (
              <div className='flex items-center justify-center space-x-3 flex-shrink-0 pe-4'>
                <Link href='/home' className='flex items-center space-x-2'>
                  <Image
                    src='https://flowbite.com/docs/images/logo.svg'
                    className='h-8'
                    alt='Flowbite Logo'
                    width={25}
                    height={25}
                  />
                  <span className='self-center text-md font-semibold whitespace-nowrap text-2xl flex-shrink-0'>
                    Ecommerce
                  </span>
                </Link>
              </div>
            )}

            {!user ? (
              <div className='w-full flex justify-center gap-[30px] px-5'>
                <SubMenu /> <SearchBar />
              </div>
            ) : (
              <SearchBar />
            )}

            <div
              className={`flex items-center ${
                user?.role !== 'customer' ? 'justify-between' : 'justify-end'
              }  gap-1 flex-shrink-0`}
            >
              <div className='flex items-center gap-7 flex-shrink-0'>
                <button className='p-0 border-none bg-transparent outline-none flex-shrink-0'>
                  <ThemeSwitcher />
                </button>
                <div className='relative flex-shrink-0'>
                  {user?.role === 'customer' || !user ? (
                    <Link href='/cart'>
                      <ShoppingCart className='cursor-pointer w-6 h-6' size={24} />
                    </Link>
                  ) : (
                    <Notifications />
                  )}

                  {user?.role === 'customer' || !user ? (
                    <Link href='/cart'>
                      <span className='absolute -top-3 -right-3 min-w-[1.25rem] h-5 px-1 text-xs font-semibold text-white bg-red-500 rounded-full flex items-center justify-center leading-none'>
                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                      </span>
                    </Link>
                  ) : null}
                </div>
                <div className='relative flex-shrink-0' ref={dropdownRef}>
                  {!user ? (
                    <Link href='/signin'>
                      <button className='flex items-center cursor-pointer bg-yellow-400 hover:bg-yellow-300 transition duration-100 ease-in-out text-black px-4 py-1'>
                        Login
                      </button>
                    </Link>
                  ) : (
                    <button onClick={toggleDropdown} className='flex items-center cursor-pointer'>
                      <User className='cursor-pointer w-6 h-6' size={24} />
                    </button>
                  )}

                  {isDropdownOpen && (
                    <div className='absolute right-0 mt-2 w-48 py-2 bg-white border rounded shadow-lg dark:bg-gray-800 dark:border-gray-700'>
                      <Link
                        href='/user/profile'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      >
                        Profile
                      </Link>
                      <Link
                        href='/user/settings'
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className='text-start w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
