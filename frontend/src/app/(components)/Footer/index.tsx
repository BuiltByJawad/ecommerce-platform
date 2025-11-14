import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-gray-800 text-gray-300 py-8 mt-16 md:mt-24'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8'>
          <div>
            <h3 className='text-lg font-semibold text-white mb-4'>Get to Know Us</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/about' className='hover:text-white transition'>
                  About E-Shop
                </Link>
              </li>
              <li>
                <Link href='/careers' className='hover:text-white transition'>
                  Careers
                </Link>
              </li>
              <li>
                <Link href='/press' className='hover:text-white transition'>
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href='/sustainability' className='hover:text-white transition'>
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold text-white mb-4'>Customer Service</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/help' className='hover:text-white transition'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href='/contact' className='hover:text-white transition'>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href='/returns' className='hover:text-white transition'>
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href='/shipping' className='hover:text-white transition'>
                  Shipping Information
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold text-white mb-4'>Shop by Category</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/categories/fashion' className='hover:text-white transition'>
                  Fashion
                </Link>
              </li>
              <li>
                <Link href='/categories/electronics' className='hover:text-white transition'>
                  Electronics
                </Link>
              </li>
              <li>
                <Link href='/categories/home' className='hover:text-white transition'>
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href='/categories/sports' className='hover:text-white transition'>
                  Sports & Outdoors
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold text-white mb-4'>Connect with Us</h3>
            <div className='flex space-x-4 mb-4'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Facebook'
                className='hover:text-white transition'
              >
                <Facebook size={24} />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Twitter'
                className='hover:text-white transition'
              >
                <Twitter size={24} />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Instagram'
                className='hover:text-white transition'
              >
                <Instagram size={24} />
              </a>
              <a
                href='https://youtube.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='YouTube'
                className='hover:text-white transition'
              >
                <Youtube size={24} />
              </a>
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>Get the App</h3>
            <p className='text-sm mb-4'>Download our app for a better shopping experience!</p>
            <div className='flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0'>
              <Link
                href='https://play.google.com'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Download on Google Play'
              >
                <Image
                  src='/images/google-play.png'
                  alt='Google Play'
                  width={120}
                  height={40}
                  className='object-contain'
                />
              </Link>
              <Link
                href='https://www.apple.com/app-store/'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Download on the App Store'
              >
                <Image
                  src='/images/app-store.png'
                  alt='App Store'
                  width={120}
                  height={40}
                  className='object-contain'
                />
              </Link>
            </div>
          </div>
        </div>

        <hr className='border-gray-600 mb-6' />

        <div className='flex flex-col items-center text-sm space-y-4 sm:flex-row sm:justify-between sm:space-y-0'>
          <div className='flex flex-wrap justify-center gap-4'>
            <Link href='/privacy' className='hover:text-white transition'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='hover:text-white transition'>
              Terms of Service
            </Link>
            <Link href='/cookies' className='hover:text-white transition'>
              Cookie Policy
            </Link>
          </div>
          <p>© {new Date().getFullYear()} E-Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
