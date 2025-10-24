"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/app/redux";
import AddToCartSection from "@/app/(components)/Cart";
import ReviewsSection from "@/app/(components)/Review";
import ProductDetailsSection from "@/app/(components)/ProductDetails";
import ProductImageZoom from "@/app/(components)/ProductImageZoom";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";

// Mock data for reviews (unchanged)
const reviews = [
  {
    id: 1,
    reviewer: "John Doe",
    rating: 5,
    comment: "This jacket is amazing! Keeps me warm and looks stylish.",
    date: "March 15, 2025",
  },
  {
    id: 2,
    reviewer: "Jane Smith",
    rating: 4,
    comment: "Good quality, but the fit is a bit tight for me.",
    date: "March 10, 2025",
  },
  {
    id: 3,
    reviewer: "Alex Brown",
    rating: 3,
    comment: "Decent jacket, but the zipper feels a bit flimsy.",
    date: "March 5, 2025",
  },
];

const ProductDetails = () => {
  const params = useParams();
  const { id, productName } = params;
  const { get, loading } = useAxios();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  // Get user from Redux store
  const user = useAppSelector((state) => state.global.currentUser);

  const rating = 4.3;
  const totalRatings = 10087;
  const ratingDistribution = [6657, 1513, 908, 303, 706]; // 5★, 4★, 3★, 2★, 1★

  // Fetch products using useAxios
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await get("/products/all-products");
        // console.log(response?.data);
        if (response?.status === 200 || response?.status === 201) {
          setProducts(response?.data?.data?.products || []);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // Find the product by _id - handle non-numeric ID safely
  const product = id ? products?.find((p) => p._id === id) : null;

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto py-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {error || "Product Not Found"}
          </h1>
          <Link
            href="/"
            className="text-blue-500 hover:underline mt-4 inline-block"
          >
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="mx-auto py-8 w-full">
        <div className="flex gap-8">
          {/* Left Section: Product Image with Zoom */}
          <ProductImageZoom
            imageSrc={product?.imageUrls?.[0] || ""}
            imageAlt={product?.name}
          />

          {/* Middle Section: Product Details */}
          <ProductDetailsSection
            product={product}
            rating={rating}
            totalRatings={totalRatings}
            ratingDistribution={ratingDistribution}
          />

          {/* Right Section: Add to Cart/Buy Now */}
          <AddToCartSection product={product} />
        </div>

        {/* Seller Promotion Section */}
        <div className="mt-12">
          <p className="text-gray-600 dark:text-gray-300">
            New to Amazon: Introducing Michael Kors{" "}
            <Link href="/home" className="text-blue-500 hover:underline">
              Shop now
            </Link>
          </p>
        </div>

        {/* Reviews Section */}
        <ReviewsSection
          rating={rating}
          totalRatings={totalRatings}
          ratingDistribution={ratingDistribution}
          reviews={reviews}
          user={user}
          productName={productName}
          id={id}
        />

        {/* Related Products Section */}
        {/* <RelatedProducts products={products} /> */}
      </main>
    </div>
  );
};

export default ProductDetails;
