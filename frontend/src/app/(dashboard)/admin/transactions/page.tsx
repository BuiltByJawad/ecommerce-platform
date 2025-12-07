'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import AdminTable from '@/app/(components)/AdminTable';
import { formatDateTime } from '@/utils/date';

interface OrderRow {
  _id: string;
  email?: string;
  paymentMethod?: string;
  status?: string;
  transactionId?: string;
  createdAt: string;
  orderSummary?: { total?: number };
}

const AdminTransactionsPage: React.FC = () => {
  const { theme } = useTheme();
  const { get } = useAxios();

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (email.trim()) params.email = email.trim();
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await get('/order-details/findall', { params });
      const payload = res?.data?.data || {};
      setRows(Array.isArray(payload.data) ? payload.data : []);
      setTotal(Number(payload?.pagination?.total) || 0);
    } finally {
      setLoading(false);
    }
  }, [get, page, limit, email, status, from, to]);

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
    <div className={`${theme} dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-2 font-sans text-slate-900 dark:text-slate-200`}>
      <h1 className='text-xl font-semibold mb-4'>Transactions</h1>

      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Filter by customer email'
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        >
          <option value=''>All statuses</option>
          <option value='Pending'>Pending</option>
          <option value='Complete'>Complete</option>
          <option value='Shipped'>Shipped</option>
          <option value='Delivered'>Delivered</option>
          <option value='Cancelled'>Cancelled</option>
        </select>
        <input
          type='date'
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        />
        <input
          type='date'
          value={to}
          onChange={(e) => setTo(e.target.value)}
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

      <AdminTable
        columns={[
          'Date',
          'Order',
          'Customer',
          'Payment',
          'Status',
          'Transaction',
          'Total',
        ]}
        columnAlign={['left','left','left','left','left','left','right']}
        loading={loading}
        dataLength={rows.length}
        emptyMessage='No transactions found'
        stickyHeader
        stickyMaxHeight='70vh'
        footer={(
          <div className='flex items-center gap-2 justify-end'>
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
        )}
      >
        {rows.map((r) => (
          <tr key={r._id} className='hover:bg-slate-50/60 dark:hover:bg-slate-700/40'>
            <td className='px-3 py-2'>{formatDateTime(r.createdAt)}</td>
            <td className='px-3 py-2'>{r._id.slice(-6)}</td>
            <td className='px-3 py-2'>{r.email || '-'}</td>
            <td className='px-3 py-2'>{(r.paymentMethod || '-').toUpperCase()}</td>
            <td className='px-3 py-2'>{r.status || '-'}</td>
            <td className='px-3 py-2'>{r.transactionId || '-'}</td>
            <td className='px-3 py-2'>${Number(r.orderSummary?.total || 0).toFixed(2)}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
};

export default AdminTransactionsPage;
