'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/app/redux';
import AddToCartSection from '@/app/(components)/Cart';
import ReviewsSection from '@/app/(components)/Review';
import ProductDetailsSection from '@/app/(components)/ProductDetails';
import ProductImageZoom from '@/app/(components)/ProductImageZoom';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';
import type { Product } from '@/types/types';
import { useSystemSettings } from '@/utils/SystemSettingsProvider';

// Mock data for reviews (unchanged)
const reviews = [
  {
    id: 1,
    reviewer: 'John Doe',
    rating: 5,
    comment: 'This jacket is amazing! Keeps me warm and looks stylish.',
    date: 'March 15, 2025',
  },
  {
    id: 2,
    reviewer: 'Jane Smith',
    rating: 4,
    comment: 'Good quality, but the fit is a bit tight for me.',
    date: 'March 10, 2025',
  },
  {
    id: 3,
    reviewer: 'Alex Brown',
    rating: 3,
    comment: 'Decent jacket, but the zipper feels a bit flimsy.',
    date: 'March 5, 2025',
  },
];

const ProductDetails = () => {
  const params = useParams();
  const rawId = params?.id;
  const rawProductName = params?.productName;
  const productId: string = (Array.isArray(rawId) ? rawId[0] : rawId) || '';
  const productName: string = (Array.isArray(rawProductName) ? rawProductName[0] : rawProductName) || '';
  const { get, loading } = useAxios();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const { settings } = useSystemSettings();
  const siteName = settings?.short_name || settings?.website_name || 'our marketplace';

  // Get user from Redux store
  const user = useAppSelector((state) => state.global.currentUser);

  // Fetch products using useAxios
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await get('/products/all-products');
        // console.log(response?.data);
        if (response?.status === 200 || response?.status === 201) {
          setProducts(response?.data?.data?.products || []);
        } else {
          // throw new Error("Failed to fetch products");
        }
      } catch (error) {
        // console.error("Error fetching products:", error);
        // setError("Failed to load products");
        // toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, [get]);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await get(`/reviews/product/${productId}`, {});
      const data = res?.data?.data;
      const list = (data?.reviews || []).map((r: any) => ({
        id: r._id,
        reviewer: r.reviewerName || r.user?.email || 'Customer',
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      }));
      setProductReviews(list);
      const summary = data?.summary || {};
      setRating(summary.averageRating || 0);
      setTotalRatings(summary.totalRatings || 0);
      setRatingDistribution(
        Array.isArray(summary.distribution) && summary.distribution.length === 5
          ? summary.distribution
          : [0, 0, 0, 0, 0]
      );
    } catch (e) {
      // Ignore review loading errors on product page for now
    }
  }, [get, productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Find the product by _id - handle non-numeric ID safely
  const product = productId ? products?.find((p) => p._id === productId) : null;

  // Handle loading state
  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <svg
          className='animate-spin h-8 w-8 text-blue-500'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
           />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
           />
        </svg>
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className='min-h-screen'>
        <main className='mx-auto py-8'>
          <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
            {error || 'Product Not Found'}
          </h1>
          <Link href='/' className='text-blue-500 hover:underline mt-4 inline-block'>
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <main className='mx-auto py-8 w-full'>
        <div className='flex gap-8'>
          {/* Left Section: Product Image with Zoom */}
          <ProductImageZoom imageSrc={product?.imageUrls?.[0] || ''} imageAlt={product?.name} />

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
        <div className='mt-12'>
          <p className='text-gray-600 dark:text-gray-300'>
            New on {siteName}: Discover more great products{' '}
            <Link href='/home' className='text-blue-500 hover:underline'>
              Shop now
            </Link>
          </p>
        </div>

        {/* Reviews Section */}
        <ReviewsSection
          rating={rating}
          totalRatings={totalRatings}
          ratingDistribution={ratingDistribution}
          reviews={productReviews}
          user={user}
          productName={productName}
          id={productId}
          onReviewSubmitted={loadReviews}
        />

        {/* Related Products Section */}
        {/* <RelatedProducts products={products} /> */}
      </main>
    </div>
  );
};

export default ProductDetails;
