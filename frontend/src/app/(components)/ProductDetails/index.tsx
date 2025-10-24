import React, { useState } from "react";
import RatingPopup from "@/app/(components)/Rating";
import { ProductDetailsSectionProps } from "@/types/types";

// SVG components for stars
const FullStar = () => (
  <svg
    className="w-6 h-6 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const HalfStar = () => (
  <svg
    className="w-6 h-6 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    {/* Right half of the star (filled) */}
    <path d="M12 17.27V2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z" />
    {/* Left half of the star (empty/stroked) */}
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2v15.27z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const EmptyStar = () => (
  <svg
    className="w-6 h-6 text-yellow-500"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  product,
  totalRatings,
  ratingDistribution,
}) => {
  const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);

  const _toggleShowMoreSpecs = () => {
    setShowMoreSpecs(!showMoreSpecs);
  };

  // Function to render stars based on rating
  const _renderStars = (rating: number = 3.5) => {
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 >= 0.5; // Check for half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <div className="flex items-center">
        {Array(fullStars)
          .fill(null)
          .map((_, index) => (
            <FullStar key={`full-${index}`} />
          ))}
        {hasHalfStar && <HalfStar />}
        {Array(emptyStars)
          .fill(null)
          .map((_, index) => (
            <EmptyStar key={`empty-${index}`} />
          ))}
      </div>
    );
  };
  return (
    <div className="w-1/3">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {product?.name}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {product?.description
          ?.split(" ")
          ?.map(
            (word) =>
              word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase()
          )
          ?.join(" ") || ""}
      </p>
      <div
        className="flex items-center mb-4 cursor-pointer"
        onClick={() => setIsRatingPopupOpen(true)}
      >
        {/* {renderStars(product?.rating)} */}
        {/* <span className="ml-2 text-gray-600 dark:text-gray-300">
          {product.rating} out of 5 stars ({totalRatings.toLocaleString()}{" "}
          ratings)
        </span> */}
      </div>
      <RatingPopup
        isOpen={isRatingPopupOpen}
        onClose={() => setIsRatingPopupOpen(false)}
        rating={product.rating}
        totalRatings={totalRatings}
        ratingDistribution={ratingDistribution}
      />
      <div className="mb-4">
        <p className="text-xl font-semibold text-gray-800 dark:text-white">
          ${product?.price?.toFixed(2)}
        </p>
        {product?.originalPrice && (
          <p className="text-sm text-gray-500 line-through">
            List Price: ${product?.originalPrice?.toFixed(2)}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          $
          {(
            ((product?.originalPrice - product?.price) /
              product?.originalPrice) *
            100
          )?.toFixed(0)}
          % off
        </p>
      </div>
      <p className="text-green-600 dark:text-green-400 mb-4">In Stock</p>
      <p className="text-gray-600 dark:text-gray-300 mb-2">
        Ships from: Ecommerce
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Sold by: {product?.brand} AUTHORIZED
      </p>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        30-day return/refund/replacement
      </p>
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Brand:</span> {product?.brand}
        </p>

        {/* {showMoreSpecs && (
          <>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Battery Life:</span>{" "}
              {product.batteryLife}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Sensor Type:</span>{" "}
              {product.sensorType}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Battery Description:</span>{" "}
              {product.batteryDescription}
            </p>
          </>
        )} */}
        {/* <button
          onClick={toggleShowMoreSpecs}
          className="text-blue-500 hover:underline text-sm mt-2"
        >
          {showMoreSpecs ? "See less" : "See more"}
        </button> */}
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          About this item
        </h2>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
          {product?.features?.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetailsSection;
