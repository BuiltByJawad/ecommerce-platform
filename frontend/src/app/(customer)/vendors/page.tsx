'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { Vendor, Product } from '@/types/types';
import Link from 'next/link';
import Pagination from '@/app/(components)/Pagination';

interface VendorListResponse {
  data: Vendor[];
  totalRows: number;
  page: number;
  pageSize: number;
}

const VendorsPage: React.FC = () => {
  const { get } = useAxios();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadVendors = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await get(`/users/vendors?${params.toString()}`);
      const data = res?.data?.data as VendorListResponse;
      setVendors(data?.data || []);
      setTotalItems(data?.totalRows || 0);
    } catch (e) {
      console.error(e);
    }
  }, [get, page, pageSize]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadVendors();
      setIsLoading(false);
    })();
  }, [loadVendors]);

  return (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Vendors</h1>
      {isLoading ? (
        <div className='p-4 text-sm text-gray-700 dark:text-gray-200'>Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className='p-4 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded shadow'>
          No vendors are currently available.
        </div>
      ) : (
        <>
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            {vendors.map((v) => (
              <Link key={v._id} href={`/vendors/${v._id}`} className='block'>
                <div className='h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between'>
                  <div>
                    <h2 className='text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate'>
                      {v.company_name || `${v.f_name || ''} ${v.l_name || ''}`.trim() || 'Unnamed vendor'}
                    </h2>
                    <p className='text-xs text-gray-600 dark:text-gray-300 mb-1 truncate'>
                      {v.business_type || 'Business'}
                    </p>
                    {v.address && (
                      <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{v.address}</p>
                    )}
                  </div>
                  <p className='mt-3 text-xs text-indigo-600 dark:text-indigo-300 font-medium'>
                    View store →
                  </p>
                </div>
              </Link>
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

export default VendorsPage;
