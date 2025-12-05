'use client';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useState, useCallback, useRef } from 'react';

const useAxios = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  if (!baseURL) {
    console.error('BASE URL is not defined. Please check your host.');
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a single Axios instance per hook lifecycle to prevent re-registering interceptors
  const axiosInstanceRef = useRef(null as any);
  if (!axiosInstanceRef.current) {
    const instance = axios.create({
      baseURL,
      withCredentials: true, // Ensures cookies are sent with requests
      headers: { 'Content-Type': 'application/json' },
    });

    // Interceptor to handle 401 errors and refresh token (register once)
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};
        const message = error.response?.data?.message;

        // Never attempt refresh for the refresh endpoint itself
        if (originalRequest?.url?.includes('/refresh-token')) {
          return Promise.reject(error);
        }

        // Check if the error is a 401 and the request hasn't been retried yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          message !== 'No refresh token provided'
        ) {
          originalRequest._retry = true; // Mark the request as retried
          try {
            // Call the refresh-token endpoint using a plain axios call to avoid interceptor recursion
            await axios.post(`${baseURL}/refresh-token`, null, {
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' },
            });
            // Retry the original request with the new access token
            return instance(originalRequest);
          } catch (refreshError) {
            setError('Failed to refresh token. Please log in again.');
            return Promise.reject(refreshError);
          }
        }
        // If the error is not a 401 or refresh failed, reject the error
        return Promise.reject(error);
      }
    );

    axiosInstanceRef.current = instance;
  }

  // Generic fetch function (stable; uses ref)
  const fetchData = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      url: string,
      data: any = null,
      config: AxiosRequestConfig = {}
    ): Promise<AxiosResponse<any>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstanceRef.current({
          method,
          url,
          data,
          ...config,
        });
        return response;
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'An unknown error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // HTTP methods (stable because fetchData is stable)
  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) => fetchData('GET', url, null, config),
    [fetchData]
  );
  const post = useCallback(
    (url: string, data?: any, config?: AxiosRequestConfig) => fetchData('POST', url, data, config),
    [fetchData]
  );
  const put = useCallback(
    (url: string, data?: any, config?: AxiosRequestConfig) => fetchData('PUT', url, data, config),
    [fetchData]
  );
  const patch = useCallback(
    (url: string, data?: any, config?: AxiosRequestConfig) => fetchData('PATCH', url, data, config),
    [fetchData]
  );
  const del = useCallback(
    (url: string, config?: AxiosRequestConfig) => fetchData('DELETE', url, null, config),
    [fetchData]
  );

  return { get, post, put, patch, del, loading, error };
};

export default useAxios;
