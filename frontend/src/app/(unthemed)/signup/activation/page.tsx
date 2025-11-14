'use client';
import { useAppSelector } from '@/app/redux';
import React from 'react';
import ActivationForm from './ActivationForm';
import Link from 'next/link';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

const Activation = () => {
  const { post, loading } = useAxios();
  const user = useAppSelector((state) => state.global.currentUser);

  // Resend verification code
  const handleResendCode = async () => {
    try {
      const response = await post('/resend-code', {
        email: user.email,
      });
      if (response?.status === 200) {
        toast.success('Code resent successfully to your mail', {
          position: 'top-right',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      }
      console.log('Verification code resent', response);
    } catch (error) {
      toast.error(error?.response?.data?.error, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  if (user?.isVerified) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
        <div className='bg-white p-6 sm:p-10 rounded-lg shadow-xl w-11/12 sm:w-full max-w-md mx-auto'>
          <div className='text-center mb-4 sm:mb-6'>
            <div className='text-4xl sm:text-5xl text-green-600 mb-2 sm:mb-4'>
              <span role='img' aria-label='check mark'>
                ✅
              </span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Verification Complete</h1>
            <p className='text-gray-600 text-sm sm:text-base'>
              Your email has been successfully verified.
            </p>
          </div>
          <div className='text-center mt-4 sm:mt-6'>
            <Link
              href='/home'
              className='inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded transition-all duration-200'
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
      <div className='bg-white p-6 sm:p-10 rounded-lg shadow-xl w-11/12 sm:w-full max-w-md mx-auto'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4 sm:mb-6'>
          Email Verification
        </h1>
        <p className='text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6'>
          A verification code has been sent to your email. Please enter it below to activate your
          account.
        </p>
        <ActivationForm />
        <div className='text-start mt-4'>
          <button
            onClick={handleResendCode}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleResendCode();
              }
            }}
            className='text-blue-500 hover:text-blue-700 text-sm sm:text-base transition-all duration-200'
            disabled={loading}
          >
            {loading ? 'Sending Code' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activation;
