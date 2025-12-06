'use client';

import React, { useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type?: string;
  metadata?: any;
  read?: boolean;
  createdAt?: string;
};

const VendorNotificationsPage: React.FC = () => {
  const { get, patch } = useAxios();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await get('/notifications/my', { params: { page, limit } });
      const data = (res?.data?.data?.data as NotificationItem[]) || [];
      const totalCount = res?.data?.data?.pagination?.total || 0;
      setItems(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const markAllRead = async () => {
    await patch('/notifications/read-all', {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id: string) => {
    await patch(`/notifications/${id}/read`, {});
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={markAllRead} className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black">Mark all read</button>
        <div className="ml-auto flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700">Prev</button>
          <div className="text-sm">Page {page}</div>
          <button disabled={items.length < limit} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700">Next</button>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="ml-2 px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="border rounded dark:border-gray-700 divide-y dark:divide-gray-700">
        {loading ? (
          <div className="p-4 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm">No notifications</div>
        ) : (
          items.map((n) => (
            <div key={n._id} className={`p-3 ${n.read ? '' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">{n.message}</div>
                  <div className="mt-1 text-[10px] text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                </div>
                {!n.read && (
                  <button onClick={() => markOne(n._id)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">Mark read</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorNotificationsPage;
