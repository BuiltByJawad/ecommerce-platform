'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

interface Coupon {
  _id: string;
  code: string;
  ownerType: 'admin' | 'vendor' | 'system';
  seller?: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  validFrom?: string;
  validTo?: string;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageLimitTotal?: number;
  usageLimitPerUser?: number;
  usedCount?: number;
  stackable?: boolean;
  isActive: boolean;
  createdAt?: string;
}

interface VendorRow {
  _id: string;
  company_name?: string;
}

const AdminCouponsPage: React.FC = () => {
  const { theme } = useTheme();
  const { get, post, patch } = useAxios();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [searchCode, setSearchCode] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ discount_type?: 'percent' | 'fixed'; value?: number }>({});

  const [form, setForm] = useState({
    code: '',
    ownerType: 'admin' as 'admin' | 'vendor' | 'system',
    seller: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    value: 10,
    validFrom: '',
    validTo: '',
    minOrderValue: 0,
    maxDiscountValue: 0,
    usageLimitTotal: 0,
    usageLimitPerUser: 0,
    stackable: false,
    scope: 'global',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '100');
      if (ownerTypeFilter) params.set('ownerType', ownerTypeFilter);
      if (activeFilter) params.set('isActive', activeFilter);
      if (searchCode) params.set('q', searchCode);
      const res = await get(`/coupons/admin/list?${params.toString()}`, {});
      setCoupons(res?.data?.data?.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await get('/users/admin/vendors?page=1&pageSize=100', {});
      setVendors(res?.data?.data?.data || []);
    } catch {
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerTypeFilter, activeFilter]);

  const toggleActive = async (id: string) => {
    try {
      await patch(`/coupons/admin/${id}/toggle`, {}, {});
      setCoupons((prev) => prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c)));
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Toggle failed');
    }
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c._id);
    setEditForm({ discount_type: c.discount_type, value: c.value });
  };

  const saveEdit = async (id: string) => {
    try {
      const body: any = { ...editForm };
      const res = await patch(`/coupons/admin/${id}`, body, {});
      const updated = res?.data?.data?.coupon as Coupon;
      if (updated) {
        setCoupons((prev) => prev.map((x) => (x._id === id ? updated : x)));
        setEditingId(null);
        toast.success('Coupon updated');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Update failed');
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await patch(`/coupons/admin/${id}`, { isActive: false }, {});
      // Prefer soft-disable; for hard delete, call DELETE
      // await del(`/coupons/admin/${id}`, {});
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon removed');
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Delete failed');
    }
  };

  const onCreate = async () => {
    if (!form.code || !form.value) {
      toast.error('Code and value are required');
      return;
    }
    if (form.ownerType === 'vendor' && !form.seller) {
      toast.error('Select a vendor for vendor coupons');
      return;
    }
    try {
      setCreating(true);
      const body: any = { ...form };
      if (!body.validFrom) delete body.validFrom;
      if (!body.validTo) delete body.validTo;
      const res = await post('/coupons/admin', body, {});
      const created = res?.data?.data?.coupon as Coupon;
      if (created) {
        setCoupons((prev) => [created, ...prev]);
        toast.success('Coupon created');
        setForm({
          code: '',
          ownerType: 'admin',
          seller: '',
          discount_type: 'percent',
          value: 10,
          validFrom: '',
          validTo: '',
          minOrderValue: 0,
          maxDiscountValue: 0,
          usageLimitTotal: 0,
          usageLimitPerUser: 0,
          stackable: false,
          scope: 'global',
          isActive: true,
        });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`${theme} p-3`}>
      <h1 className='text-lg font-bold mb-3'>Admin Coupons</h1>

      {/* Create form */}
      <div className='bg-white dark:bg-gray-800 rounded border p-3 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div>
            <label className='text-xs block mb-1'>Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              placeholder='e.g. SAVE10'
            />
          </div>
          <div>
            <label className='text-xs block mb-1'>Owner</label>
            <select
              value={form.ownerType}
              onChange={(e) => setForm({ ...form, ownerType: e.target.value as any })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
            >
              <option value='admin'>Admin</option>
              <option value='vendor'>Vendor</option>
              <option value='system'>System</option>
            </select>
          </div>
          {form.ownerType === 'vendor' && (
            <div>
              <label className='text-xs block mb-1'>Vendor</label>
              <select
                value={form.seller}
                onChange={(e) => setForm({ ...form, seller: e.target.value })}
                className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              >
                <option value=''>Select vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.company_name || v._id}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className='text-xs block mb-1'>Type</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
            >
              <option value='percent'>Percent %</option>
              <option value='fixed'>Fixed amount</option>
            </select>
          </div>
          <div>
            <label className='text-xs block mb-1'>Value</label>
            <input
              type='number'
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              min={0}
            />
          </div>
          <div>
            <label className='text-xs block mb-1'>Min Order</label>
            <input
              type='number'
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              min={0}
            />
          </div>
          <div>
            <label className='text-xs block mb-1'>Max Discount</label>
            <input
              type='number'
              value={form.maxDiscountValue}
              onChange={(e) => setForm({ ...form, maxDiscountValue: Number(e.target.value) })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              min={0}
            />
          </div>
          <div>
            <label className='text-xs block mb-1'>Usage Limit (Total)</label>
            <input
              type='number'
              value={form.usageLimitTotal}
              onChange={(e) => setForm({ ...form, usageLimitTotal: Number(e.target.value) })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              min={0}
            />
          </div>
          <div>
            <label className='text-xs block mb-1'>Usage/User</label>
            <input
              type='number'
              value={form.usageLimitPerUser}
              onChange={(e) => setForm({ ...form, usageLimitPerUser: Number(e.target.value) })}
              className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
              min={0}
            />
          </div>
          <div className='flex items-center gap-2 mt-5'>
            <input
              id='stackable'
              type='checkbox'
              checked={form.stackable}
              onChange={(e) => setForm({ ...form, stackable: e.target.checked })}
            />
            <label htmlFor='stackable' className='text-xs'>Stackable</label>
          </div>
        </div>
        <div className='mt-3'>
          <button
            onClick={onCreate}
            disabled={creating}
            className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded disabled:opacity-60'
          >
            {creating ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white dark:bg-gray-800 rounded border p-3 mb-3 flex flex-wrap gap-3 items-end'>
        <div>
          <label className='block text-xs mb-1'>Owner</label>
          <select
            value={ownerTypeFilter}
            onChange={(e) => setOwnerTypeFilter(e.target.value)}
            className='border rounded px-2 py-1 text-sm dark:bg-gray-700'
          >
            <option value=''>All</option>
            <option value='admin'>Admin</option>
            <option value='vendor'>Vendor</option>
            <option value='system'>System</option>
          </select>
        </div>
        <div>
          <label className='block text-xs mb-1'>Active</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className='border rounded px-2 py-1 text-sm dark:bg-gray-700'
          >
            <option value=''>Any</option>
            <option value='true'>Active</option>
            <option value='false'>Inactive</option>
          </select>
        </div>
        <div className='flex-1 min-w-[200px]'>
          <label className='block text-xs mb-1'>Search code</label>
          <input
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder='e.g. SAVE'
            className='w-full border rounded px-2 py-1 text-sm dark:bg-gray-700'
          />
        </div>
        <button onClick={fetchCoupons} className='px-3 py-2 text-sm border rounded'>Apply</button>
      </div>

      {/* List */}
      <div className='bg-white dark:bg-gray-800 rounded border'>
        {loading ? (
          <div className='p-4 text-sm'>Loading...</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-3 py-2 text-left'>Code</th>
                  <th className='px-3 py-2 text-left'>Owner</th>
                  <th className='px-3 py-2 text-left'>Seller</th>
                  <th className='px-3 py-2 text-left'>Type</th>
                  <th className='px-3 py-2 text-right'>Value</th>
                  <th className='px-3 py-2 text-right'>Used</th>
                  <th className='px-3 py-2 text-center'>Active</th>
                  <th className='px-3 py-2 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className='border-t border-gray-200 dark:border-gray-700'>
                    <td className='px-3 py-2'>{c.code}</td>
                    <td className='px-3 py-2'>{c.ownerType}</td>
                    <td className='px-3 py-2'>{c.seller || '-'}</td>
                    <td className='px-3 py-2'>
                      {editingId === c._id ? (
                        <select
                          value={editForm.discount_type as any}
                          onChange={(e) => setEditForm({ ...editForm, discount_type: e.target.value as any })}
                          className='border rounded px-2 py-1 text-xs'
                        >
                          <option value='percent'>percent</option>
                          <option value='fixed'>fixed</option>
                        </select>
                      ) : (
                        c.discount_type
                      )}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      {editingId === c._id ? (
                        <input
                          type='number'
                          value={Number(editForm.value ?? c.value)}
                          onChange={(e) => setEditForm({ ...editForm, value: Number(e.target.value) })}
                          className='border rounded px-2 py-1 text-xs w-20 text-right'
                        />
                      ) : (
                        c.value
                      )}
                    </td>
                    <td className='px-3 py-2 text-right'>{c.usedCount ?? 0}</td>
                    <td className='px-3 py-2 text-center'>
                      <span className={`px-2 py-0.5 rounded text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      {editingId === c._id ? (
                        <div className='flex gap-2 justify-center'>
                          <button onClick={() => saveEdit(c._id)} className='px-3 py-1 border rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700'>Save</button>
                          <button onClick={() => setEditingId(null)} className='px-3 py-1 border rounded text-xs'>Cancel</button>
                        </div>
                      ) : (
                        <div className='flex gap-2 justify-center'>
                          <button onClick={() => startEdit(c)} className='px-3 py-1 border rounded text-xs'>Edit</button>
                          <button
                            onClick={() => toggleActive(c._id)}
                            className='px-3 py-1 border rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700'
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => deleteCoupon(c._id)}
                            className='px-3 py-1 border rounded text-xs text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
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

export default AdminCouponsPage;
