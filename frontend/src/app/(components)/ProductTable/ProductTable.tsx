"use client";
import React, { useState, useMemo } from "react";
import { Product, ProductTableProps } from "../../../types/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { FiChevronUp, FiChevronDown, FiEdit, FiTrash2, FiImage } from "react-icons/fi";

const columnHelper = createColumnHelper<Product>();

const formatPrice = (price?: number) =>
  price != null
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)
    : "N/A";
const formatDate = (dateString?: string) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
const getStatusColor = (status?: Product["status"]) => {
  if (!status) return "bg-gray-100 text-gray-700";
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Draft":
      return "bg-yellow-100 text-yellow-700";
    case "Archived":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    (): ColumnDef<Product, any>[] => [
      columnHelper.accessor((row) => row.imageUrls?.[0], {
        id: "image",
        header: () => <span className="pl-1">Img</span>,
        cell: (info) => (
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-50 rounded-sm flex items-center justify-center">
            {info.getValue() ? (
              <img className="h-full w-full rounded-sm object-contain" src={info.getValue()} alt="Thumb" />
            ) : (
              <FiImage className="text-gray-300" size={16} />
            )}
          </div>
        ),
        enableSorting: false,
        size: 60,
        minSize: 50,
        maxSize: 80,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate">
            {info.getValue()}
          </div>
        ),
        size: 200,
        minSize: 120,
        maxSize: 300,
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded-sm">{info.getValue()}</span>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      }),
      columnHelper.accessor((row) => row.category.name, {
        id: "categoryName",
        header: "Category",
        cell: (info) => <span className="text-xs sm:text-sm text-gray-600 truncate">{info.getValue()}</span>,
        size: 120,
        minSize: 100,
        maxSize: 200,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => <span className="text-xs sm:text-sm text-gray-600">{formatPrice(info.getValue())}</span>,
        size: 90,
        minSize: 80,
        maxSize: 120,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => {
          const stock = info.getValue() ?? 0;
          return (
            <span
              className={`text-xs sm:text-sm font-medium ${
                stock < 10 && stock > 0 ? "text-orange-600" : stock === 0 ? "text-red-600" : "text-gray-700"
              }`}
            >
              {stock === 0 ? "Out" : stock}
            </span>
          );
        },
        size: 60,
        minSize: 50,
        maxSize: 100,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
              info.getValue()
            )}`}
          >
            {info.getValue() || "N/A"}
          </span>
        ),
        size: 90,
        minSize: 70,
        maxSize: 120,
      }),
      columnHelper.accessor("lastUpdated", {
        header: "Updated",
        cell: (info) => (
          <span className="text-xs text-gray-500 hidden sm:table-cell">{formatDate(info.getValue())}</span>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right pr-1 sm:pr-2">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end items-center space-x-1">
            <button
              onClick={() => onEdit(row.original)}
              className="text-indigo-600 hover:text-indigo-900 p-1 sm:p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <FiEdit size={14} />
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="text-red-500 hover:text-red-700 p-1 sm:p-1.5 rounded-md hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: { minSize: 40, size: 100, maxSize: 400 },
  });

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200 w-full min-w-[320px] max-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  style={{
                    width: h.getSize(),
                    minWidth: h.column.columnDef.minSize,
                    maxWidth: h.column.columnDef.maxSize,
                  }}
                  onClick={h.column.getToggleSortingHandler()}
                  className={`px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    h.column.getCanSort() ? "cursor-pointer select-none hover:bg-gray-100 transition-colors" : ""
                  } ${h.id === "lastUpdated" ? "hidden sm:table-cell" : ""}`}
                >
                  <div className="flex items-center group">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getCanSort() && (
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {h.column.getIsSorted() === "asc" ? (
                          <FiChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                        ) : h.column.getIsSorted() === "desc" ? (
                          <FiChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                        ) : (
                          <FiChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/75 transition-colors duration-100">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                    minWidth: cell.column.columnDef.minSize,
                    maxWidth: cell.column.columnDef.maxSize,
                  }}
                  className={`px-2 sm:px-3 py-2 whitespace-nowrap text-xs sm:text-sm ${
                    cell.column.id === "lastUpdated" ? "hidden sm:table-cell" : ""
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ProductTable;
