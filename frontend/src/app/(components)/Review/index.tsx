import React, { useState } from 'react';
import Link from 'next/link';

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsSectionProps {
  rating: number;
  totalRatings: number;
  ratingDistribution: number[];
  reviews: Review[];
  user: any; // Replace 'any' with the actual user type from your Redux store
  productName: string | string[];
  id: string | string[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  totalRatings,
  ratingDistribution,
  reviews,
  user,
  productName,
  id,
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Handle review form submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewComment.trim()) {
      alert('Please provide a rating and a comment.');
      return;
    }
    try {
      setSubmittingReview(true);
      // TODO: integrate with backend API to submit review
      console.log('Review submitted:', {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewRating(0);
      setReviewComment('');
      setIsReviewModalOpen(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <div className='mt-12'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-6'>Customer Reviews</h2>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Rating Summary */}
          <div className='md:w-1/3'>
            <div className='flex items-center mb-4'>
              <span className='text-yellow-500 text-2xl'>★★★★☆</span>
              <span className='ml-2 text-lg font-semibold text-gray-800 dark:text-white'>
                {rating} out of 5
              </span>
            </div>
            <p className='text-gray-600 dark:text-gray-300 mb-4'>
              {totalRatings.toLocaleString()} global ratings
            </p>
            {/* Rating Distribution */}
            <div className='space-y-2'>
              {ratingDistribution.map((count, index) => {
                const star = 5 - index;
                const percentage = (count / totalRatings) * 100;
                return (
                  <div key={star} className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-300'>{star} star</span>
                    <div className='w-48 bg-gray-200 rounded-full h-2.5'>
                      <div
                        className='bg-yellow-500 h-2.5 rounded-full'
                        style={{ width: `${percentage}%` }}
                       />
                    </div>
                    <span className='text-sm text-gray-600 dark:text-gray-300'>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Conditional Write a Review Button */}
            {user ? (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className='mt-4 text-blue-500 hover:underline'
              >
                Write a Review
              </button>
            ) : (
              <Link href='/signin' className='mt-4 text-blue-500 hover:underline'>
                Login to Write a Review
              </Link>
            )}
          </div>

          {/* Individual Reviews */}
          <div className='md:w-2/3'>
            <div className='space-y-6'>
              {reviews.map((review) => (
                <div key={review.id} className='border-b border-gray-200 pb-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='font-semibold text-gray-800 dark:text-white'>
                      {review.reviewer}
                    </span>
                    <span className='text-yellow-500'>
                      {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                    Reviewed on {review.date}
                  </p>
                  <p className='text-gray-600 dark:text-gray-300'>{review.comment}</p>
                </div>
              ))}
            </div>
            <Link
              href={`/products/${productName}/dp/${id}/reviews`}
              className='mt-4 inline-block text-blue-500 hover:underline'
            >
              See All Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md'>
            <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className='mb-4'>
                <label className='block text-gray-700 dark:text-gray-300 mb-2'>Rating</label>
                <div className='flex gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl ${
                        star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700 dark:text-gray-300 mb-2'>Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className='w-full p-2 border rounded-md text-gray-800 dark:text-white dark:bg-gray-700'
                  rows={4}
                  placeholder='Share your thoughts about the product...'
                  required
                />
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setIsReviewModalOpen(false)}
                  className='px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submittingReview}
                  className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewsSection;
