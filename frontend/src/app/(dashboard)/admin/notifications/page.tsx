'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { useRouter } from 'next/navigation';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type?: string;
  metadata?: any;
  read?: boolean;
  createdAt?: string;
};

const AdminNotificationsPage: React.FC = () => {
  const { get, patch } = useAxios();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'order' | 'return' | 'general'>('all');

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

  const filtered = useMemo(() => {
    if (filterType === 'all') return items;
    return items.filter((n) => (n.type || 'general') === filterType);
  }, [items, filterType]);

  const handleRowClick = async (n: NotificationItem) => {
    await markOne(n._id);
    const t = (n.type || 'general') as string;
    if (t === 'return') router.push('/admin/returns');
    // no deep link for admin orders at the moment
  };

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={markAllRead} className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black">Mark all read</button>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800">
          <option value="all">All</option>
          <option value="order">Orders</option>
          <option value="return">Returns</option>
          <option value="general">General</option>
        </select>
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
          filtered.map((n) => (
            <button key={n._id} onClick={() => handleRowClick(n)} className={`w-full text-left p-3 ${n.read ? '' : 'bg-yellow-50 dark:bg-yellow-900/20'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">{n.message}</div>
                  <div className="mt-1 text-[10px] text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                </div>
                {!n.read && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-200 dark:bg-yellow-700">New</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
