'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import { formatDateTime } from '@/utils/date';

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type OrderSummary = {
  itemsSubtotal: number;
  shipping: number;
  discount?: number;
  tax?: number;
  total: number;
};

type Order = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  orderItems: OrderItem[];
  orderSummary: OrderSummary;
  paymentMethod: string;
  status: 'Pending' | 'Complete' | 'Shipped' | 'Delivered' | 'Cancelled';
  transactionId?: string;
  createdAt?: string;
};

const AdminOrderDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { get, post } = useAxios();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await get(`/order-details/${id}`);
      if (res?.status === 200) {
        setOrder(res?.data?.data?.order || null);
      } else {
        toast.error('Failed to load order');
      }
    } catch (_e) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (newStatus: Order['status']) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await post(`/order-details/update-status/${order._id}`, { status: newStatus });
      if (res?.status === 200) {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
        toast.success('Order status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (_e) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currency = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
      : '-';

  const statusOptions: Order['status'][] = ['Pending', 'Complete', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.push('/admin/orders')} className="px-2 py-1 border rounded dark:border-gray-700">Back</button>
        <div className="text-lg font-semibold">Order Details</div>
      </div>

      {loading ? (
        <div className="text-sm">Loading...</div>
      ) : !order ? (
        <div className="text-sm">Order not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded p-3 dark:border-gray-700">
              <div className="font-semibold mb-2">Customer</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{order.firstName} {order.lastName}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{order.email}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{order.phone}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{order.address}, {order.city}, {order.country}</div>
              {order.createdAt && (
                <div className="text-xs text-gray-500 mt-2">Placed: {formatDateTime(order.createdAt)}</div>
              )}
            </div>

            <div className="border rounded p-3 dark:border-gray-700">
              <div className="font-semibold mb-2">Items</div>
              <div className="divide-y dark:divide-gray-700">
                {order.orderItems?.map((it) => (
                  <div key={it.productId + it.name} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="text-sm text-gray-700">{currency(it.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded p-3 dark:border-gray-700">
              <div className="font-semibold mb-2">Summary</div>
              <div className="text-sm flex items-center justify-between"><span>Items</span><span>{currency(order.orderSummary?.itemsSubtotal)}</span></div>
              <div className="text-sm flex items-center justify-between"><span>Shipping</span><span>{currency(order.orderSummary?.shipping)}</span></div>
              {!!order.orderSummary?.discount && <div className="text-sm flex items-center justify-between"><span>Discount</span><span>-{currency(order.orderSummary.discount)}</span></div>}
              {!!order.orderSummary?.tax && <div className="text-sm flex items-center justify-between"><span>Tax</span><span>{currency(order.orderSummary.tax)}</span></div>}
              <div className="text-sm flex items-center justify-between font-semibold border-t mt-2 pt-2"><span>Total</span><span>{currency(order.orderSummary?.total)}</span></div>
            </div>

            <div className="border rounded p-3 dark:border-gray-700 space-y-2">
              <div className="font-semibold">Status</div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value as Order['status'])}
                disabled={updating}
                className="w-full px-2 py-1 border rounded dark:border-gray-700 dark:bg-gray-800"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {order.transactionId && (
                <div className="text-xs text-gray-500">Transaction: {order.transactionId}</div>
              )}
              <div className="text-xs text-gray-500">Payment: {order.paymentMethod}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailsPage;
