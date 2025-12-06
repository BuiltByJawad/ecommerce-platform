"use client"
import React, { Component, ReactNode } from 'react';
import { logClientError } from '@/utils/errorLogger';

/**
 * Error Boundary component for catching JavaScript errors anywhere in the component tree
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 * @param {Function} props.onError - Optional callback when error occurs
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component for ISO 25010 reliability standards
 * Catches JavaScript errors and displays fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state when error occurs
   * @param {Error} error - The error that was thrown
   * @returns {ErrorBoundaryState} Updated state
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging and monitoring
   * @param {Error} error - The error that was thrown
   * @param {React.ErrorInfo} errorInfo - Error information from React
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call optional error callback for external error tracking
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to error tracking service (Sentry, etc.)
    logClientError(error, errorInfo);
  }

  /**
   * Render error UI or children
   * @returns {ReactNode} Error UI or child components
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center'>
            <div className='mb-4'>
              <svg
                className='mx-auto h-12 w-12 text-red-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h1 className='text-xl font-semibold text-gray-900 mb-2'>Something went wrong</h1>
            <p className='text-gray-600 mb-4'>
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200'
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-4 text-left'>
                <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                  Error Details (Development Only)
                </summary>
                <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
