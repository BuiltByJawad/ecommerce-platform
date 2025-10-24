"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { addToCart, removeFromCart } from "@/app/state";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";

// Define the Product interface to match the structure used in ProductDetails
interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  image: string;
  description: string;
  brand: string;
  color: string;
  material: string;
  compatibleDevices?: string;
  screenSize?: string;
  dimensions?: string;
  batteryLife?: string;
  sensorType?: string;
  batteryDescription?: string;
  features: string[];
  attributes?: { color: string[] };
  category?: string;
  cloudinaryPublicIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  imageUrls?: string[];
  isInStock?: boolean;
}

interface AddToCartSectionProps {
  product: Product;
}

const AddToCartSection: React.FC<AddToCartSectionProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.global.cartItems);
  const [animationTrigger, setAnimationTrigger] = useState<
    "add" | "remove" | null
  >(null);

  // Check if the product is in the cart and get its quantity
  const cartItem = cartItems[product?._id];

  const handleAddToCart = () => {
    setAnimationTrigger("add");
    dispatch(addToCart(product)); // Pass the entire product object
    setTimeout(() => setAnimationTrigger(null), 500);
  };

  const handleRemoveFromCart = () => {
    setAnimationTrigger("remove");
    dispatch(removeFromCart(product?._id)); // Pass only the product ID for removal
    setTimeout(() => setAnimationTrigger(null), 500);
  };

  const formatCartQuantity = (quantity: number) => {
    return quantity > 999 ? "999+" : quantity;
  };

  return (
    <div className="w-1/3">
      <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md sticky top-4">
        <p className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          ${product?.price?.toFixed(2)}
        </p>
        {/* <p className="text-gray-600 dark:text-gray-300 mb-2">
          $1.24 Shipping & Import Fees Deposit to Bangladesh
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Delivery Thursday, April 17. Order within 10 hrs 58 mins
        </p> */}
        <p className="text-green-600 dark:text-green-400 mb-4">
          {product?.isInStock ? "In Stock" : "Out of Stock"}
        </p>
        <div className="flex items-center mb-4">
          <label className="mr-2 text-gray-600 dark:text-gray-300">
            Quantity:
          </label>
          {cartItem ? (
            <div className="flex items-center justify-between border rounded-lg overflow-hidden">
              <button
                onClick={handleRemoveFromCart}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${product._id}-${cartItem?.quantity}`}
                  initial={
                    animationTrigger === "add"
                      ? { y: -20, opacity: 0 }
                      : animationTrigger === "remove"
                      ? { y: 20, opacity: 0 }
                      : { y: 0, opacity: 1 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-3 py-1 text-sm text-gray-800 dark:text-white"
                >
                  {formatCartQuantity(cartItem?.quantity)}
                </motion.span>
              </AnimatePresence>
              <button
                onClick={handleAddToCart}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <select
              className="border rounded-md p-1 text-gray-800 dark:text-white dark:bg-gray-800"
              onChange={(e) => {
                const quantity = parseInt(e.target.value);
                for (let i = 0; i < quantity; i++) {
                  dispatch(addToCart(product));
                }
              }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          )}
        </div>
        {!cartItem && (
          <button
            onClick={handleAddToCart}
            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition mb-2"
            disabled={!product?.isInStock}
          >
            Add to Cart
          </button>
        )}
        <Link href="/cart">
          <button
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition mb-2"
            disabled={!product?.isInStock}
          >
            Buy Now
          </button>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Secure transaction
        </p>
      </div>
    </div>
  );
};

export default AddToCartSection;
