'use client';

import React from 'react';
import StoreProvider from './redux';

const ReduxLayout = ({ children }: { children: React.ReactNode }) => {
  return <StoreProvider>{children}</StoreProvider>;
};

const ReduxWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ReduxLayout>{children}</ReduxLayout>;
};

export default ReduxWrapper;
