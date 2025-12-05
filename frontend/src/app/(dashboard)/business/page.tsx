'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux';
import useAxios from '@/context/axiosContext';
import Link from 'next/link';

const Dashboard = () => {
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.global.currentUser as any);
  const { get } = useAxios();

  const [statusTotals, setStatusTotals] = useState<{
    pending: number;
    approved: number;
    rejected: number;
  } | null>(null);

  useEffect(() => {
    const fetchStatusSummary = async () => {
      if (!user || user.role !== 'company') return;
      try {
        const res = await get('/products/mine?limit=1', {});
        const data = res?.data?.data;
        if (data?.statusTotals) {
          setStatusTotals({
            pending: data.statusTotals.pending ?? 0,
            approved: data.statusTotals.approved ?? 0,
            rejected: data.statusTotals.rejected ?? 0,
          });
        }
      } catch (e) {
        // ignore summary errors on dashboard
      }
    };

    fetchStatusSummary();
  }, [get, user]);

  const isCompany = user?.role === 'company';
  const vendorStatus = user?.vendorStatus as
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | undefined;

  const statusLabel = vendorStatus ? vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1) : 'Not set';

  const statusClass =
    vendorStatus === 'approved'
      ? 'bg-green-100 text-green-800'
      : vendorStatus === 'pending'
        ? 'bg-yellow-100 text-yellow-800'
        : vendorStatus === 'rejected'
          ? 'bg-red-100 text-red-800'
          : vendorStatus === 'suspended'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800';

  return (
    <div className={`${theme} max-w-5xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Business Dashboard</h1>

      {!isCompany ? (
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-200'>
          This area is intended for business accounts. You are currently logged in as
          <span className='font-semibold'> {user?.role || 'guest'}</span>.
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                  Vendor status
                </p>
                <p className='text-sm text-gray-800 dark:text-gray-100 font-medium'>{user?.company_name || 'Your business'}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{statusLabel}</span>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-300'>
              {vendorStatus === 'approved' &&
                'Your vendor account is approved. You can create and manage products and receive orders.'}
              {vendorStatus === 'pending' &&
                'Your application is under review. You will be able to list products once an admin approves your account.'}
              {vendorStatus === 'rejected' &&
                'Your vendor application was rejected. Please contact support if you believe this is an error.'}
              {vendorStatus === 'suspended' &&
                'Your vendor account is suspended. You cannot list or manage products until this is resolved.'}
              {!vendorStatus &&
                'Your vendor status is not yet set. Please complete registration or contact support.'}
            </p>
          </div>

          {statusTotals && (
            <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs text-gray-700 dark:text-gray-200'>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2'>
                Product status summary
              </p>
              <div className='grid grid-cols-3 gap-3 text-center'>
                <div>
                  <p className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {statusTotals.approved}
                  </p>
                  <p className='mt-1 text-[11px] uppercase tracking-wide text-green-700 dark:text-green-300'>
                    Approved
                  </p>
                  <p className='mt-1 text-[11px]'>
                    <Link
                      href='/business/products?status=approved'
                      className='text-blue-600 dark:text-blue-400 hover:underline'
                    >
                      View
                    </Link>
                  </p>
                </div>
                <div>
                  <p className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {statusTotals.pending}
                  </p>
                  <p className='mt-1 text-[11px] uppercase tracking-wide text-yellow-700 dark:text-yellow-300'>
                    Pending
                  </p>
                  <p className='mt-1 text-[11px]'>
                    <Link
                      href='/business/products?status=pending'
                      className='text-blue-600 dark:text-blue-400 hover:underline'
                    >
                      View
                    </Link>
                  </p>
                </div>
                <div>
                  <p className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                    {statusTotals.rejected}
                  </p>
                  <p className='mt-1 text-[11px] uppercase tracking-wide text-red-700 dark:text-red-300'>
                    Rejected
                  </p>
                  <p className='mt-1 text-[11px]'>
                    <Link
                      href='/business/products?status=rejected'
                      className='text-blue-600 dark:text-blue-400 hover:underline'
                    >
                      View
                    </Link>
                  </p>
                </div>
              </div>
              <p className='mt-3 text-[11px] text-gray-600 dark:text-gray-300'>
                Approved products are live and visible to customers. Pending products are waiting for admin
                review. Rejected products are not visible in the store.
              </p>
            </div>
          )}

          <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Company name</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.company_name || 'Not provided'}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Business type</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.business_type || 'Not provided'}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Tax ID</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.tax_id || 'Not provided'}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Contact email</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.email}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Phone</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Address</p>
              <p className='mt-1 text-gray-900 dark:text-gray-100'>{user?.address || 'Not provided'}</p>
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-xs text-gray-600 dark:text-gray-300'>
            Your email verification status is
            <span className='font-semibold'> {user?.isVerified ? 'verified' : 'not verified'}</span>. Make sure your
            email is verified to comply with platform security and quality requirements.
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
