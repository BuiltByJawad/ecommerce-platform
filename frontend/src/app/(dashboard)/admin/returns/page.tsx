'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

interface ReturnItem { productId: string; name: string; quantity: number }
interface ReturnRow {
  _id: string;
  orderId: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  items: ReturnItem[];
}

const AdminReturnsPage: React.FC = () => {
  const { theme } = useTheme();
  const { get, patch } = useAxios();
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [q, setQ] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (q) params.set('q', q);
      const res = await get(`/returns/admin?${params.toString()}`, {});
      setRows(res?.data?.data?.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveStatus = async (id: string, status: string) => {
    try {
      await patch(`/returns/admin/${id}`, { status }, {});
      setRows((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Update failed');
    }
  };

  return (
    <div className={`${theme} p-3`}>
      <h1 className='text-lg font-bold mb-3'>Returns</h1>

      <div className='bg-white dark:bg-gray-800 rounded border p-3 mb-3 flex gap-3 items-end'>
        <div>
          <label className='block text-xs mb-1'>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='border rounded px-2 py-1 text-sm dark:bg-gray-700'>
            <option value=''>Any</option>
            <option value='Requested'>Requested</option>
            <option value='Approved'>Approved</option>
            <option value='Rejected'>Rejected</option>
            <option value='Received'>Received</option>
            <option value='Refunded'>Refunded</option>
          </select>
        </div>
        <div className='flex-1'>
          <label className='block text-xs mb-1'>Search email</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700' />
        </div>
        <button onClick={fetchData} className='px-3 py-2 text-sm border rounded'>Apply</button>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded border'>
        {loading ? (
          <div className='p-3 text-sm'>Loading...</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-3 py-2 text-left'>Order</th>
                  <th className='px-3 py-2 text-left'>Email</th>
                  <th className='px-3 py-2 text-left'>Items</th>
                  <th className='px-3 py-2 text-left'>Status</th>
                  <th className='px-3 py-2 text-right'>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className='border-t border-gray-200 dark:border-gray-700'>
                    <td className='px-3 py-2'>{r.orderId?.toString?.() || r.orderId}</td>
                    <td className='px-3 py-2'>{r.customerEmail}</td>
                    <td className='px-3 py-2'>
                      {r.items.map((it) => (
                        <div key={`${r._id}-${it.productId}`}>{it.name} × {it.quantity}</div>
                      ))}
                    </td>
                    <td className='px-3 py-2'>
                      <select value={r.status} onChange={(e) => saveStatus(r._id, e.target.value)} className='border rounded px-2 py-1 text-xs dark:bg-gray-700'>
                        <option value='Requested'>Requested</option>
                        <option value='Approved'>Approved</option>
                        <option value='Rejected'>Rejected</option>
                        <option value='Received'>Received</option>
                        <option value='Refunded'>Refunded</option>
                      </select>
                    </td>
                    <td className='px-3 py-2 text-right'>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturnsPage;
