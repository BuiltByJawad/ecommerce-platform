'use client';
import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import Loading from '@/app/loading';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
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
        <div className='bg-gray-100 w-full flex flex-col flex-wrap h-screen items-center justify-center'>
          <div className='w-[400px] mb-3'>
            <div className='bg-white shadow-lg rounded-xl p-4 space-y-3 mx-auto border border-gray-300'>
              <h2 className='text-2xl font-semibold text-gray-800 text-center'>Sign Up</h2>

              <SignUpForm onLoadingChange={handleLoadingChange} />

              <p className='mt-6 text-center text-sm text-gray-600'>
                Already have an account?{' '}
                <a
                  href='/signin'
                  className='text-blue-600 font-medium hover:underline transition duration-200'
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
