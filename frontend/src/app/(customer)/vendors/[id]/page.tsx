'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { Vendor, Product } from '@/types/types';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface VendorStoreResponse {
  vendor: Vendor;
  products: Product[];
}

const VendorStorePage: React.FC = () => {
  const { get } = useAxios();
  const params = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStore = useCallback(async () => {
    try {
      const res = await get(`/users/vendors/${params.id}/store`);
      const data = res?.data?.data as VendorStoreResponse;
      setVendor(data?.vendor || null);
      setProducts(data?.products || []);
    } catch (e) {
      console.error(e);
    }
  }, [get, params.id]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadStore();
      setIsLoading(false);
    })();
  }, [loadStore]);

  if (isLoading) {
    return <div className='p-4 text-sm text-gray-700 dark:text-gray-200'>Loading store...</div>;
  }

  if (!vendor) {
    return (
      <div className='max-w-3xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center'>
        <div className='w-full rounded-lg bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100 shadow'>
          Vendor not found.
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      <div className='mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
            {vendor.company_name || `${vendor.f_name || ''} ${vendor.l_name || ''}`.trim() || 'Vendor store'}
          </h1>
          <p className='text-xs text-gray-600 dark:text-gray-300'>
            {vendor.business_type || 'Marketplace vendor'}
          </p>
          {vendor.address && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{vendor.address}</p>
          )}
        </div>
        <div className='text-xs text-gray-600 dark:text-gray-300'>
          <Link href='/vendors' className='text-indigo-600 dark:text-indigo-300 hover:underline'>
            ← Back to vendors
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className='p-4 bg-white dark:bg-gray-800 rounded shadow text-sm text-gray-700 dark:text-gray-200'>
          This vendor has no products available yet.
        </div>
      ) : (
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((p) => (
            <Link
              key={p._id}
              href={`/products/${encodeURIComponent(p.name)}/dp/${p._id}`}
              className='block'
            >
              <div className='h-full bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col'>
                <div className='relative w-full h-40 bg-gray-100 dark:bg-gray-900'>
                  <Image
                    src={p.imageUrls?.[0] || '/images/placeholder.jpg'}
                    alt={p.name}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='p-3 flex-1 flex flex-col justify-between'>
                  <div>
                    <h2 className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>{p.name}</h2>
                    <p className='mt-1 text-xs text-gray-600 dark:text-gray-300 truncate'>{p.brand}</p>
                  </div>
                  <p className='mt-2 text-sm font-bold text-gray-900 dark:text-gray-100'>
                    ${Number(p.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorStorePage;
