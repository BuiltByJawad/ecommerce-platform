'use client';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { addToCart, removeFromCart } from '@/app/state';
import { Plus, Minus } from 'lucide-react';
import useAxios from '@/context/axiosContext';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrls: string[];
  description?: string;
  brand?: string;
  category?: string;
  features?: string[];
  attributes?: { [key: string]: string | string[] };
  isInStock?: boolean;
  discountedPrice?: number;
  cloudinaryPublicIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const Home = () => {
  const { theme } = useTheme();
  const [animationTrigger, setAnimationTrigger] = useState<{
    [key: string]: 'add' | 'remove' | null;
  }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.global.cartItems);
  const { get } = useAxios();
  console.log(cartItems);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await get('/products/all-products');
        if (response?.status === 200) {
          const fetchedProducts = response?.data?.data?.products || [];
          setProducts(fetchedProducts);
        } else {
          // throw new Error("Failed to fetch products");
        }
      } catch (err: any) {
        // const errorMessage = err?.response?.data?.message || "Failed to load products";
        // setError(errorMessage);
        // toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setAnimationTrigger((prev) => ({ ...prev, [product._id]: 'add' }));
    dispatch(addToCart(product));
    setTimeout(() => {
      setAnimationTrigger((prev) => ({ ...prev, [product._id]: null }));
    }, 500);
  };

  const handleRemoveFromCart = (productId: string) => {
    setAnimationTrigger((prev) => ({ ...prev, [productId]: 'remove' }));
    dispatch(removeFromCart(productId));
    setTimeout(() => {
      setAnimationTrigger((prev) => ({ ...prev, [productId]: null }));
    }, 500);
  };

  const formatCartQuantity = (quantity: number) => {
    return quantity > 999 ? '999+' : quantity;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <main className='mx-auto pt-10 pb-6 sm:pt-15 sm:pb-8'>
        <section className='bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden mb-6 sm:mb-8'>
          <div className='flex flex-col md:flex-row items-center justify-center'>
            <div className='w-full text-center md:w-1/2 p-4 sm:p-6 md:p-8'>
              <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4'>
                Welcome to E-Commerce
              </h1>
              <p className='text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6'>
                Discover the best deals on fashion, accessories, and more.
                <br /> Shop now and enjoy exclusive offers!
              </p>
            </div>
            <div className='w-full md:w-1/2'>
              <Image
                src='/images/banner.png'
                alt='Hero Banner'
                width={600}
                height={400}
                priority
                className='object-contain w-full h-48 sm:h-64 md:h-80 lg:h-96'
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6'>
            Featured Products
          </h2>
          {isLoading ? (
            <div className='text-center'>
              <p className='text-gray-600 dark:text-gray-300'>Loading products...</p>
            </div>
          ) : error ? (
            <div className='text-center'>
              <p className='text-red-500'>{error}</p>
            </div>
          ) : products?.length === 0 ? (
            <div className='text-center'>
              <p className='text-gray-600 dark:text-gray-300'>No products available.</p>
            </div>
          ) : (
            <div className='grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6'>
              {products?.map((product) => (
                <Link
                  href={`/products/${product?.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}/dp/${product?._id}`}
                  key={product?._id}
                >
                  <div className='bg-white dark:bg-gray-800 border border-b-gray-500 rounded-lg hover:shadow-gray-400 shadow-lg overflow-hidden hover:shadow-xl transition'>
                    <Image
                      src={product?.imageUrls[0] || '/images/placeholder.jpg'}
                      alt={product?.name}
                      width={300}
                      height={300}
                      priority
                      className='object-cover w-full h-36 sm:h-48 lg:h-64'
                    />
                    <div className='p-3 sm:p-4'>
                      <h3 className='text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                        {product?.name}
                      </h3>
                      <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2'>
                        ${product?.price?.toFixed(2)}
                      </p>
                      {cartItems[product?._id] && (
                        <div className='flex items-center justify-between px-1 border rounded-lg overflow-hidden'>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFromCart(product?._id);
                            }}
                            className='bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 sm:px-4 py-1 sm:py-2 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500'
                          >
                            <Minus size={16} strokeWidth={2} />
                          </button>
                          <AnimatePresence mode='wait'>
                            <motion.span
                              key={`${product?._id}-${cartItems[product?._id]?.quantity}`}
                              initial={
                                animationTrigger[product?._id] === 'add'
                                  ? { y: -20, opacity: 0 }
                                  : animationTrigger[product?._id] === 'remove'
                                    ? { y: 20, opacity: 0 }
                                    : { y: 0, opacity: 1 }
                              }
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className='px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base text-gray-800 dark:text-white'
                            >
                              {formatCartQuantity(cartItems[product._id]?.quantity || 0)}
                            </motion.span>
                          </AnimatePresence>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            className='bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 sm:px-4 py-1 sm:py-2 font-medium transition hover:bg-gray-300 dark:hover:bg-gray-500'
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                      {!cartItems[product?._id] && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className='w-full bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition text-sm sm:text-base'
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
