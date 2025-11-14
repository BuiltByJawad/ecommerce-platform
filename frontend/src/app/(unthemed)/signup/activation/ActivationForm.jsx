'use client';
import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAxios from '@/context/axiosContext';
import { ToastContainer, toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../redux';
import { setCurrentUser } from '../../../state';

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d+$/, 'Verification code must be a number')
    .length(6, 'Verification code must be exactly 6 digits'),
});

const ActivationForm = () => {
  const { post, loading } = useAxios();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.global.currentUser);

  const handleVerification = async (values, { setSubmitting }) => {
    try {
      const response = await post('/verify-code', {
        email: user.email,
        code: values.code,
      });
      if (response?.status === 200) {
        toast.success('Code verified successfully!', {
          position: 'top-right',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
        dispatch(setCurrentUser(response?.data?.data?.user));
      } else {
        toast.error(response.error || 'Code expired, try resending', {
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
    } catch (error) {
      toast.error(error?.response?.data?.error || 'An error occurred. Please try again.', {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ code: '' }}
      validationSchema={validationSchema}
      onSubmit={handleVerification}
    >
      {({ isSubmitting, submitCount }) => (
        <Form>
          <ToastContainer />
          <Field
            type='text'
            name='code'
            placeholder='Enter verification code'
            className='w-full p-2 border border-gray-300 rounded mb-4'
          />
          {submitCount > 0 && (
            <ErrorMessage name='code' component='div' className='text-red-500 text-sm mb-4' />
          )}

          <button
            type='submit'
            className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300'
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ActivationForm;
