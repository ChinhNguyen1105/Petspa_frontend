import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Loading from '../../../components/common/Loading';
import StatCard from '../dashboard/components/StatCard'; 
import { formatPrice } from '../../../utils/formatPrice';

// Import các Zustand Store của hệ thống
import { useOrderStore } from '../../../store/orderStore';
import { useBookingStore } from '../../../store/bookingStore'; 

// Hàm helper hiển thị trạng thái thanh toán đồng bộ style hệ thống
const getPaymentStatusBadge = (status) => {
  const config = {
    PAID: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <CheckCircle size={13} />, text: 'Đã thanh toán' },
    PENDING: { bg: 'bg-orange-50 text-pet-orange border-orange-200', icon: <Clock size={13} />, text: 'Chờ thanh toán' },
    UNPAID: { bg: 'bg-orange-50 text-pet-orange border-orange-200', icon: <Clock size={13} />, text: 'Chưa thanh toán' },
    REFUNDED: { bg: 'bg-purple-50 text-purple-600 border-purple-200', icon: <AlertCircle size={13} />, text: 'Đã hoàn tiền' },
  };

  const target = config[status] || { bg: 'bg-gray-50 text-gray-600 border-gray-200', icon: null, text: status };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${target.bg}`}>
      {target.icon}
      {target.text}
    </span>
  );
};

const RevenueReport = () => {
  // Lấy dữ liệu và hành động từ useOrderStore
  const { 
    orders: rawOrders, 
    loading: orderLoading, 
    fetchOrders 
  } = useOrderStore();

  // Lấy dữ liệu và hành động từ useBookingStore
  const { 
    bookings: rawBookings, 
    loading: bookingLoading, 
    fetchBookings,
    error: storeError
  } = useBookingStore();

  // Biến trạng thái lỗi cục bộ
  const [localError, setLocalError] = useState(null);

  // Bộ lọc dữ liệu báo cáo
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // ALL, PAID, PENDING, UNPAID
  const [sourceFilter, setSourceFilter] = useState('ALL'); // ALL, SPA, SHOP

  // ── STATE PHÂN TRANG (PAGINATION) ──
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Số hàng trên mỗi trang

  // State quản lý số liệu đã tính toán sau khi áp bộ lọc
  const [reportStats, setReportStats] = useState({
    totalRevenue: 0,
    spaRevenue: 0,
    shopRevenue: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalTransactions: 0
  });

  // State hiển thị danh sách lịch sử giao dịch tổng hợp dưới bảng chi tiết
  const [combinedTransactions, setCombinedTransactions] = useState([]);

  // Gộp trạng thái loading toàn cục từ cả 2 store
  const isGlobalLoading = orderLoading || bookingLoading;
  
  // Tổng hợp lỗi hệ thống từ store hoặc lỗi cục bộ
  const activeError = storeError || localError;

  // Hành động kích hoạt load lại dữ liệu từ Store
  const handleRefreshData = async () => {
    try {
      setLocalError(null);
      await Promise.all([
        fetchOrders(),
        fetchBookings()
      ]);
      setCurrentPage(1); // Reset về trang 1 khi làm mới dữ liệu
    } catch (err) {
      console.error("Lỗi tải dữ liệu báo cáo doanh thu:", err);
      setLocalError("Hệ thống không thể đồng bộ dữ liệu hóa đơn. Vui lòng thử lại!");
    }
  };

  // Hàm xử lý nghiệp vụ tính toán báo cáo chuyên sâu và chuẩn hóa trường dữ liệu
  const calculateMetrics = (orders = [], bookings = [], paymentStatus, source) => {
    // 1. Chuẩn hóa mảng Đơn hàng (SHOP) dựa chính xác trên log API thực tế
    const normalizedOrders = orders.map(o => {
      // Ánh xạ trạng thái linh hoạt theo dữ liệu backend trả về
      let statusMap = o.paymentStatus;
      if (o.paymentStatus === 'SUCCESS') statusMap = 'PAID';
      
      return {
        id: `SHOP_${o.id}`,
        code: `ORD#${o.id}`,
        customerName: o.shippingName || o.userName || '—', // Ưu tiên shippingName từ API thực tế
        sourceType: 'SHOP',
        sourceLabel: 'Sản phẩm',
        amount: o.totalAmount || 0,
        paymentStatus: statusMap || 'PENDING',
        date: o.createdDate || '—'
      };
    });

    // 2. Chuẩn hóa mảng Đặt lịch (SPA)
    const normalizedBookings = bookings.map(b => {
      const statusMap = b.status === 'COMPLETED' ? 'PAID' : 'UNPAID';
      return {
        id: `SPA_${b.id}`,
        code: `BK#${b.id}`,
        customerName: b.userName || '—',
        sourceType: 'SPA',
        sourceLabel: 'Dịch vụ Spa',
        amount: b.actualPrice || 0,
        paymentStatus: statusMap,
        date: b.createdDate || '—'
      };
    });

    // 3. Áp dụng bộ lọc Nguồn (Source Filter)
    let finalTransactions = [];
    if (source === 'ALL') {
      finalTransactions = [...normalizedOrders, ...normalizedBookings];
    } else if (source === 'SHOP') {
      finalTransactions = [...normalizedOrders];
    } else if (source === 'SPA') {
      finalTransactions = [...normalizedBookings];
    }

    // 4. Áp dụng bộ lọc Trạng thái tiền (Payment Filter)
    if (paymentStatus !== 'ALL') {
      finalTransactions = finalTransactions.filter(tx => tx.paymentStatus === paymentStatus);
    }

    // 5. Tính toán các chỉ số thống kê (Chỉ tính Doanh Thu Sạch trên hóa đơn 'PAID')
    const shopPaidRevenue = normalizedOrders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.amount, 0);

    const spaPaidRevenue = normalizedBookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalPaidCount = normalizedOrders.filter(o => o.paymentStatus === 'PAID').length + 
                           normalizedBookings.filter(b => b.paymentStatus === 'PAID').length;
                           
    const totalUnpaidCount = normalizedOrders.filter(o => o.paymentStatus === 'PENDING' || o.paymentStatus === 'UNPAID').length + 
                             normalizedBookings.filter(b => b.paymentStatus === 'UNPAID').length;

    setReportStats({
      totalRevenue: shopPaidRevenue + spaPaidRevenue,
      spaRevenue: spaPaidRevenue,
      shopRevenue: shopPaidRevenue,
      paidCount: totalPaidCount,
      unpaidCount: totalUnpaidCount,
      totalTransactions: finalTransactions.length
    });

    // Sắp xếp các giao dịch tích hợp mới nhất lên trên cùng đầu bảng
    const sortedTransactions = finalTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    setCombinedTransactions(sortedTransactions);
  };

  // Lắng nghe thay đổi của bộ lọc -> Reset trang hiện tại về 1 để tránh lỗi lệch index
  useEffect(() => {
    calculateMetrics(rawOrders, rawBookings, paymentFilter, sourceFilter);
    setCurrentPage(1);
  }, [rawOrders, rawBookings, paymentFilter, sourceFilter]);

  // Khởi chạy lấy dữ liệu ban đầu
  useEffect(() => {
    handleRefreshData();
  }, []);

  // ── XỬ LÝ LOGIC PHÂN TRANG (PAGINATION CLIENT) ──
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = combinedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(combinedTransactions.length / itemsPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isGlobalLoading) return <div className="flex h-[60vh] items-center justify-center"><Loading size="large" /></div>;

  if (activeError) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 text-center p-6">
        <div className="p-4 bg-red-50 text-red-500 rounded-full"><AlertCircle size={40} /></div>
        <p className="text-gray-600 font-medium max-w-md">{activeError}</p>
        <button onClick={handleRefreshData} className="flex items-center gap-2 px-4 py-2 bg-pet-blue text-white rounded-xl text-sm font-bold shadow-sm hover:bg-opacity-90 transition-all">
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header báo cáo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Báo cáo tài chính</span>
          </div>
          <h1 className="text-3xl font-black text-pet-blue tracking-tight flex items-center gap-2">
            <TrendingUp className="text-emerald-500" /> DOANH THU & KINH DOANH
          </h1>
          <p className="text-sm text-gray-500 mt-1">Phân tích chi tiết nguồn tiền và theo dõi dòng tiền thanh toán thực tế.</p>
        </div>
        
        <button 
          onClick={handleRefreshData} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCw size={15} /> Làm mới dữ liệu
        </button>
      </div>

      {/* Bộ Điều Hướng Bộ Lọc (Filter Bar) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <Filter size={16} className="text-pet-blue" />
          <span>Bộ lọc dữ liệu:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Lọc theo Nguồn thu */}
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-pet-blue"
          >
            <option value="ALL">Tất cả mảng kinh doanh</option>
            <option value="SPA">Chỉ dịch vụ Spa & Đặt lịch</option>
            <option value="SHOP">Chỉ đơn hàng Sản phẩm</option>
          </select>

          {/* Lọc theo Trạng thái tiền về */}
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:border-pet-blue"
          >
            <option value="ALL">Tất cả trạng thái tiền</option>
            <option value="PAID">Giao dịch đã thanh toán</option>
            <option value="PENDING">Giao dịch chờ thanh toán</option>
            <option value="UNPAID">Giao dịch chưa thanh toán</option>
          </select>
        </div>
      </div>

      {/* Grid 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu thực tế (Đã thu)"
          value={formatPrice(reportStats.totalRevenue)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />

        <StatCard
          title="Doanh thu mảng Spa"
          value={formatPrice(reportStats.spaRevenue)}
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-pet-blue"
        />

        <StatCard
          title="Doanh thu mảng Shop"
          value={formatPrice(reportStats.shopRevenue)}
          icon={ShoppingBag}
          iconBg="bg-orange-50"
          iconColor="text-pet-orange"
        />

        <StatCard
          title="Tổng số đơn bộ lọc"
          value={`${reportStats.totalTransactions} hóa đơn`}
          icon={FileText}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
      </div>

      {/* Thẻ phân tích tỷ trọng & Sức khỏe dòng tiền */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">Cơ cấu dòng tiền về</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-gray-800">{reportStats.paidCount}</div>
              <div className="text-xs text-gray-400 font-medium">Hóa đơn thu tiền thành công</div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${(reportStats.paidCount / Math.max(1, (reportStats.paidCount + reportStats.unpaidCount))) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">Dòng công nợ chờ xử lý</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-gray-800">{reportStats.unpaidCount}</div>
              <div className="text-xs text-gray-400 font-medium">Hóa đơn chưa/chờ thanh toán</div>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-pet-orange">
              <Clock size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-pet-orange h-full" 
              style={{ width: `${(reportStats.unpaidCount / Math.max(1, (reportStats.paidCount + reportStats.unpaidCount))) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">Tỷ trọng Spa / Cửa hàng</h3>
          <div className="flex justify-between items-center text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-pet-blue rounded-full"></span>Spa</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-pet-orange rounded-full"></span>Cửa hàng</span>
          </div>
          <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden flex">
            <div 
              className="bg-pet-blue h-full" 
              style={{ width: `${(reportStats.spaRevenue / Math.max(1, reportStats.totalRevenue)) * 100}%` }}
            ></div>
            <div 
              className="bg-pet-orange h-full" 
              style={{ width: `${(reportStats.shopRevenue / Math.max(1, reportStats.totalRevenue)) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-[11px] text-gray-400 font-medium">Biểu đồ thể hiện tỷ lệ đóng góp doanh thu sạch</div>
        </div>
      </div>

      {/* Bảng chi tiết dòng tiền + BỘ PHÂN TRANG */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-black text-pet-blue flex items-center gap-2">
            <span className="w-2 h-5 bg-pet-blue rounded-full"></span> Nhật ký dòng tiền và chi tiết hóa đơn hệ thống
          </h2>
          {/* Bộ chọn số lượng dòng hiển thị trên mỗi trang */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span>Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:border-pet-blue"
            >
              <option value={5}>5 hàng</option>
              <option value={10}>10 hàng</option>
              <option value={20}>20 hàng</option>
              <option value={50}>50 hàng</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4">Mã giao dịch</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Nguồn doanh thu</th>
                <th className="p-4">Thời gian tạo</th>
                <th className="p-4 text-center">Trạng thái tiền</th>
                <th className="p-4 text-right">Tổng số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <FileText size={36} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy bản ghi hóa đơn nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                currentItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                        tx.sourceType === 'SPA' ? 'text-pet-blue bg-blue-50' : 'text-pet-orange bg-orange-50'
                      }`}>
                        {tx.code}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{tx.customerName}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                        tx.sourceType === 'SPA' ? 'bg-blue-50/30 text-pet-blue border-blue-100' : 'bg-orange-50/30 text-pet-orange border-orange-100'
                      }`}>
                        {tx.sourceLabel}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-medium text-xs">
                      {tx.date.includes('T') ? tx.date.split('T')[0] + ' ' + tx.date.split('T')[1].substring(0, 5) : tx.date}
                    </td>
                    <td className="p-4 text-center">{getPaymentStatusBadge(tx.paymentStatus)}</td>
                    <td className="p-4 text-right font-black text-gray-900 text-base">
                      {formatPrice(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── THANH ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION BAR UI) ── */}
        {combinedTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
            <div className="text-xs font-bold text-gray-400">
              Hiển thị từ <span className="text-gray-700">{indexOfFirstItem + 1}</span> đến{' '}
              <span className="text-gray-700">{Math.min(indexOfLastItem, combinedTransactions.length)}</span> trong tổng số{' '}
              <span className="text-pet-blue">{combinedTransactions.length}</span> bản ghi
            </div>

            <div className="flex items-center gap-1.5">
              {/* Nút lùi 1 trang */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl border border-gray-200 transition-all ${
                  currentPage === 1
                    ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-600 bg-white hover:bg-gray-50 active:scale-95'
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Danh sách các số trang */}
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-xs font-black rounded-xl transition-all ${
                      currentPage === pageNum
                        ? 'bg-pet-blue text-white shadow-md shadow-blue-100'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Nút tiến 1 trang */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl border border-gray-200 transition-all ${
                  currentPage === totalPages
                    ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-600 bg-white hover:bg-gray-50 active:scale-95'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReport;