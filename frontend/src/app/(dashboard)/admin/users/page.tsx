'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';

interface UserDoc {
  _id: string;
  email?: string;
  role?: 'customer' | 'company' | 'admin' | string;
  f_name?: string;
  l_name?: string;
  company_name?: string;
  createdAt?: string;
}

const AdminUsersPage: React.FC = () => {
  const { theme } = useTheme();
  const { get, put } = useAxios();
  const handleRoleChange = useCallback(
    async (id: string, newRole: string) => {
      try {
        await put(`/users/admin/users/${id}/role`, { role: newRole });
        setRows((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      } catch (_e) {
        // no-op; backend may reject (e.g., self-demotion). You can add toast here if desired.
      }
    },
    [put]
  );

  const [rows, setRows] = useState<UserDoc[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [q, setQ] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, pageSize };
      if (q.trim()) params.q = q.trim();
      if (role) params.role = role;
      const res = await get('/users/all-users', { params });
      const payload = res?.data?.data || {};
      setRows(Array.isArray(payload.data) ? payload.data : []);
      setTotal(Number(payload.totalRows || 0));
    } finally {
      setLoading(false);
    }
  }, [get, page, pageSize, q, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const pageInfo = useMemo(() => {
    if (!total) return 'No results';
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `Showing ${start}-${end} of ${total}`;
  }, [page, pageSize, total]);

  return (
    <div className={`${theme} w-full max-w-full p-4`}>
      <h1 className='text-xl font-semibold mb-4'>Users</h1>

      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search (email, name, company)'
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        >
          <option value=''>All roles</option>
          <option value='customer'>Customer</option>
          <option value='company'>Vendor</option>
          <option value='admin'>Admin</option>
        </select>
        <button
          onClick={() => { setPage(1); fetchUsers(); }}
          className='px-2 py-1 border rounded dark:border-gray-700'
        >
          Apply
        </button>
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
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
            className='px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700'
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }}
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
              <th className='px-3 py-2 text-left font-semibold'>Email</th>
              <th className='px-3 py-2 text-left font-semibold'>Role</th>
              <th className='px-3 py-2 text-left font-semibold'>Name</th>
              <th className='px-3 py-2 text-left font-semibold'>Company</th>
              <th className='px-3 py-2 text-left font-semibold'>Created</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              <tr>
                <td className='px-3 py-3' colSpan={5}>Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className='px-3 py-3' colSpan={5}>No users found</td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u._id} className='hover:bg-gray-50'>
                  <td className='px-3 py-2'>{u.email}</td>
                  <td className='px-3 py-2'>
                    <select
                      value={u.role || ''}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800 capitalize'
                    >
                      <option value='customer'>Customer</option>
                      <option value='company'>Vendor</option>
                      <option value='admin'>Admin</option>
                    </select>
                  </td>
                  <td className='px-3 py-2'>{[u.f_name, u.l_name].filter(Boolean).join(' ') || '-'}</td>
                  <td className='px-3 py-2'>{u.company_name || '-'}</td>
                  <td className='px-3 py-2'>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
