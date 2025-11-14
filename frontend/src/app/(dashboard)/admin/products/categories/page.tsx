'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { EditIcon } from '@/app/(components)/Icons/Icons';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import Loading from '@/app/loading';
import { Search, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  requiresApproval: boolean;
  allowedUsers: string[];
  attributes: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

const columnHelper = createColumnHelper<Category>();

const CategoriesPage = () => {
  const { get } = useAxios();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category Name',
        cell: (info) => (
          <div className='font-medium text-gray-900 dark:text-white'>{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => (
          <div className='text-sm text-gray-600 dark:text-gray-300 max-w-md truncate'>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('requiresApproval', {
        header: 'Requires Approval',
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              info.getValue()
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
            }`}
          >
            {info.getValue() ? 'Yes' : 'No'}
          </span>
        ),
      }),
      columnHelper.accessor('attributes', {
        header: 'Attributes',
        cell: (info) => (
          <div className='text-sm text-gray-700 dark:text-gray-200'>
            {info.getValue()?.length || 0} attribute{info.getValue()?.length !== 1 ? 's' : ''}
          </div>
        ),
      }),
      columnHelper.accessor('allowedUsers', {
        header: 'Allowed Users',
        cell: (info) => (
          <div className='text-sm text-gray-700 dark:text-gray-200'>
            {info.getValue()?.length > 0
              ? `${info.getValue().length} user${info.getValue().length !== 1 ? 's' : ''}`
              : 'All users'}
          </div>
        ),
      }),
      columnHelper.accessor('_id', {
        header: 'Actions',
        cell: (info) => (
          <button
            onClick={() => router.push(`/admin/products/categories/edit/${info.getValue()}`)}
            className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 rounded hover:bg-indigo-100 dark:hover:bg-gray-700'
            title='Edit Category'
          >
            <EditIcon />
          </button>
        ),
      }),
    ],
    [router]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await get(`/categories/all`);
      const data = response?.data?.data;
      setCategories(data?.categories || []);
      setTotalCategories(data?.categories?.length || 0);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  }, [get]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchCategories();
      setIsLoading(false);
    };
    loadData();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
      );
    }
    return list;
  }, [categories, searchQuery]);

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddCategory = () => {
    router.push('/admin/products/categories/add');
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
            Manage Categories
          </h1>
          <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>
            {totalCategories} categories
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm transition-colors whitespace-nowrap'
        >
          Add New Category
        </button>
      </div>

      {/* Search Filter */}
      <div className='mb-4'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by name or description...'
            className='block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              aria-label='Clear search'
            >
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>

      {filteredCategories?.length === 0 ? (
        <div className='text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              vectorEffect='non-scaling-stroke'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
            />
          </svg>
          <h3 className='mt-2 text-sm font-semibold text-gray-900 dark:text-white'>
            No categories
          </h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            {searchQuery
              ? 'No categories found matching your search.'
              : 'Get started by creating a new category.'}
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200'
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
