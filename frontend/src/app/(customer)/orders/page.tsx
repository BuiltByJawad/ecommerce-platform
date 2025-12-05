'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import useAxios from '@/context/axiosContext';
import { useAppSelector } from '@/app/redux';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderSummary {
  itemsSubtotal: number;
  shipping: number;
  total: number;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  orderSummary: OrderSummary;
}

const OrdersPage = () => {
  const { theme } = useTheme();
  const { get } = useAxios();
  const user = useAppSelector((state) => state.global.currentUser as any);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await get('/order-details/my', {});
        const data = res?.data?.data;
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      } catch (e) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [get]);

  return (
    <div className={`${theme} bg-white min-h-screen py-8 px-4 sm:px-6 lg:px-8`}>
      <div className='bg-white dark:bg-gray-800 max-w-4xl mx-auto rounded-lg shadow-md p-6'>
        <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6'>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>My Orders</h1>
          <Link
            href='/customer/user/profile'
            className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
          >
            Back to Account
          </Link>
        </div>

        {isLoading ? (
          <p className='text-sm text-gray-600 dark:text-gray-300'>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className='text-sm text-gray-600 dark:text-gray-300'>
            <p>You have no orders yet.</p>
            <Link
              href='/home'
              className='mt-3 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <div
                key={order._id}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-200'
              >
                <div className='flex justify-between items-center mb-2'>
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-gray-100'>
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs uppercase tracking-wide'>Status</p>
                    <p className='text-sm font-semibold'>{order.status}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      Payment: {order.paymentMethod?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className='mt-3 border-t border-gray-200 dark:border-gray-700 pt-3'>
                  {order.orderItems.slice(0, 3).map((item) => (
                    <div key={item.productId} className='flex justify-between mb-1'>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      + {order.orderItems.length - 3} more item(s)
                    </p>
                  )}
                </div>
                <div className='mt-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3'>
                  <p className='text-sm font-semibold'>Total: ${order.orderSummary.total.toFixed(2)}</p>
                  <Link href={`/customer/orders/${order._id}`} className='text-xs text-blue-600 hover:underline'>
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
