import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import { ERROR_MESSAGES } from '@/config/constants';
import toast from 'react-hot-toast';

interface DeleteAccountForm {
  password: string;
  confirmText: string;
}

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeleteAccountForm>();

  const password = watch('password');
  const confirmText = watch('confirmText');

  const onSubmit = async (data: DeleteAccountForm) => {
    if (data.confirmText !== 'XOA TAI KHOAN') {
      toast.error('Vui lòng nhập đúng cụm từ xác nhận!');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirmModal(false);

    try {
      const response = await userService.deleteAccount(password);

      if (response.success) {
        toast.success('Tài khoản đã được xóa thành công!', {
          duration: 3000,
        });

        // Logout and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-2xl font-bold text-primary-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              UTEShop
            </h1>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:text-primary-600"
            >
              ← Quay lại Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {/* Warning Header */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-red-900">Xóa tài khoản vĩnh viễn</h2>
              <p className="text-sm text-red-700 mt-1">
                Hành động này không thể hoàn tác!
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-8 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Điều gì sẽ xảy ra khi bạn xóa tài khoản?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Tất cả thông tin cá nhân của bạn sẽ bị xóa vĩnh viễn</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Lịch sử đơn hàng và giao dịch sẽ không thể khôi phục</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Bạn sẽ mất quyền truy cập vào tất cả dữ liệu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Email <strong>{user?.email}</strong> sẽ không thể đăng ký lại</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Bạn có thể cân nhắc:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Tạm thời đăng xuất thay vì xóa tài khoản</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Cập nhật thông tin bảo mật nếu lo ngại về an toàn</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Liên hệ hỗ trợ nếu gặp vấn đề với tài khoản</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Delete Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại <span className="text-red-600">*</span>
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                className="input"
                placeholder="Nhập mật khẩu để xác nhận"
                disabled={isDeleting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Nhập "<strong>XOA TAI KHOAN</strong>" để xác nhận <span className="text-red-600">*</span>
              </label>
              <input
                id="confirmText"
                type="text"
                {...register('confirmText', {
                  required: 'Vui lòng nhập cụm từ xác nhận',
                  validate: (value) =>
                    value === 'XOA TAI KHOAN' || 'Vui lòng nhập đúng: XOA TAI KHOAN',
                })}
                className="input"
                placeholder="XOA TAI KHOAN"
                disabled={isDeleting}
              />
              {errors.confirmText && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmText.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Lưu ý: Viết hoa toàn bộ, không dấu, cách giữa các từ
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-secondary flex-1"
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                disabled={
                  isDeleting ||
                  !password ||
                  !confirmText ||
                  confirmText !== 'XOA TAI KHOAN'
                }
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </span>
                ) : (
                  'Xóa tài khoản vĩnh viễn'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận lần cuối</h3>
            </div>

            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{user?.email}</strong>?
              <br />
              <br />
              Hành động này không thể hoàn tác và tất cả dữ liệu sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1"
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                disabled={isDeleting}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
