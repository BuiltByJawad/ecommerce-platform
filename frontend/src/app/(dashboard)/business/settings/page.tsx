'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppSelector, useAppDispatch } from '../../../redux';
import useAxios from '@/context/axiosContext';
import { setCurrentUser } from '../../../state';
import { toast } from 'react-toastify';

const BusinessSettingsPage = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.global.currentUser as any);
  const { put, loading } = useAxios();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: user?.company_name || '',
    business_type: user?.business_type || '',
    tax_id: user?.tax_id || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const body: any = {
        f_name: user.f_name,
        l_name: user.l_name,
        email: user.email,
        company_name: form.company_name,
        business_type: form.business_type,
        tax_id: form.tax_id,
        phone: form.phone,
        address: form.address,
      };

      const response = await put(`/users/user/${user.id}`, body);
      if (response?.status === 200) {
        const newData = response?.data?.data?.user || {};
        dispatch(
          setCurrentUser({
            ...user,
            f_name: newData.f_name ?? user.f_name,
            l_name: newData.l_name ?? user.l_name,
            email: newData.email ?? user.email,
            company_name: newData.company_name ?? form.company_name,
            business_type: newData.business_type ?? form.business_type,
            tax_id: newData.tax_id ?? form.tax_id,
            phone: newData.phone ?? form.phone,
            address: newData.address ?? form.address,
          })
        );
        toast.success('Business profile updated successfully');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update business profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'company') {
    return (
      <div className={`${theme} max-w-3xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-200'>
          This page is only available for business accounts.
        </div>
      </div>
    );
  }

  const businessTypes = [
    { value: '', label: 'Select business type' },
    { value: 'retail', label: 'Retail' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'service_provider', label: 'Service provider' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className={`${theme} max-w-3xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen`}>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Business Settings</h1>

      <form
        onSubmit={handleSubmit}
        className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-4 text-sm text-gray-800 dark:text-gray-100'
      >
        <div>
          <label htmlFor='company_name' className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>
            Company name
          </label>
          <input
            id='company_name'
            name='company_name'
            type='text'
            value={form.company_name}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
            placeholder='Enter your company name'
          />
        </div>

        <div>
          <label htmlFor='business_type' className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>
            Business type
          </label>
          <select
            id='business_type'
            name='business_type'
            value={form.business_type}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
          >
            {businessTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='tax_id' className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>
            Tax ID
          </label>
          <input
            id='tax_id'
            name='tax_id'
            type='text'
            value={form.tax_id}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
            placeholder='Enter your tax ID'
          />
        </div>

        <div>
          <label htmlFor='phone' className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>
            Phone
          </label>
          <input
            id='phone'
            name='phone'
            type='text'
            value={form.phone}
            onChange={handleChange}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
            placeholder='Enter a contact phone number'
          />
        </div>

        <div>
          <label htmlFor='address' className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>
            Address
          </label>
          <textarea
            id='address'
            name='address'
            value={form.address}
            onChange={handleChange}
            rows={3}
            className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500'
            placeholder='Enter your business address'
          />
        </div>

        <div className='flex justify-end pt-2'>
          <button
            type='submit'
            disabled={saving || loading}
            className='inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-500 disabled:opacity-60'
          >
            {saving || loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessSettingsPage;
