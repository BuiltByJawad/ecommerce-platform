'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

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
  tax?: number;
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
  const { get, post } = useAxios();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const id = params?.id as string;
        if (!id) return;
        const res = await get(`/order-details/${id}`, {});
        const data = res?.data?.data?.order as Order;
        setOrder(data || null);
        if (data?.orderItems) {
          const init: Record<string, number> = {};
          for (const it of data.orderItems) init[it.productId] = 0;
          setReturnQuantities(init);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [get, params?.id]);

  const handleCreateReturn = async () => {
    if (!order) return;
    const items = (order.orderItems || [])
      .filter((it) => Number(returnQuantities[it.productId] || 0) > 0)
      .map((it) => ({ productId: it.productId, quantity: Number(returnQuantities[it.productId] || 0), reason: returnNotes }));
    if (items.length === 0) {
      toast.error('Select at least one item to return');
      return;
    }
    try {
      await post('/returns/customer', { orderId: order._id, items, notes: returnNotes }, {});
      toast.success('Return request submitted');
      setReturnNotes('');
      setReturnQuantities((prev) => {
        const reset: Record<string, number> = {};
        for (const k of Object.keys(prev)) reset[k] = 0;
        return reset;
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.data?.error || 'Failed to submit return');
    }
  };

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
            <div className='flex justify-between'><span>Tax</span><span>${Number(order.orderSummary.tax || 0).toFixed(2)}</span></div>
            <div className='flex justify-between font-semibold'><span>Total</span><span>${order.orderSummary.total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Return request UI */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-6 mt-6'>
          <div className='font-medium mb-2'>Request a return</div>
          <div className='space-y-2 mb-3'>
            {(order.orderItems || []).map((it) => (
              <div key={`ret-${it.productId}`} className='flex items-center gap-3'>
                <div className='flex-1'>{it.name} (max {it.quantity})</div>
                <input
                  type='number'
                  min={0}
                  max={it.quantity}
                  value={Number(returnQuantities[it.productId] || 0)}
                  onChange={(e) => setReturnQuantities({ ...returnQuantities, [it.productId]: Math.max(0, Math.min(it.quantity, Number(e.target.value))) })}
                  className='w-24 border rounded px-2 py-1 text-sm dark:bg-gray-700'
                />
              </div>
            ))}
          </div>
          <div className='mb-3'>
            <label className='block text-xs mb-1'>Reason / Notes</label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className='w-full border rounded px-2 py-2 text-sm dark:bg-gray-700'
              rows={3}
              placeholder='Describe the issue...'
            />
          </div>
          <button onClick={handleCreateReturn} className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded'>Submit Return Request</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
