'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../redux';
import { setCurrentUser } from '../../../state';
import { useRouter } from 'next/navigation';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import { AxiosResponse } from 'axios';
import Link from 'next/link';
import { Edit, Package, Settings, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

const ProfileSection = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { post } = useAxios();
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.global.currentUser);
  const [loading, setLoading] = useState(false);

  const userInfo = {
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '(123) 456-7890',
    address: user?.address || '123 Main St, Seattle, WA 98101',
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response: AxiosResponse = await post('/logout', {});
      if (response.status === 200) {
        toast.success('Logged out successfully', {
          position: 'top-right',
          autoClose: 1100,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: theme,
        });
        router.push('/signin');
        setTimeout(() => {
          dispatch(setCurrentUser(null));
          setLoading(false);
        }, 500);
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
        theme: theme,
      });
      setLoading(false);
    }
  };

  return (
    <div className={`${theme} bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8`}>
      <div className='bg-white dark:bg-gray-800 max-w-4xl mx-auto rounded-lg shadow-md p-6'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6'>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>Your Account</h1>
          <Link
            href='/user/edit-profile'
            className='flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
          >
            <Edit className='w-5 h-5 mr-2' />
            Edit Profile
          </Link>
        </div>

        {/* User Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div>
            <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
              Personal Information
            </h2>
            <div className='mt-4 space-y-2'>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium text-gray-800 dark:text-gray-200'>Name:</span>{' '}
                {userInfo.name}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium text-gray-800 dark:text-gray-200'>Email:</span>{' '}
                {userInfo.email}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium text-gray-800 dark:text-gray-200'>Phone:</span>{' '}
                {userInfo.phone}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                <span className='font-medium text-gray-800 dark:text-gray-200'>Address:</span>{' '}
                {userInfo.address}
              </p>
            </div>
          </div>
          <div>
            <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
              Account Actions
            </h2>
            <div className='mt-4 space-y-4'>
              <Link
                href='/cart'
                className='flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <Package className='w-5 h-5 mr-2' />
                Your Orders
              </Link>
              <Link
                href='/settings'
                className='flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <Settings className='w-5 h-5 mr-2' />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className='flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50'
              >
                <LogOut className='w-5 h-5 mr-2' />
                {loading ? 'Logging out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
