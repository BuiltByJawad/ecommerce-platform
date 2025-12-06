'use client';

import type React from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function logClientError(error: Error, errorInfo: React.ErrorInfo) {
  try {
    if (typeof window === 'undefined') return;
    if (!API_BASE_URL) return;
    if (process.env.NODE_ENV === 'test') return;
    if (typeof fetch === 'undefined') return;

    const payload = {
      message: error.message,
      name: error.name,
      stack: error.stack ? String(error.stack).slice(0, 2000) : undefined,
      componentStack: errorInfo?.componentStack
        ? String(errorInfo.componentStack).slice(0, 1000)
        : undefined,
      url: window.location.href.slice(0, 1000),
      userAgent: navigator.userAgent.slice(0, 500),
    };

    await fetch(`${API_BASE_URL}/audits/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
  }
}
