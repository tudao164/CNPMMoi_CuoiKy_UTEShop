import { useEffect, useState } from 'react';
import { reviewService } from '@/services/review.service';
import type { Review } from '@/types/review.types';
import RatingStars from '@/components/RatingStars';
import EditReviewModal from '@/components/EditReviewModal';
import { getImageUrl } from '@/config/constants';
import toast from 'react-hot-toast';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchMyReviews();
  }, [page]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getMyReviews({ page, limit: 10 });

      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error: any) {
      toast.error('Không thể tải đánh giá của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      const response = await reviewService.deleteReview(id);
      if (response.success) {
        toast.success('Đã xóa đánh giá');
        fetchMyReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedReview(null);
    fetchMyReviews();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý các đánh giá bạn đã viết</p>
        </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <img
                  src={getImageUrl(review.product_image || '')}
                  alt={review.product_name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{review.product_name}</h3>
                  <p className="text-sm text-gray-600">{formatDate(review.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.is_approved ? (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                      ✓ Đã duyệt
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full">
                      ⏳ Chờ duyệt
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                <RatingStars rating={review.rating} size="md" readonly />
              </div>

              {/* Title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
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
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/80';
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(review)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Bạn chưa có đánh giá nào
          </h3>
          <p className="text-gray-600">
            Hãy mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm của bạn!
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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

      {/* Edit Review Modal */}
      {showEditModal && selectedReview && (
        <EditReviewModal
          review={selectedReview}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReview(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
