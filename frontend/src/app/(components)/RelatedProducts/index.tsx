// src/app/(components)/RelatedProducts.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  image: string;
}

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  const [cardWidth, setCardWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Limit to 15 related products
  const relatedProducts = products.slice(0, 15);

  // Calculate the width of a single card dynamically
  useEffect(() => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.querySelector("a");
      if (firstCard) {
        const cardWidthWithGap = firstCard.getBoundingClientRect().width;
        setCardWidth(cardWidthWithGap);
      }
    }
  }, [relatedProducts]);

  // Scroll left and right functions to move by 7 products
  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = cardWidth * 7;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = cardWidth * 7;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Related Products
      </h2>
      <div className="flex items-center gap-4">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition z-10"
          aria-label="Scroll Left"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 flex-1"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
          onWheel={(e) => {
            e.preventDefault(); // Prevent mouse wheel scrolling
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari, and Opera */
            }
          `}</style>
          {relatedProducts.map((relatedProduct) => (
            <Link
              key={relatedProduct.id}
              href={`/products/${relatedProduct.name.toLowerCase()}/dp/${
                relatedProduct.id
              }`}
              className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 hover:shadow-lg transition"
            >
              <Image
                src={relatedProduct.image}
                alt={relatedProduct.name}
                width={120}
                height={120}
                className="object-cover w-full h-32 rounded-md mb-3"
              />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 truncate">
                {relatedProduct.name}
              </h3>
              <div className="flex items-center mb-1">
                <span className="text-yellow-500 text-xs">★★★★☆</span>
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">
                  4.2
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                ${(relatedProduct.discountedPrice ?? relatedProduct.price).toFixed(2)}
              </p>
              {relatedProduct.discountedPrice &&
                relatedProduct.discountedPrice < relatedProduct.price && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    ${relatedProduct.price.toFixed(2)}
                  </p>
                )}
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition z-10"
          aria-label="Scroll Right"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;
