'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAxios from '@/context/axiosContext';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { formatDate as formatDateUtil } from '@/utils/date';

interface OrderSummary {
  total: number;
}

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  email?: string;
  orderSummary: OrderSummary;
  status: 'Pending' | 'Complete' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

const columnHelper = createColumnHelper<Order>();

const AdminOrders: React.FC = () => {
  const { theme } = useTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { get, post, loading } = useAxios();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  

  const formatPrice = useCallback(
    (price: number) =>
      price != null
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price)
        : 'N/A',
    []
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const filteredOrders = useMemo(() => {
    // When using server-side filters, simply return current orders
    return orders;
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    try {
      const params: any = { page, limit };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (emailFilter) params.email = emailFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const response = await get('/order-details/findall', { params });
      if (response?.status === 200) {
        const payload = response?.data?.data || {};
        setOrders(Array.isArray(payload.data) ? payload.data : []);
        setTotal(Number(payload?.pagination?.total) || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  }, [get, page, limit, statusFilter, emailFilter, fromDate, toDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = useCallback(
    (dateString: string) => formatDateUtil(dateString, 'N/A'),
    []
  );

  const getStatusColor = useCallback((status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Complete':
        return 'bg-blue-100 text-blue-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: Order['status']) => {
      try {
        const response = await post(`/order-details/update-status/${orderId}`, {
          status: newStatus,
        });
        if (response?.status === 200) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, status: newStatus } : order
            )
          );
          toast.success('Order status updated successfully!');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
      }
    },
    [post]
  );

  const columns = useMemo((): ColumnDef<Order, any>[] => {
    return [
      columnHelper.accessor(
        (row) => `${row.firstName} ${row.lastName}`,
        {
          id: 'customer',
          header: 'Customer',
          cell: (info) => (
            <div className='font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate'>
              {info.getValue()}
            </div>
          ),
          size: 200,
          minSize: 120,
          maxSize: 300,
        }
      ),
      columnHelper.accessor(
        (row) => ({
          country: row.country,
          city: row.city,
          address: row.address,
        }),
        {
          id: 'address',
          header: 'Address',
          cell: (info) => {
            const addressData = info.getValue();
            return (
              <div className='text-xs sm:text-sm text-gray-600 leading-relaxed max-w-full'>
                <div className='font-medium break-words overflow-hidden'>{addressData?.address}</div>
                <div className='text-gray-500 mt-1 break-words overflow-hidden'>
                  {addressData?.city}, {addressData?.country}
                </div>
              </div>
            );
          },
          size: 200,
          minSize: 160,
          maxSize: 250,
        }
      ),
      columnHelper.accessor('orderSummary.total', {
        header: 'Total',
        cell: (info) => (
          <span className='text-xs sm:text-sm text-gray-600'>{formatPrice(info.getValue())}</span>
        ),
        size: 90,
        minSize: 80,
        maxSize: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as Order['status'];
          return (
            <div className='flex items-center space-x-2'>
              <span
                className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  status
                )}`}
              >
                {status || 'N/A'}
              </span>
            </div>
          );
        },
        size: 90,
        minSize: 70,
        maxSize: 120,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <span className='text-xs text-gray-500 hidden sm:table-cell'>
            {formatDate(info.getValue())}
          </span>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className='text-right pr-1 sm:pr-2'>Actions</div>,
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            <Link
              href={`/admin/orders/${row.original._id}`}
              className='px-2 py-1 text-xs rounded border bg-white text-gray-700 hover:bg-gray-100'
            >
              View
            </Link>
            {['Pending', 'Complete', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => updateOrderStatus(row.original._id, st as Order['status'])}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  row.original.status === st
                    ? 'bg-gray-300 text-gray-800'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        ),
        size: 200,
        minSize: 160,
        maxSize: 260,
      }),
    ];
  }, [formatDate, formatPrice, getStatusColor, updateOrderStatus]);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: { minSize: 40, size: 100, maxSize: 400 },
  });

  return (
  <div className={`${theme} w-full max-w-full` }>
    <div className='mb-3 flex items-center gap-2'>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as any)}
        className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
      >
        <option value='all'>All statuses</option>
        <option value='Pending'>Pending</option>
        <option value='Complete'>Complete</option>
        <option value='Shipped'>Shipped</option>
        <option value='Delivered'>Delivered</option>
        <option value='Cancelled'>Cancelled</option>
      </select>
      <input
        value={emailFilter}
        onChange={(e) => setEmailFilter(e.target.value)}
        placeholder='Filter by customer email'
        className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800 min-w-[220px]'
      />
      <input
        type='date'
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
      />
      <input
        type='date'
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
      />
      <button onClick={() => { setPage(1); fetchOrders(); }} className='px-2 py-1 border rounded dark:border-gray-700'>Apply</button>
      <a
        href={`${apiBase}/order-details/admin/export?${new URLSearchParams({
          status: statusFilter === 'all' ? '' : statusFilter,
          email: emailFilter || '',
          from: fromDate || '',
          to: toDate || '',
          limit: String(Math.max(limit, 1000)),
        }).toString()}`}
        target='_blank'
        rel='noopener noreferrer'
        className='px-2 py-1 border rounded dark:border-gray-700 bg-gray-50 hover:bg-gray-100'
      >
        Export CSV
      </a>
      <div className='ml-auto flex items-center gap-2'>
        <div className='text-xs text-gray-600'>
          {total > 0 ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}` : 'No results'}
        </div>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className='px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700'
        >
          Prev
        </button>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
          className='px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-700'
        >
          Next
        </button>
        <select
          value={limit}
          onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
          className='px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800'
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>

    <div className='overflow-x-auto shadow-lg rounded-lg border border-gray-200 w-full min-w-[320px]'>
    {loading && (
      <div className='flex justify-center py-4'>
        <svg
          className='animate-spin h-5 w-5 text-blue-500'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      </div>
    )}
    <table className='min-w-full divide-y divide-gray-200'>
      <thead className='bg-gray-50'>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th
                key={h.id}
                scope='col'
                style={{
                  width: h.getSize(),
                  minWidth: h.column.columnDef.minSize,
                  maxWidth: h.column.columnDef.maxSize,
                }}
                onClick={h.column.getToggleSortingHandler()}
                className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  h.column.getCanSort()
                    ? 'cursor-pointer select-none hover:bg-gray-100 transition-colors'
                    : ''
                }`}
              >
                <div className='flex items-center group'>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getCanSort() && (
                    <span className='ml-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      {h.column.getIsSorted() === 'asc' ? (
                        <FiChevronUp className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600' />
                      ) : h.column.getIsSorted() === 'desc' ? (
                        <FiChevronDown className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600' />
                      ) : (
                        <FiChevronDown className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300' />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className='hover:bg-gray-50/75 transition-colors duration-100'>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  width: cell.column.getSize(),
                  minWidth: cell.column.columnDef.minSize,
                  maxWidth: cell.column.columnDef.maxSize,
                }}
                className='px-2 sm:px-3 py-3 text-xs sm:text-sm align-top whitespace-normal'
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
  );
};

export default AdminOrders;
