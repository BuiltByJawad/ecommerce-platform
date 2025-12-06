'use client';

import React from 'react';
import Navbar from '../../(components)/Navbar';
import Sidebar from '../../(components)/Sidebar';
import { ToastContainer } from 'react-toastify';
import { useTheme } from 'next-themes';
import { useAppSelector } from '../../redux';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  return (
    <div className='flex bg-gray-50 text-gray-900 w-full min-h-screen'>
      {/* Sidebar spacer matching fixed sidebar width */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-[220px]'}`}>
        <Sidebar />
      </div>

      {/* Main content takes remaining space */}
      <main className={`${theme} flex-1 flex flex-col min-h-screen min-w-0`}> 
        <div className='w-full'>
          <Navbar />
        </div>
        <ToastContainer />
        <div className='p-3 flex-1 min-h-0'>{children}</div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex bg-gray-50 text-gray-900 w-full min-h-screen'>
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
};

export default DashboardWrapper;
