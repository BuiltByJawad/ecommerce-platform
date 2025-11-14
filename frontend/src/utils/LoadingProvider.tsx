'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../app/redux';
import { setLoading } from '../app/state';
import Loading from '@/app/loading';

const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.global.loading);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      dispatch(setLoading(true));
    };

    const handleRouteChangeComplete = () => {
      dispatch(setLoading(false));
    };

    const handleRouteChangeError = () => {
      dispatch(setLoading(false));
    };

    // Subscribe to router events
    router.events?.on('routeChangeStart', handleRouteChangeStart);
    router.events?.on('routeChangeComplete', handleRouteChangeComplete);
    router.events?.on('routeChangeError', handleRouteChangeError);

    // Cleanup on unmount
    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart);
      router.events?.off('routeChangeComplete', handleRouteChangeComplete);
      router.events?.off('routeChangeError', handleRouteChangeError);
    };
  }, [router, dispatch]);

  return (
    <>
      {loading && <Loading />}
      {children}
    </>
  );
};

export default LoadingProvider;
