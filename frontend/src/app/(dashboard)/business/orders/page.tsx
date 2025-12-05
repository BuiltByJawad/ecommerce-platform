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
import { useAppSelector } from '../../../redux';

interface VendorOrderItem {
  productId: string;
  name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  customerEmail: string;
  items: VendorOrderItem[];
  totalForVendor: number;
  status: 'Pending' | 'Complete' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  createdAt: string;
}

const columnHelper = createColumnHelper<Order>();

const Orders: React.FC = () => {
  const { theme } = useTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { get, loading } = useAxios();
  const user = useAppSelector((state) => state.global.currentUser as any);
  const isVendor = user?.role === 'company';
  const vendorStatus = user?.vendorStatus as 'pending' | 'approved' | 'rejected' | 'suspended' | undefined;
  const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
  const hasOrderPermission = permissions.length === 0 || permissions.includes('VIEW_VENDOR_ORDERS');

  useEffect(() => {
    const fetchOrders = async () => {
      if (isVendor && (!hasOrderPermission || vendorStatus !== 'approved')) {
        setOrders([]);
        return;
      }
      try {
        const response = await get('/order-details/vendor/my', {});
        if (response?.status === 200) {
          setOrders(response?.data?.data?.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    };
    fetchOrders();
  }, [get, isVendor, hasOrderPermission, vendorStatus]);

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

  const formatDate = useCallback(
    (dateString: string) =>
      dateString
        ? new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A',
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

  const columns = useMemo((): ColumnDef<Order, any>[] => {
    return [
      columnHelper.accessor(
        (row) => row.customerEmail,
        {
          id: 'customerEmail',
          header: 'Customer Email',
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
        (row) => row.items,
        {
          id: 'items',
          header: 'Items',
          cell: (info) => {
            const items = info.getValue() as VendorOrderItem[];
            return (
              <div className='text-xs sm:text-sm text-gray-600 leading-relaxed max-w-full'>
                {items?.slice(0, 3).map((item) => (
                  <div key={item.productId} className='flex justify-between'>
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                {items && items.length > 3 && (
                  <div className='text-gray-500 mt-1 break-words overflow-hidden'>
                    + {items.length - 3} more item(s)
                  </div>
                )}
              </div>
            );
          },
          size: 200,
          minSize: 160,
          maxSize: 250,
        }
      ),
      columnHelper.accessor('totalForVendor', {
        header: 'Total (for you)',
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
      // Vendors do not change global order status; no actions column
    ];
  }, [formatDate, formatPrice, getStatusColor]);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: { minSize: 40, size: 100, maxSize: 400 },
  });

  if (isVendor && (!hasOrderPermission || vendorStatus !== 'approved')) {
    return (
      <div className={`${theme} max-w-3xl mx-auto p-4 bg-yellow-50 dark:bg-gray-900 min-h-screen flex items-center`}>
        <div className='w-full rounded-lg border border-yellow-200 dark:border-yellow-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-800 dark:text-gray-100'>
          <h2 className='text-base font-semibold mb-2'>Access to Orders is restricted</h2>
          {vendorStatus !== 'approved' ? (
            <p className='mb-1'>
              Your vendor account status is <span className='font-semibold'>{vendorStatus || 'pending'}</span>. You cannot view orders until your account is approved by an administrator.
            </p>
          ) : (
            <p className='mb-1'>
              Your account is approved but does not currently have permission to view orders. Please contact the administrator to enable <span className='font-semibold'>VIEW_VENDOR_ORDERS</span>.
            </p>
          )}
          <p className='text-xs text-gray-600 dark:text-gray-300'>If this is unexpected, contact support or your account representative.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme} overflow-x-auto shadow-lg rounded-lg border border-gray-200 w-full min-w-[320px] max-w-full`}
    >
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
                  } ${h.id === 'createdAt' ? 'hidden sm:table-cell' : ''}`}
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
                  className={`px-2 sm:px-3 py-3 text-xs sm:text-sm align-top ${
                    cell.column.id === 'createdAt' ? 'hidden sm:table-cell' : ''
                  } ${cell.column.id === 'address' ? 'break-words' : 'whitespace-nowrap'}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
