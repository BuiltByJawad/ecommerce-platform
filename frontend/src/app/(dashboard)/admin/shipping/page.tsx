'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

interface Country { _id?: string; country_name: string }
interface RateRow { country: string; rate: number }

const AdminShippingPage: React.FC = () => {
  const { theme } = useTheme();
  const { get, put } = useAxios();
  const [countries, setCountries] = useState<Country[]>([]);
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCountries = async () => {
    try {
      const res = await get('/countries', {});
      const list: Country[] = Array.isArray(res?.data?.data?.countries) ? res.data.data.countries : [];
      setCountries(list);
    } catch {
      setCountries([]);
    }
  };

  const fetchAdminRates = async () => {
    try {
      setLoading(true);
      const res = await get('/shipping/admin', {});
      const arr: RateRow[] = res?.data?.data?.settings?.rates || [];
      setRates(arr);
    } catch (e: any) {
      console.error(e);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchAdminRates();
  }, []);

  const addRow = () => setRates((prev) => [...prev, { country: '', rate: 0 }]);
  const removeRow = (idx: number) => setRates((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    try {
      setSaving(true);
      const cleaned = rates.filter((r) => r.country && r.rate >= 0);
      await put('/shipping/admin', { rates: cleaned }, {});
      toast.success('Shipping rates saved');
      fetchAdminRates();
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${theme} p-3`}>
      <h1 className='text-lg font-bold mb-3'>Platform Shipping Rates</h1>

      <div className='bg-white dark:bg-gray-800 rounded border p-3'>
        <div className='flex justify-between items-center mb-3'>
          <button onClick={addRow} className='px-3 py-2 text-sm border rounded'>Add Rate</button>
          <button onClick={save} disabled={saving} className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded disabled:opacity-60'>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {loading ? (
          <div className='p-2 text-sm'>Loading...</div>
        ) : (
          <div className='space-y-2'>
            {rates.map((r, idx) => (
              <div key={idx} className='grid grid-cols-1 md:grid-cols-3 gap-2 items-center'>
                <select
                  value={r.country}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRates((prev) => prev.map((row, i) => (i === idx ? { ...row, country: v } : row)));
                  }}
                  className='border rounded px-2 py-1 text-sm dark:bg-gray-700'
                >
                  <option value=''>Select country</option>
                  {countries.map((c) => (
                    <option key={c._id || c.country_name} value={c.country_name}>
                      {c.country_name}
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  min={0}
                  value={r.rate}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRates((prev) => prev.map((row, i) => (i === idx ? { ...row, rate: v } : row)));
                  }}
                  placeholder='Shipping rate amount'
                  className='border rounded px-2 py-1 text-sm dark:bg-gray-700'
                />
                <div>
                  <button onClick={() => removeRow(idx)} className='px-2 py-1 border rounded text-sm'>Remove</button>
                </div>
              </div>
            ))}
            {rates.length === 0 && (
              <div className='text-sm text-gray-500'>No rates configured. Click Add Rate to start.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShippingPage;
