'use client';
import React, { useState } from 'react';
import BusinessSignUpForm from './BusinessSignUpForm';
import Loading from '@/app/loading';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

const BusinessRegister = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <>
      <ToastContainer />
      {isLoading ? (
        <Loading />
      ) : (
        <div className='bg-gray-100 w-full flex flex-col flex-wrap min-h-screen items-center justify-center py-8'>
          <div className='w-[600px] mb-3'>
            <div className='bg-white shadow-lg rounded-xl p-6 mx-auto border border-gray-300'>
              <h2 className='text-2xl font-semibold text-gray-800 text-center mb-1'>
                Business Registration
              </h2>
              <p className='text-center text-gray-600 text-sm mb-4'>
                Register your business to start selling on our platform
              </p>
              <BusinessSignUpForm onLoadingChange={handleLoadingChange} />
              <p className='mt-6 text-center text-sm text-gray-600'>
                Already have an account?{' '}
                <Link
                  href='/signin'
                  className='text-blue-600 font-medium hover:underline transition duration-200'
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessRegister;
