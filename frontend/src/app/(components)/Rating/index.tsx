import React from 'react';
import { X } from 'lucide-react';

const RatingPopup = ({ isOpen, onClose, rating, totalRatings, ratingDistribution }) => {
  if (!isOpen) return null;

  //calculate percentage for each rating
  const ratingPercentages = ratingDistribution.map((count) =>
    Math.round((count / totalRatings) * 100)
  );

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white dark:bg-gray-800 rounded-md p-6 max-w-md w-full shadow-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-800 dark:text-white'>
            {rating} out of 5 stars
          </h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <X size={20} />
          </button>
        </div>

        <div className='mb-4'>
          <p className='text-gray-600 dark:text-gray-300'>
            {totalRatings.toLocaleString()} global ratings
          </p>
        </div>

        {/* Ratings distribution */}
        <div className='space-y-2'>
          {[5, 4, 3, 2, 1].map((star, index) => (
            <div key={star} className='flex items-center'>
              <div className='w-16 text-sm text-gray-600 dark:text-gray-300'>{star} star</div>
              <div className='flex-1 h-4 mx-2 bg-gray-200 dark:bg-gray-700 rounded-sm overflow-hidden'>
                <div
                  className='h-full bg-yellow-400'
                  style={{ width: `${ratingPercentages[index]}%` }}
                 />
              </div>
              <div className='w-12 text-right text-sm text-gray-600 dark:text-gray-300'>
                {ratingPercentages[index]}%
              </div>
            </div>
          ))}
        </div>

        <div className='mt-6 text-center'>
          <button onClick={onClose} className='text-blue-600 hover:underline'>
            See customer reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPopup;
