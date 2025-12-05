'use client';

import { useAppDispatch, useAppSelector } from '../../redux';
import { setIsSidebarCollapsed } from '../../state';
import {
  Users,
  CircleDollarSign,
  Layout,
  CreditCard,
  SlidersHorizontal,
  ChevronsRight,
  ChevronsLeft,
  Package,
  Building,
  UserCog,
  Grid3X3,
  ShoppingCart,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { SidebarLink } from './SidebarLink';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const user = useAppSelector((state) => state.global.currentUser as any);
  const { theme } = useTheme();
  const [showLogo, setShowLogo] = useState(!isSidebarCollapsed);

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
    border-gray-300 bg-gray-100 text-black dark:border-gray-100 dark:bg-gray-900 dark:text-white fixed transition-all 
    duration-300 ease-in-out overflow-hidden h-full shadow-md z-40 
    ${isSidebarCollapsed ? 'w-16' : 'w-[210px]'}`;

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
        className={`h-16 flex items-center border-b border-b-gray-300 py-3 relative ${
          isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-1'
        }`}
      >
        {/* Logo Container with fixed height */}
        <div className='relative w-full flex items-center'>
          <h1 className={`font-extrabold text-lg ps-6 break-all ${showLogo ? 'block' : 'hidden'}`}>
            Ecommerce
          </h1>
        </div>

        <button
          className={`px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors duration-200 border border-gray-300 ${
            isSidebarCollapsed ? 'absolute top-1/2 -translate-y-1/2' : 'me-1'
          }`}
          onClick={toggleSidebar}
        >
          <div className='relative w-4 h-4'>
            <ChevronsRight
              className={`w-4 h-4 text-gray-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
              }`}
            />
            <ChevronsLeft
              className={`w-4 h-4 text-gray-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* LINKS */}
      <div className='flex-grow'>
        <SidebarLink
          href={dashboardHref}
          icon={Layout}
          label='Dashboard'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/admin/products/categories'
          icon={Grid3X3}
          label='Categories'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/admin/products/moderation'
          icon={Package}
          label='Moderation'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/business/products'
          icon={Package}
          label='Products'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/business/orders'
          icon={ShoppingCart}
          label='Orders'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink href='/users' icon={Users} label='Users' isCollapsed={isSidebarCollapsed} />
        <SidebarLink
          href='/admin/companies'
          icon={Building}
          label='Companies'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/payments'
          icon={CircleDollarSign}
          label='Payments'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/transactions'
          icon={CreditCard}
          label='Transactions'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/admin/permissions'
          icon={UserCog}
          label='Role Permissions'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href='/admin/settings'
          icon={SlidersHorizontal}
          label='Settings'
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div
        className={`mb-10 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <p className={`text-center text-xs ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          © 2024 Ecommerce
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
