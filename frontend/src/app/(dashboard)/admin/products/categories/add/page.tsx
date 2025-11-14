'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import AddCategoryForm from '@/app/(components)/CategoryForm/AddCategoryForm';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const AddCategoryPage: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div className='min-h-screen max-w-7xl mx-auto'>
      <div
        className={`${
          theme === 'light'
            ? 'bg-gradient-to-br from-gray-100 to-gray-200'
            : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
        } transition-colors duration-300 p-4 w-full`}
      >
        <div className='container mx-auto max-w-full'>
          <div className='flex items-center gap-4 mb-4'>
            <button
              onClick={() => router.push('/admin/products/categories')}
              className='flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <ArrowLeft className='h-5 w-5' />
              <span>Back to Categories</span>
            </button>
          </div>
          <div className='flex justify-between items-center mb-2'>
            <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
              Add Product Category
            </h1>
          </div>
          <AddCategoryForm theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default AddCategoryPage;
