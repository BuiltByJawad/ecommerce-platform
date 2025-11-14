'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { Product } from '@/types/types';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Pagination from '@/app/(components)/Pagination';
import { Search, X } from 'lucide-react';

const ModerationPage: React.FC = () => {
  const { get, put } = useAxios();
  const [pending, setPending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const loadPending = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (q) params.set('q', q);
      const res = await get(`/products/moderation/pending?${params.toString()}`);
      const data = res?.data?.data;
      setPending(data?.products || []);
      setTotalItems(data?.pagination?.totalItems || 0);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load pending products');
    }
  }, [q, page, pageSize]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadPending();
      setIsLoading(false);
    })();
  }, [loadPending]);

  const approve = async (id: string) => {
    try {
      await put(`/products/moderation/approve/${id}`, {});
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success('Approved');
    } catch (e) {
      console.error(e);
      toast.error('Approve failed');
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):') || '';
    try {
      await put(`/products/moderation/reject/${id}`, { reason });
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success('Rejected');
    } catch (e) {
      console.error(e);
      toast.error('Reject failed');
    }
  };

  if (isLoading) {
    return <div className='p-4'>Loading...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen'>
      {/* Header Section */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h1 className='text-lg sm:text-xl font-bold text-gray-800 dark:text-white'>
              Moderation Queue
            </h1>
            <p className='text-xs text-gray-600 dark:text-gray-300 mt-0.5'>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} pending review
            </p>
          </div>
        </div>

        {/* Search Filter */}
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search by name, brand, or category...'
            className='block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              aria-label='Clear search'
            >
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>

      {pending.length === 0 ? (
        <div className='p-6 bg-white dark:bg-gray-800 rounded shadow'>No pending products.</div>
      ) : (
        <>
          <div className='grid gap-3'>
            {pending.map((p) => (
              <div
                key={p._id}
                className='flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded shadow'
              >
                <Image
                  src={p.imageUrls?.[0] || '/images/placeholder.jpg'}
                  alt={p.name}
                  width={64}
                  height={64}
                  className='rounded object-cover'
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-medium truncate max-w-[320px]'>{p.name}</span>
                    <span className='text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800'>
                      pending
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>
                    {p.brand} • {p.category_name} • ${Number(p.price).toFixed(2)}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => approve(p._id!)}
                    className='px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700'
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(p._id!)}
                    className='px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700'
                  >
                    Reject
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

export default ModerationPage;
