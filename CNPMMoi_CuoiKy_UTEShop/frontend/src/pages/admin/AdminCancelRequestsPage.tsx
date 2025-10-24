import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminCancelRequestService } from '@/services/admin.service';

interface CancelRequest {
  id: number;
  order_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  status_text: string;
  status_color: string;
  admin_response: string | null;
  created_at: string;
  processed_at: string | null;
  order_total_amount: number;
  processing_time_hours: number;
  is_urgent: boolean;
}

interface CancelRequestStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_cancelled_amount: number;
  avg_processing_hours: number;
  approval_rate: string;
}

export default function AdminCancelRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [stats, setStats] = useState<CancelRequestStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CancelRequest | null>(null);
  const [processStatus, setProcessStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminResponse, setAdminResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [pagination.page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminCancelRequestService.getPendingRequests({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success && response.data) {
        setRequests(response.data.cancel_requests || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          }));
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminCancelRequestService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleOpenProcessModal = (request: CancelRequest) => {
    setSelectedRequest(request);
    setProcessStatus('approved');
    setAdminResponse('');
    setShowProcessModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast.error('Vui lòng nhập phản hồi của admin');
      return;
    }

    try {
      setProcessing(true);
      const response = await adminCancelRequestService.processRequest(
        selectedRequest.id,
        {
          status: processStatus,
          admin_response: adminResponse,
        }
      );

      if (response.success) {
        toast.success(
          processStatus === 'approved'
            ? 'Đã chấp thuận yêu cầu hủy đơn'
            : 'Đã từ chối yêu cầu hủy đơn'
        );
        setShowProcessModal(false);
        fetchRequests();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xử lý yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Hủy Đơn Hàng</h1>
        <p className="text-gray-600 mt-2">Quản lý các yêu cầu hủy đơn từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng yêu cầu</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_requests}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Chờ xử lý</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_requests}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đã chấp thuận</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved_requests}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tỷ lệ chấp thuận</div>
            <div className="text-2xl font-bold text-blue-600">{stats.approval_rate}%</div>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Không có yêu cầu hủy đơn nào chờ xử lý</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{request.order_id}</div>
                      {request.is_urgent && (
                        <span className="text-xs text-red-600 font-semibold">🔥 Khẩn cấp</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                      <div className="text-sm text-gray-500">{request.user_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(request.order_total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
                      <div className="text-xs text-gray-500">
                        {request.processing_time_hours}h trôi qua
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status_text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleOpenProcessModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ⚡ Xử lý
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                    đến{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    trong <span className="font-medium">{pagination.total}</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Xử Lý Yêu Cầu Hủy Đơn #{selectedRequest.order_id}
              </h2>

              {/* Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Khách hàng</div>
                    <div className="font-medium">{selectedRequest.user_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Giá trị đơn</div>
                    <div className="font-medium">{formatCurrency(selectedRequest.order_total_amount)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Lý do hủy</div>
                    <div className="font-medium">{selectedRequest.reason}</div>
                  </div>
                </div>
              </div>

              {/* Process Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quyết định
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="approved"
                        checked={processStatus === 'approved'}
                        onChange={(e) => setProcessStatus(e.target.value as 'approved' | 'rejected')}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">✅ Chấp thuận</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="rejected"
                        checked={processStatus === 'rejected'}
                        onChange={(e) => setProcessStatus(e.target.value as 'approved' | 'rejected')}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">❌ Từ chối</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phản hồi của Admin *
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={
                      processStatus === 'approved'
                        ? 'Ví dụ: Chấp thuận yêu cầu hủy đơn vì lý do hợp lý từ khách hàng.'
                        : 'Ví dụ: Từ chối yêu cầu vì đơn hàng đã được giao cho đơn vị vận chuyển.'
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleProcessRequest}
                  disabled={processing || !adminResponse.trim()}
                  className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    processStatus === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing
                    ? 'Đang xử lý...'
                    : processStatus === 'approved'
                    ? '✅ Chấp thuận'
                    : '❌ Từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
