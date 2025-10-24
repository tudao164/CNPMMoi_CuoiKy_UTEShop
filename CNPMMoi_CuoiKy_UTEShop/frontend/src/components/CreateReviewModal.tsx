import { useState } from 'react';
import { reviewService } from '@/services/review.service';
import { uploadService } from '@/services/upload.service';
import type { CreateReviewData } from '@/types/review.types';
import RatingStars from './RatingStars';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/config/constants';

interface CreateReviewModalProps {
  productId: number;
  orderId: number;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReviewModal({
  productId,
  orderId,
  productName,
  onClose,
  onSuccess,
}: CreateReviewModalProps) {
  const [formData, setFormData] = useState<CreateReviewData>({
    product_id: productId,
    order_id: orderId,
    rating: 5,
    title: '',
    comment: '',
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = formData.images || [];

    // Kiểm tra số lượng ảnh (tối đa 5 ảnh)
    if (files.length + currentImages.length > 5) {
      toast.error('Chỉ được upload tối đa 5 ảnh');
      return;
    }

    const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Vui lòng chỉ chọn file hình ảnh');
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB mỗi ảnh)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Mỗi ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadService.uploadImages(files);

      const currentImages = formData.images || [];
      setFormData({
        ...formData,
        images: [...currentImages, ...response.images],
      });

      // Create preview URLs
      const newPreviews = response.images.map((img) => getImageUrl(img));
      setImagePreviews([...imagePreviews, ...newPreviews]);

      toast.success(`Upload ${response.images.length} ảnh thành công`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = formData.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rating) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }

    // Kiểm tra bắt buộc phải có ít nhất 1 ảnh
    if (!formData.images || formData.images.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 hình ảnh sản phẩm');
      return;
    }

    try {
      setLoading(true);
      const response = await reviewService.createReview(formData);

      if (response.success) {
        toast.success('Đánh giá đã được gửi thành công!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <p className="text-sm text-gray-600">Sản phẩm:</p>
            <p className="font-semibold text-gray-900">{productName}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <RatingStars
                rating={formData.rating}
                size="lg"
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
              <span className="text-lg font-medium text-gray-700">
                {formData.rating === 5 && '🤩 Tuyệt vời'}
                {formData.rating === 4 && '😊 Hài lòng'}
                {formData.rating === 3 && '😐 Bình thường'}
                {formData.rating === 2 && '😕 Không tốt'}
                {formData.rating === 1 && '😞 Rất tệ'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề (Tùy chọn)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Tóm tắt đánh giá của bạn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/1000 ký tự
            </p>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-600">
                    {uploading ? 'Đang upload...' : 'Thêm ảnh'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesUpload}
                    className="hidden"
                    disabled={uploading || (formData.images || []).length >= 5}
                  />
                </label>
                <span className="text-xs text-gray-500">
                  {(formData.images || []).length}/5 ảnh (Tối đa 5 ảnh, mỗi ảnh tối đa 5MB)
                </span>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                📸 Vui lòng upload ít nhất 1 hình ảnh thực tế của sản phẩm
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị
              công khai. Vui lòng viết đánh giá chân thực và tôn trọng.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                'Gửi đánh giá'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
