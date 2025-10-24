"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PaymentCancelPage = () => {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center max-w-md mx-4">
        <div className="mb-6">
          {/* Cancel Icon */}
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">
            Payment Cancelled
          </h1>
        </div>

        {transactionId && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Transaction ID:
            </p>
            <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 break-all">
              {transactionId}
            </p>
          </div>
        )}

        <p className="text-gray-700 dark:text-gray-300 mb-6">
Your payment has been cancelled. Don&apos;t worry, no charges were made to
          your account.
        </p>

        <div className="space-y-3">
          <Link
            className="w-full inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            href="/order-details"
          >
            Try Payment Again
          </Link>

          <Link
            className="w-full inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            href="/"
          >
            Go to Home
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
