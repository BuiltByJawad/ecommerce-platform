'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { EditIcon } from '@/app/(components)/Icons/Icons';
import { Product } from '@/types/types';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import Loading from '@/app/loading';
import Image from 'next/image';
import Pagination from '@/app/(components)/Pagination';
import { Search, X } from 'lucide-react';
import { useAppSelector } from '../../../redux';

const columnHelper = createColumnHelper<Product>();

const ProductsPage = () => {
  const { get } = useAxios();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.global.currentUser as any);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totals, setTotals] = useState<{ products: number; categories: number }>({
    products: 0,
    categories: 0,
  });

  const isVendor = user?.role === 'company';
  const vendorStatus = user?.vendorStatus as 'pending' | 'approved' | 'rejected' | 'suspended' | undefined;
  const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
  const hasManagePermission = permissions.length === 0 || permissions.includes('MANAGE_PRODUCTS');
  const canManageProducts = (!isVendor || vendorStatus === 'approved') && hasManagePermission;

  // Initialize status filter from URL (?status=pending|approved|rejected)
  useEffect(() => {
    const initialStatus = searchParams.get('status');
    if (initialStatus && ['pending', 'approved', 'rejected'].includes(initialStatus)) {
      setStatusFilter(initialStatus);
    }
  }, [searchParams]);

  const badge = (status?: Product['status'], reason?: string) => {
    const classes =
      status === 'approved'
        ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
        : status === 'pending'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
          : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
    return (
      <span
        title={status === 'rejected' ? reason : undefined}
        className={`px-2 py-1 text-xs font-semibold rounded-full ${classes}`}
      >
        {status ?? 'N/A'}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Product Name',
        cell: (info) => (
          <div className='flex items-center gap-3'>
            <Image
              src={info?.row?.original?.imageUrls?.[0] || '/images/placeholder.jpg'}
              alt={info?.row?.original?.name}
              width={60}
              height={60}
              priority
              className='object-cover rounded-md'
            />
            <span className='font-medium'>{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor((row) => row.category_name, {
        id: 'category_name',
        header: 'Category',
        cell: (info) => <div>{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor((row) => row.status, {
        id: 'status',
        header: 'Status',
        cell: (info) => badge(info.getValue(), info.row.original.rejectionReason),
      }),
      columnHelper.accessor('isInStock', {
        header: 'In Stock',
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              info.getValue()
                ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
            }`}
          >
            {info.getValue() ? 'Yes' : 'No'}
          </span>
        ),
      }),
      columnHelper.accessor('_id', {
        header: 'Actions',
        cell: (info) => (
          <button
            onClick={() => router.push(`/business/products/edit/${info.getValue()}`)}
            className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 rounded hover:bg-indigo-100 dark:hover:bg-gray-700'
            title='Edit Product'
          >
            <EditIcon />
          </button>
        ),
      }),
    ],
    [router]
  );

  const fetchProducts = useCallback(
    async (page = 1, limit = pageSize) => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (statusFilter) params.set('status', statusFilter);
        const response = await get(`/products/mine?${params.toString()}`);
        const data = response?.data?.data;
        setProducts(data?.products || []);
        setTotalPages(data?.pagination?.totalPages || 1);
        setTotalItems(data?.pagination?.totalItems || 0);
        setCurrentPage(data?.pagination?.currentPage || page);
        if (data?.totals)
          setTotals({
            products: data.totals.products || 0,
            categories: data.totals.categories || 0,
          });
      } catch (error) {
        // console.error("Failed to fetch products:", error);
      }
    },
    [statusFilter, pageSize]
  );

  useEffect(() => {
    const loadData = async () => {
      if (!canManageProducts) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      await fetchProducts(currentPage, pageSize);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProducts, currentPage, pageSize, canManageProducts]);

  const categoriesFromProducts = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const id = String(p.category);
      const name = p.category_name || String(p.category);
      if (id) map.set(id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ _id: id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter((p) => String(p.category) === selectedCategory);
    // status filter is applied server-side
    // client-side search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category_name?.toLowerCase().includes(query)
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddProduct = () => {
    router.push('/business/products/add');
  };

  if (isVendor && (!hasManagePermission || vendorStatus !== 'approved')) {
    return (
      <div className='max-w-3xl mx-auto p-4 bg-yellow-50 dark:bg-gray-900 min-h-screen flex items-center'>
        <div className='w-full rounded-lg border border-yellow-200 dark:border-yellow-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100'>
          <h2 className='text-base font-semibold mb-2'>Access to Products is restricted</h2>
          {vendorStatus !== 'approved' ? (
            <p className='mb-1'>
              Your vendor account status is <span className='font-semibold'>{vendorStatus || 'pending'}</span>. You cannot
              manage products until your account is approved by an administrator.
            </p>
          ) : (
            <p className='mb-1'>
              Your account is approved but does not currently have permission to manage products. Please contact the
              administrator to enable <span className='font-semibold'>MANAGE_PRODUCTS</span>.
            </p>
          )}
          <p className='text-xs text-gray-600 dark:text-gray-300'>
            If this is unexpected, contact support or your account representative.
          </p>
        </div>
      </div>
    );
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
            Manage Products
          </h1>
          <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>
            {totals.products} products • {totals.categories} categories
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex gap-2'>
            <div className='relative'>
              <select
                id='category-filter'
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm rounded-lg dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white bg-white'
              >
                <option value=''>All Categories</option>
                {categoriesFromProducts?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='relative'>
              <select
                id='status-filter'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm rounded-lg dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white bg-white'
              >
                <option value=''>All Statuses</option>
                <option value='approved'>Approved</option>
                <option value='pending'>Pending</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm transition-colors whitespace-nowrap'
          >
            Add New Product
          </button>
        </div>
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
            placeholder='Search by name, brand, or category...'
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

      {filteredProducts?.length === 0 ? (
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
          <h3 className='mt-2 text-sm font-semibold text-gray-900 dark:text-white'>No products</h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            {selectedCategory
              ? 'No products found in this category.'
              : 'Get started by creating a new product.'}
          </p>
        </div>
      ) : (
        <>
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
          <div className='mt-4'>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setCurrentPage(1);
              }}
              maxButtons={10}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;
