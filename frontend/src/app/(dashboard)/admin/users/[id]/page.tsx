'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import useAxios from '@/context/axiosContext';
import { formatDateTime } from '@/utils/date';

interface UserDoc {
  _id: string;
  email?: string;
  role?: 'customer' | 'company' | 'admin' | string;
  f_name?: string;
  l_name?: string;
  company_name?: string;
  tax_id?: string;
  phone?: string;
  address?: string;
  business_type?: string;
  vendorStatus?: string;
  isVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminUserDetailPage: React.FC = () => {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const { get, put } = useAxios();
  const id = (params?.id as string) || '';

  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await get(`/users/user/${id}`);
      const payload = res?.data?.data || {};
      setUser(payload.user || null);
    } finally {
      setLoading(false);
    }
  }, [get, id]);

  const handleRoleChange = useCallback(
    async (newRole: string) => {
      try {
        await put(`/users/admin/users/${id}/role`, { role: newRole });
        setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
        showToast('Role updated', 'success');
      } catch (_e) {
        showToast('Failed to update role', 'error');
      }
    },
    [put, id]
  );

  const handleActiveToggle = useCallback(
    async (nextActive: boolean) => {
      try {
        await put(`/users/admin/users/${id}/active`, { active: nextActive });
        setUser((prev) => (prev ? { ...prev, active: nextActive } : prev));
        showToast(nextActive ? 'User enabled' : 'User disabled', 'success');
      } catch (_e) {
        showToast('Failed to update active status', 'error');
      }
    },
    [put, id]
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fullName = useMemo(() => {
    if (!user) return '';
    return [user.f_name, user.l_name].filter(Boolean).join(' ');
  }, [user]);

  return (
    <div className={`${theme} w-full max-w-full p-4`}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded shadow text-sm ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>User Details</h1>
        <button
          onClick={() => router.push('/admin/users')}
          className='px-2 py-1 border rounded dark:border-gray-700'
        >
          Back to Users
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : !user ? (
        <div>No user found.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='rounded border p-4 dark:border-gray-700'>
            <h2 className='font-semibold mb-2'>Basic</h2>
            <div className='text-sm space-y-1'>
              <div><span className='text-gray-600'>ID:</span> {user._id}</div>
              <div><span className='text-gray-600'>Email:</span> {user.email || '-'}</div>
              <div><span className='text-gray-600'>Name:</span> {fullName || '-'}</div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600'>Role:</span>
                <select
                  value={user.role || ''}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800 capitalize'
                >
                  <option value='customer'>Customer</option>
                  <option value='company'>Vendor</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-gray-600'>Active:</span>
                <input
                  type='checkbox'
                  checked={!!user.active}
                  onChange={(e) => handleActiveToggle(e.target.checked)}
                />
              </div>
              <div><span className='text-gray-600'>Created:</span> {formatDateTime(user.createdAt, '-')}</div>
              <div><span className='text-gray-600'>Updated:</span> {formatDateTime(user.updatedAt, '-')}</div>
            </div>
          </div>

          <div className='rounded border p-4 dark:border-gray-700'>
            <h2 className='font-semibold mb-2'>Vendor</h2>
            <div className='text-sm space-y-1'>
              <div><span className='text-gray-600'>Company:</span> {user.company_name || '-'}</div>
              <div><span className='text-gray-600'>Tax ID:</span> {user.tax_id || '-'}</div>
              <div><span className='text-gray-600'>Business Type:</span> {user.business_type || '-'}</div>
              <div><span className='text-gray-600'>Vendor Status:</span> {user.vendorStatus || '-'}</div>
              <div><span className='text-gray-600'>Verified:</span> {user.isVerified ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className='rounded border p-4 dark:border-gray-700 md:col-span-2'>
            <h2 className='font-semibold mb-2'>Contact</h2>
            <div className='text-sm space-y-1'>
              <div><span className='text-gray-600'>Phone:</span> {user.phone || '-'}</div>
              <div><span className='text-gray-600'>Address:</span> {user.address || '-'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
