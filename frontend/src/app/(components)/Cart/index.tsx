'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { addToCart, removeFromCart } from '@/app/state';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import type { Product as ProductType } from '@/types/types';

// Minimal product shape required for cart operations
interface AddToCartSectionProps {
  product: ProductType;
}

const AddToCartSection: React.FC<AddToCartSectionProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.global.cartItems);
  const [animationTrigger, setAnimationTrigger] = useState<'add' | 'remove' | null>(null);

  const productId = product._id as string | undefined;

  // Check if the product is in the cart and get its quantity
  const cartItem = productId ? cartItems[productId] : undefined;

  const rawPrice = product.price;
  const numericPrice =
    typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice || '0');

  const handleAddToCart = () => {
    if (!productId) return;
    setAnimationTrigger('add');
    dispatch(addToCart(product)); // Pass the entire product object
    setTimeout(() => setAnimationTrigger(null), 500);
  };

  const handleRemoveFromCart = () => {
    if (!productId) return;
    setAnimationTrigger('remove');
    dispatch(removeFromCart(productId)); // Pass only the product ID for removal
    setTimeout(() => setAnimationTrigger(null), 500);
  };

  const formatCartQuantity = (quantity: number) => {
    return quantity > 999 ? '999+' : quantity;
  };

  return (
    <div className='w-1/3'>
      <div className='bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md sticky top-4'>
        <p className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>
          ${numericPrice.toFixed(2)}
        </p>
        {/* <p className="text-gray-600 dark:text-gray-300 mb-2">
          $1.24 Shipping & Import Fees Deposit to Bangladesh
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Delivery Thursday, April 17. Order within 10 hrs 58 mins
        </p> */}
        <p className='text-green-600 dark:text-green-400 mb-4'>
          {product?.isInStock ? 'In Stock' : 'Out of Stock'}
        </p>
        <div className='flex items-center mb-4'>
          <label className='mr-2 text-gray-600 dark:text-gray-300'>Quantity:</label>
          {cartItem ? (
            <div className='flex items-center justify-between border rounded-lg overflow-hidden'>
              <button
                onClick={handleRemoveFromCart}
                className='bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500'
              >
                <Minus size={16} strokeWidth={2} />
              </button>
              <AnimatePresence mode='wait'>
                <motion.span
                  key={`${productId ?? 'unknown'}-${cartItem?.quantity ?? 0}`}
                  initial={
                    animationTrigger === 'add'
                      ? { y: -20, opacity: 0 }
                      : animationTrigger === 'remove'
                        ? { y: 20, opacity: 0 }
                        : { y: 0, opacity: 1 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='px-3 py-1 text-sm text-gray-800 dark:text-white'
                >
                  {formatCartQuantity(cartItem?.quantity)}
                </motion.span>
              </AnimatePresence>
              <button
                onClick={handleAddToCart}
                className='bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500'
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <select
              className='border rounded-md p-1 text-gray-800 dark:text-white dark:bg-gray-800'
              onChange={(e) => {
                const quantity = parseInt(e.target.value);
                for (let i = 0; i < quantity; i++) {
                  dispatch(addToCart(product));
                }
              }}
            >
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
            </select>
          )}
        </div>
        {!cartItem && (
          <button
            onClick={handleAddToCart}
            className='w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition mb-2'
            disabled={!product?.isInStock}
          >
            Add to Cart
          </button>
        )}
        <Link href='/cart'>
          <button
            className='w-full bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition mb-2'
            disabled={!product?.isInStock}
          >
            Buy Now
          </button>
        </Link>
        <p className='text-gray-600 dark:text-gray-300 mt-2'>Secure transaction</p>
      </div>
    </div>
  );
};

export default AddToCartSection;
