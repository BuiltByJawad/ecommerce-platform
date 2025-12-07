"use client";

import React from "react";

interface AdminTableProps {
  columns: Array<React.ReactNode>;
  columnAlign?: Array<"left" | "center" | "right">;
  loading?: boolean;
  dataLength: number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  stickyMaxHeight?: string; // e.g. '70vh'
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  columnAlign = [],
  loading = false,
  dataLength,
  emptyMessage = "No records found",
  stickyHeader = false,
  stickyMaxHeight = "70vh",
  footer,
  children,
}) => {
  const colSpan = columns.length || 1;
  const alignClass = (a?: "left" | "center" | "right") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
  return (
    <div className='bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700'>
      <div className={stickyHeader ? `max-h-[${stickyMaxHeight}] overflow-auto` : undefined}>
        <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm'>
          <thead className={`bg-slate-50 dark:bg-slate-700/50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={`px-3 py-2 font-semibold ${alignClass(columnAlign[i])}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800'>
            {loading ? (
              <tr>
                <td className='px-3 py-3' colSpan={colSpan}>Loading...</td>
              </tr>
            ) : dataLength === 0 ? (
              <tr>
                <td className='px-3 py-3' colSpan={colSpan}>{emptyMessage}</td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className='border-t border-slate-200 dark:border-slate-700 px-3 py-2 bg-white/70 dark:bg-slate-800/70'>
          {footer}
        </div>
      )}
    </div>
  );
};

export default AdminTable;
