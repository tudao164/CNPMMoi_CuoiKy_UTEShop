import { useState } from 'react';
import RatingStars from './RatingStars';
import type { Review } from '@/types/review.types';
import { getImageUrl } from '@/config/constants';
import { reviewService } from '@/services/review.service';
import toast from 'react-hot-toast';

interface ReviewCardProps {
  review: Review;
  onUpdate?: () => void;
}

export default function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [loading, setLoading] = useState(false);

  const handleMarkHelpful = async () => {
    try {
      setLoading(true);
      const response = await reviewService.markHelpful(review.id);
      
      if (response.success) {
        if (response.data.action === 'added') {
          setIsHelpful(true);
          setHelpfulCount(prev => prev + 1);
          toast.success('Đã đánh dấu hữu ích');
        } else {
          setIsHelpful(false);
          setHelpfulCount(prev => prev - 1);
          toast.success('Đã bỏ đánh dấu');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {review.user_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                  ✓ Đã mua hàng
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} size="sm" readonly />
              <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {!review.is_approved && (
          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">
            Đang chờ duyệt
          </span>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`Review ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/80';
              }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleMarkHelpful}
          disabled={loading}
          className={`flex items-center gap-1 text-sm ${
            isHelpful
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-blue-600'
          } transition-colors disabled:opacity-50`}
        >
          <svg
            className="w-4 h-4"
            fill={isHelpful ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Hữu ích ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
}
