'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import useAxios from '@/context/axiosContext';

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
  discount?: number;
  total: number;
}

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  orderNotes?: string;
  orderItems: OrderItem[];
  orderSummary: OrderSummary;
  paymentMethod: string;
  status: string;
  couponCode?: string;
  createdAt: string;
}

const OrderDetailPage: React.FC = () => {
  const { theme } = useTheme();
  const { get } = useAxios();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = params?.id as string;
        if (!id) return;
        const res = await get(`/order-details/${id}`, {});
        const data = res?.data?.data?.order as Order;
        setOrder(data || null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [get, params?.id]);

  if (loading) {
    return <div className={`${theme} p-4`}>Loading...</div>;
  }

  if (!order) {
    return (
      <div className={`${theme} p-4`}>
        <p>Order not found.</p>
        <button className='mt-2 text-blue-600' onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className={`${theme} bg-white dark:bg-gray-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8`}>
      <div className='bg-white dark:bg-gray-800 max-w-3xl mx-auto rounded-lg shadow-md p-6 text-sm text-gray-800 dark:text-gray-100'>
        <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4'>
          <h1 className='text-lg font-semibold'>Order #{order._id.slice(-6)}</h1>
          <div className='text-right'>
            <div className='text-xs uppercase tracking-wide'>Status</div>
            <div className='font-semibold'>{order.status}</div>
          </div>
        </div>

        <div className='mb-4'>
          <div className='font-medium'>Placed on</div>
          <div className='text-xs text-gray-600 dark:text-gray-300'>{new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <div className='font-medium mb-1'>Shipping Address</div>
            <div>{order.firstName} {order.lastName}</div>
            <div>{order.address}</div>
            <div>{order.city}, {order.country}</div>
            <div>{order.phone}</div>
          </div>
          <div>
            <div className='font-medium mb-1'>Payment</div>
            <div>Method: {order.paymentMethod?.toUpperCase()}</div>
            {order.couponCode && <div>Coupon: {order.couponCode}</div>}
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <div className='font-medium mb-2'>Items</div>
          <div className='space-y-2'>
            {order.orderItems.map((it) => (
              <div key={`${it.productId}-${it.name}`} className='flex justify-between'>
                <span>{it.name} × {it.quantity}</span>
                <span>${it.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className='mt-4 space-y-1'>
            <div className='flex justify-between'><span>Subtotal</span><span>${order.orderSummary.itemsSubtotal.toFixed(2)}</span></div>
            <div className='flex justify-between'><span>Shipping</span><span>${order.orderSummary.shipping.toFixed(2)}</span></div>
            <div className='flex justify-between'><span>Discount</span><span>${Number(order.orderSummary.discount || 0).toFixed(2)}</span></div>
            <div className='flex justify-between font-semibold'><span>Total</span><span>${order.orderSummary.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
