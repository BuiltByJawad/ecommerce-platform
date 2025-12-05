'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { Vendor } from '@/types/types';
import { toast } from 'react-toastify';
import Pagination from '@/app/(components)/Pagination';
import { Search, X } from 'lucide-react';

const AdminCompaniesPage: React.FC = () => {
  const { get, put } = useAxios();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const loadVendors = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter) params.set('status', statusFilter);
      if (q) params.set('q', q);
      const res = await get(`/users/admin/vendors?${params.toString()}`);
      const data = res?.data?.data;
      setVendors(data?.data || []);
      setTotalItems(data?.totalRows || 0);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load vendors');
    }
  }, [get, page, pageSize, statusFilter, q]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadVendors();
      setIsLoading(false);
    })();
  }, [loadVendors]);

  const updateStatus = async (id: string, status: Vendor['vendorStatus']) => {
    if (!status) return;
    try {
      await put(`/users/admin/vendors/${id}/status`, { status });
      setVendors((prev) => prev.map((v) => (v._id === id ? { ...v, vendorStatus: status } : v)));
      toast.success(`Vendor ${status}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update vendor status');
    }
  };

  if (isLoading) {
    return <div className='p-4'>Loading...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>Vendors</h1>
          <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>
            {totalItems} {totalItems === 1 ? 'vendor' : 'vendors'} found
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 sm:items-center'>
          <div className='relative w-full sm:w-56'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search by name, email, tax ID...'
              className='block w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className='absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                aria-label='Clear search'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='w-full sm:w-40 pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
          >
            <option value=''>All statuses</option>
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
            <option value='suspended'>Suspended</option>
          </select>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className='p-6 bg-white dark:bg-gray-800 rounded shadow text-sm text-gray-700 dark:text-gray-200'>
          No vendors match the current filters.
        </div>
      ) : (
        <>
          <div className='grid gap-3'>
            {vendors.map((v) => (
              <div
                key={v._id}
                className='flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700'
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-wrap items-center gap-2 mb-1'>
                    <span className='font-medium truncate max-w-[260px] text-gray-900 dark:text-gray-100'>
                      {v.company_name || `${v.f_name || ''} ${v.l_name || ''}`.trim() || 'Unnamed vendor'}
                    </span>
                    {v.vendorStatus && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          v.vendorStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : v.vendorStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {v.vendorStatus}
                      </span>
                    )}
                    {v.isVerified === false && (
                      <span className='text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700'>
                        email not verified
                      </span>
                    )}
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-300 space-y-0.5'>
                    <p>
                      <span className='font-medium'>Email:</span> {v.email}
                    </p>
                    {v.tax_id && (
                      <p>
                        <span className='font-medium'>Tax ID:</span> {v.tax_id}
                      </p>
                    )}
                    {v.business_type && (
                      <p>
                        <span className='font-medium'>Type:</span> {v.business_type}
                      </p>
                    )}
                    {v.address && (
                      <p>
                        <span className='font-medium'>Address:</span> {v.address}
                      </p>
                    )}
                    {v.phone && (
                      <p>
                        <span className='font-medium'>Phone:</span> {v.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className='flex flex-wrap gap-2 justify-start sm:justify-end text-xs'>
                  {/* Approve: enabled unless already approved */}
                  <button
                    onClick={() => updateStatus(v._id, 'approved')}
                    disabled={v.vendorStatus === 'approved'}
                    className={`px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Approve
                  </button>

                  {/* Reject: enabled unless already rejected */}
                  <button
                    onClick={() => updateStatus(v._id, 'rejected')}
                    disabled={v.vendorStatus === 'rejected'}
                    className={`px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Reject
                  </button>

                  {/* Suspend: enabled unless already suspended */}
                  <button
                    onClick={() => updateStatus(v._id, 'suspended')}
                    disabled={v.vendorStatus === 'suspended'}
                    className={`px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Suspend
                  </button>

                  {/* Mark as pending: only useful when vendor is not already pending */}
                  <button
                    onClick={() => updateStatus(v._id, 'pending')}
                    disabled={v.vendorStatus === 'pending'}
                    className={`px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Mark as pending
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-4'>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              maxButtons={10}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCompaniesPage;
