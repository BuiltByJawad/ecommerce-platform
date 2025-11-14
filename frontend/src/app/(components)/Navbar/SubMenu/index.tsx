import Link from 'next/link';
import React from 'react';

const SubMenu = () => {
  return (
    <div className='flex items-center flex-shrink-0'>
      <div className='flex w-auto order-1'>
        <ul className='flex flex-row items-center space-x-4 font-bold'>
          <li>
            <Link
              href='/about'
              className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:border-b-2 hover:border-gray-800 dark:hover:border-gray-300'
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href='/services'
              className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:border-b-2 hover:border-gray-800 dark:hover:border-gray-300'
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href='/contact'
              className='block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:border-b-2 hover:border-gray-800 dark:hover:border-gray-300'
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SubMenu;
