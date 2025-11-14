'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { useTheme } from 'next-themes';
import { useAppSelector, useAppDispatch } from '@/app/redux';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import { setCurrentUser } from '@/app/state';

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Custom ErrorMessage component to show errors only after submission
const CustomErrorMessage = ({ name, submitCount }: { name: string; submitCount: number }) => {
  return submitCount > 0 ? (
    <ErrorMessage name={name} component='p' className='mt-1 text-sm text-red-600' />
  ) : null;
};

const SettingsPage = () => {
  const { theme } = useTheme();
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const user = useAppSelector((state) => state.global.currentUser);
  const dispatch = useAppDispatch();
  const { put, loading } = useAxios();
  // Profile form initial values
  const profileInitialValues: ProfileFormValues = {
    firstName: user?.f_name || '',
    lastName: user?.l_name || '',
    email: user?.email || '',
  };

  // Password form initial values
  const passwordInitialValues: PasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Profile form validation
  const validateProfile = (values: ProfileFormValues) => {
    const errors: Partial<ProfileFormValues> = {};
    if (!values.firstName.trim()) errors.firstName = 'First name is required';
    if (!values.lastName.trim()) errors.lastName = 'Last name is required';
    if (!values.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      errors.email = 'Please enter a valid email';
    return errors;
  };

  // Password form validation
  const validatePassword = (values: PasswordFormValues) => {
    const errors: Partial<PasswordFormValues> = {};
    if (!values.currentPassword) errors.currentPassword = 'Current password is required';
    if (!values.newPassword) errors.newPassword = 'New password is required';
    else if (values.newPassword.length < 8)
      errors.newPassword = 'Password must be at least 8 characters';
    if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (values.newPassword !== values.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    return errors;
  };
  console.log(user);

  // Profile form submission
  const handleProfileSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const updateData = {
        f_name: values.firstName,
        l_name: values.lastName,
        email: values.email,
      };

      const response = await put(`/users/user/${user?.id}`, updateData);

      if (response?.status === 200) {
        toast.success('Profile updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        const newData = response?.data?.data?.user;
        console.log(newData);
        dispatch(
          setCurrentUser({
            ...user,
            f_name: newData.f_name,
            l_name: newData.l_name,
            email: newData.email,
          })
        );
        setSuccessMessage('Your profile has been updated.');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      setSuccessMessage('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Password form submission
  const handlePasswordSubmit = async (
    values: PasswordFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    try {
      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const response = await put(`/users/user/${user?.id}/password`, passwordData);

      if (response?.status === 200) {
        toast.success('Password updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setSuccessMessage('Your password has been updated.');
        setShowPasswordModal(false);
        resetForm();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      setSuccessMessage('Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const inputClassName = `w-full p-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClassName = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  }`;

  const cardClassName = `border rounded-md p-6 mb-6 ${
    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`;

  const headingClassName = `text-lg font-semibold mb-4 ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`;

  const textClassName = `text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <h1
          className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          Your Account
        </h1>

        {/* Personal Information Form */}
        <Formik
          initialValues={profileInitialValues}
          validate={validateProfile}
          onSubmit={handleProfileSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({
            isSubmitting,
            submitCount,
            setErrors,
            handleChange,
          }: FormikProps<ProfileFormValues>) => (
            <Form className={cardClassName}>
              <h2 className={headingClassName}>Login & Security</h2>
              <div className='space-y-4'>
                {/* First Name */}
                <div>
                  <label htmlFor='firstName' className={labelClassName}>
                    First Name
                  </label>
                  <Field
                    type='text'
                    id='firstName'
                    name='firstName'
                    className={inputClassName}
                    placeholder='Enter your first name'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      setErrors({
                        ...validateProfile({
                          ...profileInitialValues,
                          firstName: e.target.value,
                        }),
                        firstName: undefined,
                      });
                    }}
                  />
                  <CustomErrorMessage name='firstName' submitCount={submitCount} />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor='lastName' className={labelClassName}>
                    Last Name
                  </label>
                  <Field
                    type='text'
                    id='lastName'
                    name='lastName'
                    className={inputClassName}
                    placeholder='Enter your last name'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      setErrors({
                        ...validateProfile({
                          ...profileInitialValues,
                          lastName: e.target.value,
                        }),
                        lastName: undefined,
                      });
                    }}
                  />
                  <CustomErrorMessage name='lastName' submitCount={submitCount} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor='email' className={labelClassName}>
                    Email
                  </label>
                  <Field
                    type='email'
                    id='email'
                    name='email'
                    className={inputClassName}
                    placeholder='Enter your email'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      setErrors({
                        ...validateProfile({
                          ...profileInitialValues,
                          email: e.target.value,
                        }),
                        email: undefined,
                      });
                    }}
                  />
                  <CustomErrorMessage name='email' submitCount={submitCount} />
                </div>
              </div>

              {/* Form Actions */}
              <div className='mt-6 flex justify-end space-x-3'>
                <button
                  type='submit'
                  disabled={isSubmitting || loading}
                  className='px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-md hover:bg-yellow-500 disabled:bg-yellow-300 transition duration-200'
                >
                  {isSubmitting || loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type='reset'
                  className={`px-4 py-2 font-medium rounded-md transition duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>

              {successMessage && (
                <p
                  className={`mt-4 text-sm text-center ${
                    successMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {successMessage}
                </p>
              )}
            </Form>
          )}
        </Formik>

        {/* Password Management */}
        <section className={cardClassName}>
          <h2 className={headingClassName}>Password</h2>
          <p className={textClassName}>Change your password to keep your account secure.</p>
          <button
            type='button'
            onClick={() => setShowPasswordModal(true)}
            className='px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-md hover:bg-yellow-500 transition duration-200'
          >
            Change Password
          </button>
        </section>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]'>
            <div
              className={`rounded-md p-6 max-w-md w-full ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2
                className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Change Password
              </h2>
              <Formik
                initialValues={passwordInitialValues}
                validate={validatePassword}
                onSubmit={handlePasswordSubmit}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({
                  isSubmitting,
                  submitCount,
                  setErrors,
                  handleChange,
                }: FormikProps<PasswordFormValues>) => (
                  <Form className='space-y-4'>
                    <div>
                      <label
                        htmlFor='currentPassword'
                        className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Current Password
                      </label>
                      <Field
                        type='password'
                        id='currentPassword'
                        name='currentPassword'
                        className={inputClassName}
                        placeholder='Enter current password'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          setErrors({
                            ...validatePassword({
                              ...passwordInitialValues,
                              currentPassword: e.target.value,
                            }),
                            currentPassword: undefined,
                          });
                        }}
                      />
                      <CustomErrorMessage name='currentPassword' submitCount={submitCount} />
                    </div>
                    <div>
                      <label
                        htmlFor='newPassword'
                        className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        New Password
                      </label>
                      <Field
                        type='password'
                        id='newPassword'
                        name='newPassword'
                        className={inputClassName}
                        placeholder='Enter new password'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          setErrors({
                            ...validatePassword({
                              ...passwordInitialValues,
                              newPassword: e.target.value,
                            }),
                            newPassword: undefined,
                          });
                        }}
                      />
                      <CustomErrorMessage name='newPassword' submitCount={submitCount} />
                    </div>
                    <div>
                      <label
                        htmlFor='confirmPassword'
                        className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Confirm New Password
                      </label>
                      <Field
                        type='password'
                        id='confirmPassword'
                        name='confirmPassword'
                        className={inputClassName}
                        placeholder='Confirm new password'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          setErrors({
                            ...validatePassword({
                              ...passwordInitialValues,
                              confirmPassword: e.target.value,
                            }),
                            confirmPassword: undefined,
                          });
                        }}
                      />
                      <CustomErrorMessage name='confirmPassword' submitCount={submitCount} />
                    </div>
                    <div className='flex justify-end space-x-3'>
                      <button
                        type='submit'
                        disabled={isSubmitting || loading}
                        className='px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-md hover:bg-yellow-500 disabled:bg-yellow-300 transition duration-200'
                      >
                        {isSubmitting || loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type='button'
                        onClick={() => setShowPasswordModal(false)}
                        className={`px-4 py-2 font-medium rounded-md transition duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
