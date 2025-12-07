'use client';

import { useAppDispatch, useAppSelector } from '../../redux';
import { setIsSidebarCollapsed } from '../../state';
import {
  Users,
  Layout,
  CreditCard,
  ChevronsRight,
  ChevronsLeft,
  Package,
  Building,
  Grid3X3,
  ShoppingCart,
  Truck,
  Percent,
  Settings as SettingsIcon,
  TicketPercent,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  RotateCcw,
  History,
  Bell,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { SidebarLink } from './SidebarLink';
import { useSystemSettings } from '@/utils/SystemSettingsProvider';
import { currentYear as currentYearUtil } from '@/utils/date';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const user = useAppSelector((state) => state.global.currentUser as any);
  const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
  const { theme } = useTheme();
  const [showLogo, setShowLogo] = useState(!isSidebarCollapsed);
  const { settings } = useSystemSettings();
  const siteName = settings?.short_name || settings?.website_name || 'Ecommerce';
  const year = currentYearUtil();
  const copyrightText =
    settings?.copyright || `© ${year} ${siteName}`;

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  useEffect(() => {
    if (!isSidebarCollapsed) {
      // When opening, delay showing the logo until the sidebar is fully open
      const timer = setTimeout(() => {
        setShowLogo(true);
      }, 300); // Match the sidebar transition duration
      return () => clearTimeout(timer);
    } else {
      // When closing, hide the logo immediately
      setShowLogo(false);
    }
  }, [isSidebarCollapsed]);

  const sidebarClassNames = `flex flex-col border-r
    border-gray-300 dark:border-gray-800 bg-gradient-to-b from-gray-100 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-black text-black dark:text-white fixed transition-all 
    duration-300 ease-in-out overflow-hidden h-screen shadow-md z-40 
    ${isSidebarCollapsed ? 'w-16' : 'w-[220px]'}`;

  // Compute role-aware dashboard path
  const dashboardHref =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'company'
        ? '/business'
        : user?.role === 'customer'
          ? '/home'
          : '/';

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`h-16 flex items-center border-b border-b-gray-300 py-3 relative flex-shrink-0 ${
          isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-1'
        }`}
      >
        {/* Logo Container with fixed height */}
        <div className='relative w-full flex items-center'>
          <h1 className={`font-extrabold text-lg ps-6 break-all ${showLogo ? 'block' : 'hidden'}`}>
            {siteName}
          </h1>
        </div>

        <button
          className={`px-2.5 py-2.5 rounded-lg border transition-colors duration-200 shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
            theme === 'dark'
              ? 'bg-gray-800/70 hover:bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white/80 hover:bg-white border-gray-300 text-gray-700'
          } ${isSidebarCollapsed ? 'absolute top-1/2 -translate-y-1/2' : 'me-2'}`}
          onClick={toggleSidebar}
        >
          <div className='relative w-4 h-4'>
            <ChevronsRight
              className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
              }`}
            />
            <ChevronsLeft
              className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* LINKS */}
      <div className='flex-grow overflow-y-auto'>
        {!isSidebarCollapsed && (
          <div className='px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400'>
            General
          </div>
        )}
        <SidebarLink
          href={dashboardHref}
          icon={Layout}
          label='Dashboard'
          isCollapsed={isSidebarCollapsed}
        />

        {/* Admin-only links */}
        {user?.role === 'admin' && (
          <>
            {!isSidebarCollapsed && (
              <div className='px-4 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                Admin
              </div>
            )}
            <SidebarLink
              href='/admin/products/categories'
              icon={Grid3X3}
              label='Categories'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/products/moderation'
              icon={ShieldAlert}
              label='Moderation'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/users'
              icon={Users}
              label='Users'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/companies'
              icon={Building}
              label='Companies'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/orders'
              icon={ShoppingCart}
              label='Orders'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/payments'
              icon={CreditCard}
              label='Payments'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/transactions'
              icon={Receipt}
              label='Transactions'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/permissions'
              icon={ShieldCheck}
              label='Role Permissions'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/coupons'
              icon={TicketPercent}
              label='Coupons'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/shipping'
              icon={Truck}
              label='Shipping'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/taxes'
              icon={Percent}
              label='Taxes'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/returns'
              icon={RotateCcw}
              label='Returns'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/notifications'
              icon={Bell}
              label='Notifications'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/audits'
              icon={History}
              label='Audits'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/admin/settings'
              icon={SettingsIcon}
              label='Settings'
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}

        {/* Company (vendor) links, gated by vendorStatus and permissions */}
        {user?.role === 'company' && user?.vendorStatus === 'approved' && (
          <>
            {!isSidebarCollapsed && (
              <div className='px-4 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                Vendor
              </div>
            )}
            {(permissions.length === 0 || permissions.includes('MANAGE_PRODUCTS')) && (
              <SidebarLink
                href='/business/products'
                icon={Package}
                label='Products'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            {(permissions.length === 0 || permissions.includes('VIEW_VENDOR_ORDERS')) && (
              <SidebarLink
                href='/business/orders'
                icon={ShoppingCart}
                label='Orders'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            {(permissions.length === 0 || permissions.includes('MANAGE_COUPONS')) && (
              <SidebarLink
                href='/business/coupons'
                icon={TicketPercent}
                label='Coupons'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            {(permissions.length === 0 || permissions.includes('MANAGE_PRODUCTS')) && (
              <SidebarLink
                href='/business/shipping'
                icon={Truck}
                label='Shipping'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            {(permissions.length === 0 || permissions.includes('MANAGE_PRODUCTS')) && (
              <SidebarLink
                href='/business/taxes'
                icon={Percent}
                label='Taxes'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            {(permissions.length === 0 || permissions.includes('VIEW_VENDOR_ORDERS')) && (
              <SidebarLink
                href='/business/returns'
                icon={RotateCcw}
                label='Returns'
                isCollapsed={isSidebarCollapsed}
              />
            )}
            <SidebarLink
              href='/business/notifications'
              icon={Bell}
              label='Notifications'
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href='/business/settings'
              icon={SettingsIcon}
              label='Settings'
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}
      </div>

      {/* FOOTER */}
      <div
        className={`mb-3 transition-all duration-200 ease-in-out flex-shrink-0 ${
          isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <div className='w-full flex items-center justify-center px-2'>
          <p className={`text-[11px] ${theme === 'dark' ? 'text-white/80' : 'text-black/70'}`}>
            {copyrightText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
