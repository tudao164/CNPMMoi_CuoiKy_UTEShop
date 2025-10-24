import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminDashboardService } from '@/services/admin.service';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [newCustomers, setNewCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel (only working endpoints)
      const [overviewRes, cashFlowRes, customersRes] = await Promise.all([
        adminDashboardService.getOverview(),
        adminDashboardService.getCashFlow(),
        adminDashboardService.getNewCustomers({ limit: 10 }),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (cashFlowRes.success) setCashFlow(cashFlowRes.data);
      if (customersRes.success) setNewCustomers(customersRes.data.customers || []);
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* Today Stats */}
      {overview?.today && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Đơn hàng hôm nay</p>
                <p className="text-3xl font-bold mt-2">{overview.today.orders_today}</p>
                <p className="text-blue-100 text-xs mt-1">Đơn mới: {overview.today.new_orders_today}</p>
              </div>
              <div className="text-5xl opacity-50">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Doanh thu hôm nay</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(overview.today.revenue_today)}</p>
              </div>
              <div className="text-5xl opacity-50">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Khách hàng mới</p>
                <p className="text-3xl font-bold mt-2">{overview.customers.new_customers_today}</p>
                <p className="text-purple-100 text-xs mt-1">7 ngày: {overview.customers.new_customers_7d}</p>
              </div>
              <div className="text-5xl opacity-50">👥</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      {overview?.revenue && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(overview.revenue.total_orders)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng doanh thu</div>
            <div className="text-xl font-bold text-green-600 mt-1">
              {formatCurrency(overview.revenue.total_revenue)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Giá trị TB đơn</div>
            <div className="text-xl font-bold text-blue-600 mt-1">
              {formatCurrency(overview.revenue.avg_order_value)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng giảm giá</div>
            <div className="text-xl font-bold text-orange-600 mt-1">
              {formatCurrency(overview.revenue.total_discount)}
            </div>
          </div>
        </div>
      )}

      {/* Orders Status */}
      {overview?.revenue && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600">Chờ xử lý</div>
            <div className="text-2xl font-bold text-yellow-600">
              {overview.revenue.pending_orders}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-xs text-gray-600">Đang xử lý</div>
            <div className="text-2xl font-bold text-blue-600">
              {overview.revenue.processing_orders}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-xs text-gray-600">Đã giao</div>
            <div className="text-2xl font-bold text-green-600">
              {overview.revenue.delivered_orders}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-xs text-gray-600">Đã hủy</div>
            <div className="text-2xl font-bold text-red-600">
              {overview.revenue.cancelled_orders}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Phương thức thanh toán</h2>
          {overview?.payment_breakdown && overview.payment_breakdown.length > 0 ? (
            <div className="space-y-4">
              {overview.payment_breakdown.map((item: any, index: number) => {
                const totalRevenue = overview.payment_breakdown.reduce(
                  (sum: number, p: any) => sum + p.total_amount, 
                  0
                );
                const percentage = ((item.total_amount / totalRevenue) * 100).toFixed(1);
                
                return (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {item.payment_method === 'COD' ? '💵' : '💳'}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900">
                            {item.payment_method === 'COD' 
                              ? 'Thanh toán khi nhận hàng' 
                              : 'Ví điện tử'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.order_count} đơn hàng • {percentage}% tổng doanh thu
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Tổng tiền</div>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(item.total_amount)}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.payment_method === 'COD' 
                              ? 'bg-blue-600' 
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <div>Chưa có dữ liệu thanh toán</div>
            </div>
          )}
        </div>

        {/* New Customers List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Khách hàng mới</h2>
          {newCustomers.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {newCustomers.map((customer: any) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{customer.full_name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {customer.total_orders || 0} đơn
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(customer.total_spent || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Chưa có khách hàng mới</div>
          )}
        </div>
      </div>

      {/* Cash Flow Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cash Flow Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💵 Tổng quan dòng tiền</h2>
          {cashFlow?.summary ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="text-sm text-green-700">Đã thu</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(cashFlow.summary.total_collected)}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="text-sm text-yellow-700">Chờ thu</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(cashFlow.summary.total_pending)}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="text-sm text-red-700">Đã hủy</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(cashFlow.summary.total_cancelled)}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm text-blue-700">Tổng giảm giá</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(cashFlow.summary.total_discount_applied)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Products and Customers Overview */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Sản phẩm</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {overview.products.total_products}
                </div>
                <div className="text-sm text-gray-600 mt-1">Tổng sản phẩm</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {overview.products.active_products}
                </div>
                <div className="text-sm text-gray-600 mt-1">Đang bán</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {overview.products.out_of_stock}
                </div>
                <div className="text-sm text-gray-600 mt-1">Hết hàng</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {overview.products.low_stock}
                </div>
                <div className="text-sm text-gray-600 mt-1">Sắp hết</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Khách hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tổng khách hàng</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(overview.customers.total_customers)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Mới 30 ngày</span>
                <span className="text-xl font-bold text-green-600">
                  +{overview.customers.new_customers_30d}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Mới 7 ngày</span>
                <span className="text-xl font-bold text-blue-600">
                  +{overview.customers.new_customers_7d}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
