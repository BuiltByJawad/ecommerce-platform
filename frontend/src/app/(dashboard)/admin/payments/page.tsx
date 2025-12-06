'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';

interface PaymentDoc {
  _id: string;
  user?: { _id: string; email?: string; role?: string } | null;
  products?: Array<{ product: string; quantity: number; price: number }>;
  totalAmount: number;
  stripeSessionId?: string;
  createdAt: string;
}

const AdminPaymentsPage: React.FC = () => {
  const { theme } = useTheme();
  const { get } = useAxios();

  const [data, setData] = useState<PaymentDoc[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (email.trim()) params.email = email.trim();
      const res = await get('/payments/admin/list', { params });
      const payload = res?.data?.data || {};
      setData(Array.isArray(payload.data) ? payload.data : []);
      setTotal(Number(payload?.pagination?.total) || 0);
    } finally {
      setLoading(false);
    }
  }, [get, page, limit, email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageInfo = useMemo(() => {
    if (!total) return 'No results';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total}`;
  }, [page, limit, total]);

  return (
    <div className={`${theme} w-full max-w-full p-4`}>
      <h1 className='text-xl font-semibold mb-4'>Payments</h1>

      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Filter by customer email'
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        />
        <button onClick={() => { setPage(1); fetchData(); }} className='px-2 py-1 border rounded dark:border-gray-700'>Apply</button>
        <div className='ml-auto flex items-center gap-2'>
          <div className='text-xs text-gray-600'>{pageInfo}</div>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className='px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700'
          >
            Prev
          </button>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className='px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700'
          >
            Next
          </button>
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
            className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className='overflow-x-auto shadow rounded border border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200 text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-3 py-2 text-left font-semibold'>Date</th>
              <th className='px-3 py-2 text-left font-semibold'>Customer</th>
              <th className='px-3 py-2 text-left font-semibold'>Items</th>
              <th className='px-3 py-2 text-left font-semibold'>Total</th>
              <th className='px-3 py-2 text-left font-semibold'>Session</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td className='px-3 py-3' colSpan={5}>Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className='px-3 py-3' colSpan={5}>No payments found</td>
              </tr>
            ) : (
              data.map((p) => (
                <tr key={p._id} className='hover:bg-gray-50'>
                  <td className='px-3 py-2'>{new Date(p.createdAt).toLocaleString()}</td>
                  <td className='px-3 py-2'>{p.user?.email || '-'}</td>
                  <td className='px-3 py-2'>{Array.isArray(p.products) ? p.products.reduce((acc, it) => acc + (it.quantity || 0), 0) : 0}</td>
                  <td className='px-3 py-2'>${Number(p.totalAmount || 0).toFixed(2)}</td>
                  <td className='px-3 py-2'>{p.stripeSessionId || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
