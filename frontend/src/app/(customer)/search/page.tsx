"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { SearchResponse } from "@/types/types";

const SearchResultsPage = () => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const { get, loading } = useAxios();

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get("query");
  const category = searchParams.get("category") || "all";

  useEffect(() => {
    if (!query) {
      setError("Search query is required");
      return;
    }

    const searchProducts = async () => {
      try {
        setError(null);
        const searchParams = new URLSearchParams({
          query,
          category,
          page: currentPage.toString(),
          limit: "20",
        });

        const response = await get(
          `/products/search?${searchParams.toString()}`
        );

        if (response?.status === 200) {
          setSearchResults(response.data.data);
        }
      } catch (error: any) {
        console.error("Search error:", error);
        setError("Failed to search products. Please try again.");
        toast.error("Failed to search products", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    searchProducts();
  }, [query, category, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (loading && !searchResults) {
    return (
      <div
        className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Search Error</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/home"
              className="text-yellow-500 hover:text-yellow-600 underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Search Info Header */}
        {searchResults && (
          <div className="mb-6">
            <h1
              className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Search Results
            </h1>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
{searchResults?.pagination?.totalItems} results for &quot;
              {searchResults?.searchInfo?.query}&quot;
              {searchResults?.searchInfo?.category !== "all" && (
                <span> in {searchResults?.searchInfo?.category}</span>
              )}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {searchResults && searchResults?.products?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {searchResults?.products?.map((product) => (
                <div
                  key={product?._id}
                  className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <Link
                    href={`/products/${encodeURIComponent(product?.name)}/dp/${
                      product?._id
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={product?.imageUrls[0] || "/placeholder-image.jpg"}
                        alt={product?.name}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      {product?.originalPrice &&
                        product?.originalPrice > product?.price && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                            -
                            {getDiscountPercentage(
                              product?.originalPrice,
                              product?.price
                            )}
                            %
                          </span>
                        )}
                      {!product?.isInStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3
                        className={`font-semibold text-sm mb-2 line-clamp-2 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {product?.name}
                      </h3>
                      <p
                        className={`text-xs mb-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {product?.brand}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-yellow-600">
                          {product?.price}
                        </span>
                        {product?.originalPrice &&
                          product?.originalPrice > product?.price && (
                            <span
                              className={`text-sm line-through ${
                                theme === "dark"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.originalPrice}
                            </span>
                          )}
                      </div>
                      <p
                        className={`text-xs line-clamp-3 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {product?.description}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {searchResults.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!searchResults.pagination.hasPrevPage}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchResults.pagination.hasPrevPage
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>

                <span
                  className={`px-4 py-2 text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Page {searchResults.pagination.currentPage} of{" "}
                  {searchResults.pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!searchResults.pagination.hasNextPage}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchResults.pagination.hasNextPage
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h2
              className={`text-xl font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              No products found
            </h2>
            <p
              className={`mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Try adjusting your search terms or browse our categories.
            </p>
            <Link
              href="/home"
              className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
