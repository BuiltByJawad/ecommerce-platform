"use client";

import React from 'react';

interface AdminToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ left, right }) => {
  return (
    <div className='mb-3 flex flex-wrap items-center gap-2'>
      <div className='flex flex-wrap items-center gap-2'>
        {left}
      </div>
      {right ? (
        <div className='ml-auto flex items-center gap-2'>
          {right}
        </div>
      ) : null}
    </div>
  );
};

export default AdminToolbar;
