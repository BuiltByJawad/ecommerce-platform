'use client';
import { useTheme } from 'next-themes';
import React from 'react';

const Dashboard = () => {
  const { theme } = useTheme();

  return <div className={`${theme}`}>Dashboard</div>;
};

export default Dashboard;
