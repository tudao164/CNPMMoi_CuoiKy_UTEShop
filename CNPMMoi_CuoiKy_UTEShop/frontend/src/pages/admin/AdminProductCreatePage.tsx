import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminProductService } from '@/services/admin.service';
import { uploadService } from '@/services/upload.service';
import { categoryService, Category } from '@/services/category.service';
import { CreateProductData } from '@/types/admin.types';
import { getImageUrl } from '@/config/constants';

export default function AdminProductCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    sale_price: undefined,
    stock_quantity: 0,
    category_id: 0,
    image_url: '',
    images: [],
    specifications: {},
    is_featured: false,
  });

  const [specFields, setSpecFields] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh mục');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadService.uploadImage(file);
      
      if (response.success) {
        setFormData({
          ...formData,
          image_url: response.data.image_url,
        });
        toast.success('Upload ảnh thành công');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Vui lòng chỉ chọn file hình ảnh');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadService.uploadImages(files);
      
      setFormData({
        ...formData,
        images: response.images,
      });
      toast.success(`Upload ${response.images.length} ảnh thành công`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specFields];
    newSpecs[index][field] = value;
    setSpecFields(newSpecs);
  };

  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  const removeSpecField = (index: number) => {
    setSpecFields(specFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price || !formData.stock_quantity || !formData.category_id) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Build specifications object
    const specifications: Record<string, string> = {};
    specFields.forEach((spec) => {
      if (spec.key && spec.value) {
        specifications[spec.key] = spec.value;
      }
    });

    try {
      setLoading(true);
      const productData: CreateProductData = {
        ...formData,
        specifications,
      };

      const response = await adminProductService.createProduct(productData);
      
      if (response.success) {
        toast.success('Tạo sản phẩm thành công');
        navigate('/admin/products');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-primary-600 hover:text-primary-700 mb-2"
        >
          ← Quay lại danh sách
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá gốc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá khuyến mãi
                    </label>
                    <input
                      type="number"
                      value={formData.sale_price || ''}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value={0}>-- Chọn danh mục --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Thông số kỹ thuật</h2>
                <button
                  type="button"
                  onClick={addSpecField}
                  className="btn-secondary text-sm"
                >
                  ➕ Thêm thông số
                </button>
              </div>

              <div className="space-y-3">
                {specFields.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Tên (vd: Screen)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Giá trị (vd: 6.7 inch)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {specFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecField(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hình ảnh chính</h2>
              
              {formData.image_url ? (
                <div className="mb-4">
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-2">Chưa có ảnh</p>
                </div>
              )}

              <label className="btn-primary w-full cursor-pointer text-center">
                {uploading ? 'Đang upload...' : '📤 Upload ảnh'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Gallery Images */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thư viện ảnh</h2>
              
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {formData.images.map((img, index) => (
                    <img
                      key={index}
                      src={getImageUrl(img)}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              <label className="btn-secondary w-full cursor-pointer text-center">
                {uploading ? 'Đang upload...' : '📤 Upload nhiều ảnh'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tùy chọn</h2>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploading}
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}
