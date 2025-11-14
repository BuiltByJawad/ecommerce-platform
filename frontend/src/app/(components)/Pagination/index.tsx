'use client';

import React, { useMemo } from 'react';

export interface PaginationProps {
  page: number; // 1-based index
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  maxButtons?: number; // max numeric buttons to show (default 10)
  pageSizeOptions?: number[]; // default [10,20,50,100]
  showRowsPerPage?: boolean; // default true
  className?: string;
  ariaLabel?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  maxButtons = 10,
  pageSizeOptions = [10, 20, 50, 100],
  showRowsPerPage = true,
  className = '',
  ariaLabel = 'Pagination',
}) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / Math.max(1, pageSize)));
  const currentPage = clamp(page || 1, 1, totalPages);

  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined), []);

  const pages = useMemo(() => {
    const count = Math.min(maxButtons, totalPages);
    const range: (number | 'ellipsis')[] = [];
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
      return range;
    }
    const siblingCount = Math.max(1, Math.floor((maxButtons - 5) / 2));
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    range.push(1);
    if (showLeftEllipsis) range.push('ellipsis');

    for (let i = leftSibling; i <= rightSibling; i++) range.push(i);

    if (showRightEllipsis) range.push('ellipsis');
    range.push(totalPages);

    // Ensure we don't exceed maxButtons by trimming from middle
    if (range.filter((x) => x !== 'ellipsis').length > count) {
      // Fallback: generate a centered window without ellipsis
      const half = Math.floor(count / 2);
      const start = clamp(currentPage - half, 1, Math.max(1, totalPages - count + 1));
      const end = Math.min(totalPages, start + count - 1);
      const compact: number[] = [];
      for (let i = start; i <= end; i++) compact.push(i);
      return compact;
    }
    return range;
  }, [currentPage, totalPages, maxButtons]);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const handleChangePage = (p: number) => {
    if (p === currentPage) return;
    onPageChange(clamp(p, 1, totalPages));
  };

  const handlePageSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value);
    onPageSizeChange?.(size);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {showRowsPerPage && onPageSizeChange && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 text-sm' aria-live='polite'>
          <div className='flex items-center gap-2'>
            <label
              htmlFor='rows-per-page'
              className='text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap'
            >
              Rows per page:
            </label>
            <select
              id='rows-per-page'
              className='border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[70px]'
              value={pageSize}
              onChange={handlePageSize}
              aria-label='Rows per page'
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <span className='text-gray-600 dark:text-gray-400 whitespace-nowrap'>
            {numberFormatter.format(Math.min((currentPage - 1) * pageSize + 1, totalItems))}
            {' - '}
            {numberFormatter.format(Math.min(currentPage * pageSize, totalItems))}
            {' of '}
            {numberFormatter.format(totalItems)}
          </span>
        </div>
      )}

      <nav
        className='flex items-center justify-center sm:justify-end'
        aria-label={ariaLabel}
        role='navigation'
      >
        <ul className='inline-flex items-center gap-1.5' role='list'>
          <li>
            <button
              type='button'
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={!canPrev}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] ${
                canPrev
                  ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              }`}
              aria-label='Previous page'
            >
              Prev
            </button>
          </li>

          {pages.map((p, idx) => (
            <li key={`${p}-${idx}`} className='hidden sm:list-item'>
              {p === 'ellipsis' ? (
                <span
                  className='px-2 text-gray-500 dark:text-gray-400 select-none text-lg'
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <button
                  type='button'
                  onClick={() => handleChangePage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  className={`min-w-[40px] h-[40px] px-3 py-2 rounded-md border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                    p === currentPage
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {p}
                </button>
              )}
            </li>
          ))}

          {/* Mobile page indicator */}
          <li className='sm:hidden px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium'>
            Page {currentPage} of {totalPages}
          </li>

          <li>
            <button
              type='button'
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={!canNext}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] ${
                canNext
                  ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              }`}
              aria-label='Next page'
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
