"use client";

import React, { useEffect } from "react";
import Navbar from "../(components)/Navbar";
import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";
import { initFlowbite } from "flowbite";
import Footer from "@/app/(components)/Footer";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  useEffect((): (() => void) => {
    initFlowbite();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 text-gray-900">
      <main
        className={`${theme} flex flex-col h-full w-full bg-gray-50`}
      >
        <Navbar />
        <ToastContainer />
        <div className="w-full px-6">{children}</div>
        <Footer />
      </main>
    </div>
  );
};

const CustomerWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full bg-gray-50 text-gray-900">
      <CustomerLayout>{children}</CustomerLayout>
    </div>
  );
};

export default CustomerWrapper;
