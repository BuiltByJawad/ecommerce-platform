"use client";

import React from "react";
import Navbar from "../../(components)/Navbar";
import Sidebar from "../../(components)/Sidebar";
import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";
import { useAppSelector } from "../../redux";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  return (
    <div className="flex bg-gray-50 text-gray-900 w-full min-h-screen min-w-[1200px]">
      {/* Sidebar with width when collapsed and not collapsed */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-[210px]"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content taking remaining width */}
      <main className={`${theme} flex-1 flex flex-col h-screen`}>
        <div className="w-full">
          <Navbar />
        </div>
        <ToastContainer />
        <div className="p-2">{children}</div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-gray-50 text-gray-900 w-full min-h-screen">
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
};

export default DashboardWrapper;
