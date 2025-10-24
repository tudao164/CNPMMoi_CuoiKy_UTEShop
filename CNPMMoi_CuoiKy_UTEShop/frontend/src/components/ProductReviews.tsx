import { useEffect, useState } from 'react';
import { reviewService } from '@/services/review.service';
import type { Review, ReviewStats, ReviewSortType } from '@/types/review.types';
import RatingStars from './RatingStars';
import ReviewCard from './ReviewCard';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<ReviewSortType>('recent');

  useEffect(() => {
    fetchReviews();
  }, [productId, page, filterRating, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, {
        page,
        limit: 10,
        rating: filterRating,
        sort: sortBy,
      });

      if (response.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error: any) {
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const getRatingPercentage = (count: number) => {
    if (!stats || stats.total_reviews === 0) return 0;
    return (count / stats.total_reviews) * 100;
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && stats.total_reviews > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {Number(stats.average_rating || 0).toFixed(1)}
              </div>
              <RatingStars rating={Number(stats.average_rating || 0)} size="lg" readonly />
              <p className="text-gray-600 mt-2">
                {stats.total_reviews} đánh giá • {stats.verified_purchases} đã mua
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[
                { star: 5, count: stats.five_star },
                { star: 4, count: stats.four_star },
                { star: 3, count: stats.three_star },
                { star: 2, count: stats.two_star },
                { star: 1, count: stats.one_star },
              ].map(({ star, count }) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? undefined : star)}
                  className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${
                    filterRating === star ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{star}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${getRatingPercentage(count)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ReviewSortType)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="rating_high">Đánh giá cao</option>
            <option value="rating_low">Đánh giá thấp</option>
          </select>
        </div>

        {filterRating && (
          <button
            onClick={() => setFilterRating(undefined)}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
          >
            {filterRating} sao ✕
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {reviews.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <ReviewCard review={review} onUpdate={fetchReviews} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600">
              {filterRating
                ? `Chưa có đánh giá ${filterRating} sao`
                : 'Chưa có đánh giá nào'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-gray-700">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
