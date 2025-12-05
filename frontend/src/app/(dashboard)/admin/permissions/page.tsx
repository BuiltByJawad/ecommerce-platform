'use client';

import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import useAxios from '@/context/axiosContext';

interface VendorRow {
  _id: string;
  company_name?: string;
  email: string;
  vendorStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  permissions?: string[];
}

const PERMISSION_OPTIONS = [
  { key: 'MANAGE_PRODUCTS', label: 'Manage Products' },
  { key: 'VIEW_VENDOR_ORDERS', label: 'View Vendor Orders' },
  { key: 'MANAGE_COUPONS', label: 'Manage Coupons' },
];

const AdminVendorPermissionsPage: React.FC = () => {
  const { theme } = useTheme();
  const { get, put } = useAxios();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingVendorId, setSavingVendorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await get('/users/admin/vendors?page=1&pageSize=50', {});
        const data = res?.data?.data?.data || [];
        setVendors(data);
      } catch (e) {
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [get]);

  const togglePermission = async (vendorId: string, permKey: string) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    if (!vendor) return;
    const current = Array.isArray(vendor.permissions) ? vendor.permissions : [];
    const has = current.includes(permKey);
    const nextPermissions = has ? current.filter((p) => p !== permKey) : [...current, permKey];

    setVendors((prev) =>
      prev.map((v) => (v._id === vendorId ? { ...v, permissions: nextPermissions } : v))
    );

    try {
      setSavingVendorId(vendorId);
      await put(`/users/admin/vendors/${vendorId}/permissions`, { permissions: nextPermissions }, {});
    } finally {
      setSavingVendorId(null);
    }
  };

  return (
    <div
      className={`${theme} dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-2 font-sans text-slate-900 dark:text-slate-200`}
    >
      <div className='container mx-auto w-full'>
        <header className='mb-4 text-start'>
          <h1 className='text-lg sm:text-xl font-bold tracking-tight'>Vendor Permissions</h1>
          <p className='text-xs text-slate-600 dark:text-slate-400 mt-1'>
            Control which approved companies can manage products and see their orders.
          </p>
        </header>

        <div className='bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700'>
          {loading ? (
            <div className='p-6 text-center text-slate-500 dark:text-slate-400 text-sm'>
              Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className='p-6 text-center text-slate-500 dark:text-slate-400 text-sm'>
              No vendors found.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700'>
                <thead className='bg-slate-50 dark:bg-slate-700/50'>
                  <tr>
                    <th className='py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 sm:pl-6'>
                      Company
                    </th>
                    <th className='px-3 py-3.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-100'>
                      Email
                    </th>
                    <th className='px-3 py-3.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-100'>
                      Status
                    </th>
                    {PERMISSION_OPTIONS.map((p) => (
                      <th
                        key={p.key}
                        className='px-3 py-3.5 text-center text-xs font-semibold text-slate-800 dark:text-slate-100'
                      >
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800'>
                  {vendors.map((vendor) => {
                    const perms = Array.isArray(vendor.permissions) ? vendor.permissions : [];
                    const disabled = vendor.vendorStatus !== 'approved';
                    return (
                      <tr key={vendor._id} className='hover:bg-slate-50/60 dark:hover:bg-slate-700/40'>
                        <td className='whitespace-nowrap py-3 pl-4 pr-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 sm:pl-6'>
                          {vendor.company_name || '(No name)'}
                        </td>
                        <td className='whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200'>
                          {vendor.email}
                        </td>
                        <td className='whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200'>
                          {vendor.vendorStatus}
                        </td>
                        {PERMISSION_OPTIONS.map((p) => (
                          <td key={p.key} className='whitespace-nowrap px-3 py-3 text-center text-xs'>
                            <input
                              type='checkbox'
                              disabled={disabled}
                              className='h-4 w-4 rounded border-slate-400 dark:border-slate-500 text-sky-600 dark:text-sky-500 focus:ring-sky-500'
                              checked={perms.includes(p.key)}
                              onChange={() => togglePermission(vendor._id, p.key)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {savingVendorId && (
          <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>
            Saving permissions for vendor {savingVendorId}...
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminVendorPermissionsPage;
