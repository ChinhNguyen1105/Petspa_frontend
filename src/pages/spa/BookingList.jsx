import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, PawPrint } from 'lucide-react'; 

import { useBookingStore } from '../../store/bookingStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import { BOOKING_CONFIG } from '../../constants';

// Cấu hình trạng thái hiển thị mặc định từ hệ thống
const STATUS_CONFIG = BOOKING_CONFIG;

const BookingList = () => {
  const navigate = useNavigate();
  
  // Lấy dữ liệu và các hàm cần thiết từ useBookingStore
  const { bookings, loading, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) return <Loading fullScreen />;

  // Xử lý map cấu hình màu sắc/nhãn trạng thái dựa trên config hệ thống
  const getStatusConfig = (status) => {
    const upperStatus = status?.toUpperCase();
    return STATUS_CONFIG[upperStatus] || STATUS_CONFIG.PENDING;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-left">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-black text-pet-blue mb-8">Lịch sử đặt lịch</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-6">Bạn chưa có lịch đặt nào.</p>
            <Link to="/spa"><Button className="font-bold rounded-xl">Đặt lịch ngay</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusInfo = getStatusConfig(booking.status);
              
              // Đồng bộ thông tin thời gian từ bản ghi đặt lịch
              const startTime = booking.startTime;
              const endTime = booking.endTime;
              const bookingDate = booking.bookingDate;

              return (
                <div 
                  key={booking.id} 
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-center overflow-hidden">
                    <div className="bg-pet-blue/10 p-3 rounded-xl text-pet-blue flex-shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 truncate">
                        {booking.bookingDetails?.map(s => s.serviceName).join(' + ') || 'Dịch vụ Spa'}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {startTime} - {endTime} | {bookingDate ? formatDate(bookingDate) : 'N/A'}
                        </span>
                        
                        <span className="flex items-center gap-1 text-pet-blue font-medium">
                          <PawPrint size={14} /> {booking.pet?.name || 'Thú cưng'} 
                          {booking.pet?.breed ? `(${booking.pet.breed})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>

                    {/* TẬN DỤNG LOGIC STORE: Chỉ hiển thị nút Đánh giá khi đã hoàn thành VÀ chưa được đánh giá trước đó */}
                    {booking.status?.toUpperCase() === 'COMPLETED' && !booking.reviewed && (
                      <Button 
                        variant="outline" 
                        className="text-xs py-1.5 px-3 rounded-xl font-bold border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => navigate(`/review/create/booking/${booking.id}`)}
                      >
                        Đánh giá
                      </Button>
                    )}

                    <Link to={`/spa/booking/${booking.id}`}>
                      <ChevronRight className="text-gray-400 hover:text-pet-blue transition-colors cursor-pointer" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingList;