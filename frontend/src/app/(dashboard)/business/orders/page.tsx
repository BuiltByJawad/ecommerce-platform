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

interface Order {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  address: {
    country: string;
    city: string;
    address: string;
  };
  orderSummary: {
    total: number;
  };
  status: 'Pending' | 'Complete' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

const columnHelper = createColumnHelper<Order>();

const Orders: React.FC = () => {
  const { theme } = useTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { get, post, loading } = useAxios();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await get('/order-details/findall');
        if (response?.status === 201) {
          setOrders(response?.data?.data?.orderDetails || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    };
    fetchOrders();
  }, []);

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
        (row) => {
          return `${row?.firstName} ${row?.lastName}`;
        },
        {
          id: 'userName',
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
          country: row?.country,
          city: row?.city,
          address: row?.address,
        }),
        {
          id: 'address',
          header: 'Address',
          cell: (info) => {
            const addressData = info.getValue();
            return (
              <div className='text-xs sm:text-sm text-gray-600 leading-relaxed max-w-full'>
                <div className='font-medium break-words overflow-hidden'>
                  {addressData?.address}
                </div>
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
          <div className='flex justify-start'>
            {row?.original?.status === 'Pending' && (
              <button
                onClick={() => updateOrderStatus(row?.original?._id, 'Complete')}
                className='px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors'
              >
                Mark as Paid
              </button>
            )}
          </div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      }),
    ];
  }, [formatDate, formatPrice, getStatusColor, updateOrderStatus]);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: { minSize: 40, size: 100, maxSize: 400 },
  });

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
