'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useAxios from '@/context/axiosContext';
import { useAppSelector } from '@/app/redux';
import { useRouter } from 'next/navigation';

type AuditLog = {
  _id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  actor?: string;
  actorRole?: string;
  createdAt?: string;
  metadata?: any;
};

const AuditsPage: React.FC = () => {
  const user = useAppSelector((s: any) => s.global.currentUser as any);
  const router = useRouter();
  const { get } = useAxios();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [actorRole, setActorRole] = useState('');
  const [actor, setActor] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  const canView = useMemo(() => user?.role === 'admin', [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await get('/audits/admin', {
        params: { page, limit, action: action || undefined, resourceType: resourceType || undefined, actorRole: actorRole || undefined, actor: actor || undefined, resourceId: resourceId || undefined, from: from || undefined, to: to || undefined },
      });
      const data = res?.data?.data?.data as AuditLog[];
      const totalCount = res?.data?.data?.pagination?.total || 0;
      setRows(Array.isArray(data) ? data : []);
      setTotal(totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  if (!canView) {
    return (
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">Access denied. Admins only.</div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-3 grid grid-cols-1 md:grid-cols-8 gap-2">
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="action" className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input value={resourceType} onChange={(e) => setResourceType(e.target.value)} placeholder="resourceType" className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input value={actorRole} onChange={(e) => setActorRole(e.target.value)} placeholder="actorRole" className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="actor id" className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input value={resourceId} onChange={(e) => setResourceId(e.target.value)} placeholder="resource id" className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700" />
        <button onClick={() => { setPage(1); fetchData(); }} className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black">Filter</button>
      </div>

      <div className="mb-3">
        <a
          href={`${apiBase}/audits/admin/export?${new URLSearchParams({
            action: action || '',
            resourceType: resourceType || '',
            actorRole: actorRole || '',
            actor: actor || '',
            resourceId: resourceId || '',
            from: from || '',
            to: to || '',
          }).toString()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:border-gray-700"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-auto border rounded dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-2">When</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Resource</th>
              <th className="text-left p-2">Actor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={4}>Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-3" colSpan={4}>No results</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t dark:border-gray-700">
                  <td className="p-2 whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</td>
                  <td className="p-2">{r.action}</td>
                  <td className="p-2">{r.resourceType}{r.resourceId ? `:${r.resourceId}` : ''}</td>
                  <td className="p-2">{r.actorRole || ''}{r.actor ? `:${r.actor}` : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700">Prev</button>
        <div className="text-sm">Page {page}</div>
        <button disabled={rows.length < limit} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700">Next</button>
        <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="ml-2 px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default AuditsPage;
