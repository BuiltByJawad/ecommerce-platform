'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import useAxios from '@/context/axiosContext';
import { getSocket } from './socketClient';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../redux';
import { setNotificationsMuted } from '../../state';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type?: string;
  metadata?: any;
  read?: boolean;
  createdAt?: string;
};

const Notifications: React.FC = () => {
  const { get, patch } = useAxios();
  const dispatch = useAppDispatch();
  const muted = useAppSelector((s: any) => s.global.notificationsMuted as boolean);
  const user = useAppSelector((s: any) => s.global.currentUser as any);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<boolean>(false);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const badgeTimerRef = useRef<any>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const unreadList = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const badge = open ? unreadList : badgeCount;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await get('/notifications/my', { params: { page: 1, limit: 10 } });
      const data = (res?.data?.data?.data as NotificationItem[]) || [];
      setItems(Array.isArray(data) ? data : []);
      // sync badge with unread when panel is open
      const unread = Array.isArray(data) ? data.filter((n) => !n.read).length : 0;
      setBadgeCount(unread);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  const getItemLink = (n: NotificationItem): string | null => {
    const role = user?.role;
    const orderId = (n as any)?.metadata?.orderId as string | undefined;
    const returnId = (n as any)?.metadata?.returnId as string | undefined;
    const type = n?.type;
    if (type === 'order' || orderId) {
      if (role === 'customer' && orderId) return `/customer/orders/${orderId}`;
      if (role === 'company') return `/business/orders`;
      if (role === 'admin') return orderId ? `/admin/orders/${orderId}` : '/admin/orders';
    }
    if (type === 'return' || returnId) {
      if (role === 'company') return `/business/returns`;
      if (role === 'admin') return `/admin/returns`;
      if (role === 'customer' && orderId) return `/customer/orders/${orderId}`;
    }
    return null;
  };

  const handleRowClick = async (n: NotificationItem) => {
    await markOne(n._id);
    const link = getItemLink(n);
    if (link) {
      setOpen(false);
      router.push(link);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await get('/notifications/unread-count');
      const cnt = Number(res?.data?.data?.count) || 0;
      setBadgeCount(cnt);
    } catch (_e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll unread count (lightweight) only when dropdown is closed
  useEffect(() => {
    if (!open) {
      fetchUnreadCount();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      const id = setInterval(() => {
        fetchUnreadCount();
      }, 60000);
      return () => clearInterval(id);
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    const onNew = (payload: any) => {
      const n = payload?.notification as NotificationItem | undefined;
      if (!n?._id) return;
      if (!openRef.current && !muted) {
        const title = n.title || 'New notification';
        const msg = n.message ? `: ${n.message}` : '';
        toast.info(`${title}${msg}` as string, {
          position: 'top-right',
          autoClose: 2500,
          closeOnClick: true,
          onClick: () => {
            setOpen(true);
            // mark as read on click of toast
            // reuse existing API flow
            (async () => {
              try {
                await patch(`/notifications/${n._id}/read`, {});
                setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
                setBadgeCount((prev) => Math.max(0, prev - 1));
              } catch (_) {}
            })();
          },
        });
      }
      // debounce badge increments when closed to reduce flicker
      if (!openRef.current) {
        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => {
          setBadgeCount((prev) => prev + 1);
        }, 150);
      }
      setItems((prev) => {
        const exist = prev.find((x) => x._id === n._id);
        if (exist) return prev;
        return [n, ...prev].slice(0, 10);
      });
    };
    const onUpdated = (payload: any) => {
      if (payload?.type === 'all') {
        setItems((prev) => prev.map((x) => ({ ...x, read: true })));
        setBadgeCount(0);
      } else if (payload?.type === 'single' && payload?.id) {
        setItems((prev) => prev.map((x) => (x._id === payload.id ? { ...x, read: true } : x)));
        if (!openRef.current) {
          if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
          badgeTimerRef.current = setTimeout(() => {
            setBadgeCount((prev) => Math.max(0, prev - 1));
          }, 150);
        }
      }
    };
    socket.on('notifications:new', onNew);
    socket.on('notifications:updated', onUpdated);
    return () => {
      socket.off('notifications:new', onNew);
      socket.off('notifications:updated', onUpdated);
    };
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await patch('/notifications/read-all', {});
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_e) {}
  };

  const markOne = async (id: string) => {
    try {
      await patch(`/notifications/${id}/read`, {});
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (_e) {}
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-label="Notifications"
        onClick={toggleOpen}
        className="relative p-0 border-none bg-transparent outline-none"
      >
        <Bell className="cursor-pointer w-6 h-6" />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[1.1rem] h-4 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full flex items-center justify-center leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-md shadow-lg border bg-white dark:bg-gray-800 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              <label className="text-xs inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!muted}
                  onChange={(e) => dispatch(setNotificationsMuted(e.target.checked))}
                  className="accent-yellow-400"
                />
                Mute
              </label>
              <button
                onClick={markAllRead}
                className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
              {user?.role === 'company' ? (
                <Link href='/business/notifications' className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">View all</Link>
              ) : user?.role === 'admin' ? (
                <Link href='/admin/notifications' className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">View all</Link>
              ) : null}
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {loading ? (
              <div className="p-3 text-sm">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-3 text-sm">No notifications</div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleRowClick(n)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    n.read ? 'opacity-80' : 'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.message}</div>
                  <div className="mt-1 text-[10px] text-gray-500">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
