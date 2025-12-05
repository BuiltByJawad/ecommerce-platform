'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AddProductForm from '@/app/(components)/ProductForm/AddProductForm';
import { useTheme } from 'next-themes';
import { useAppSelector } from '../../../../redux';

const AddProduct: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.global.currentUser as any);

  const isVendor = user?.role === 'company';
  const vendorStatus = user?.vendorStatus as 'pending' | 'approved' | 'rejected' | 'suspended' | undefined;
  const canCreateProducts = !isVendor || vendorStatus === 'approved';

  if (isVendor && !canCreateProducts) {
    return (
      <div className='min-h-screen max-w-3xl mx-auto flex items-center justify-center p-4'>
        <div className='w-full rounded-lg border border-yellow-200 dark:border-yellow-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100'>
          <h1 className='text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white'>Vendor account not approved</h1>
          <p className='mb-1'>
            Your vendor account status is <span className='font-semibold'>{vendorStatus || 'pending'}</span>. You must
            be approved before you can create new products.
          </p>
          <p className='text-xs text-gray-600 dark:text-gray-300'>
            Once your account is approved by an administrator, you will be able to add and manage products from this
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex items-start justify-center'>
      <div
        className={`${
          theme === 'light'
            ? 'bg-gradient-to-br from-gray-100 to-gray-200'
            : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
        } transition-colors duration-300 flex items-center justify-center p-4 w-full`}
      >
        <div className='container mx-auto max-w-full'>
          <div className='flex justify-between items-center mb-2'>
            <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
              Add Product
            </h1>
          </div>
          <AddProductForm theme={theme} router={router} />
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
