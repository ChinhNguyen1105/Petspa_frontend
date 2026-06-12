import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import { ArrowLeft, Edit2, ShieldAlert, Scale, Calendar, Activity, Scissors, CalendarCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { usePetStore } from '../../store/petStore';// Sửa lại đường dẫn tương đối cho đúng với dự án của bạn

// Sub-component hiển thị từng dòng lịch sử làm đẹp của bé
const BookingHistoryCard = ({ booking }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-50 border border-gray-100/70 rounded-2xl transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-pet-blue/10 rounded-xl text-pet-blue mt-0.5">
          <Scissors size={18} />
        </div>
        <div>
          <h4 className="font-bold text-gray-950 text-base">{booking.service_name}</h4>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Ngày làm dịch vụ: <span className="text-gray-600 font-bold">{booking.booking_date}</span>
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg block mb-1 ${
          booking.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
        }`}>
          {booking.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã xác nhận'}
        </span>
        <p className="text-sm font-black text-pet-orange">Dịch vụ Spa</p>
      </div>
    </div>
  );
};

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Bóc tách các state và action từ Zustand Store
  const { currentPet, loading, fetchPetById } = usePetStore();

  useEffect(() => {
    if (id) {
      fetchPetById(id);
    }
  }, [id, fetchPetById]);

  // Hiển thị trạng thái Loading từ Store
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loading size="large" />
      </div>
    );
  }

  // Trường hợp không tìm thấy pet (hoặc ID bậy bạ)
  if (!currentPet) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 max-w-xl mx-auto shadow-sm">
        <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-gray-900 font-bold text-lg mb-2">Không tìm thấy thông tin chi tiết của bé thú cưng này.</p>
        <Button variant="outline" onClick={() => navigate('/profile')} className="mt-4">
          Quay lại Hồ sơ của tôi
        </Button>
      </div>
    );
  }

  // Tiết kiệm cú pháp, gán currentPet thành pet để giữ nguyên code JSX bên dưới
  const pet = currentPet;
  const bookings = pet.recent_bookings || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-left">
      
      {/* Nút điều hướng đầu trang */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate("/profile", { state: { activeTab: "pets" } })} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} /> Quay lại danh sách bé
        </button>
        
        <Link to={`/profile/pets/edit/${pet.id}`}>
          <Button className="flex items-center gap-2 rounded-xl text-sm font-bold bg-pet-blue shadow-md shadow-pet-blue/10">
            <Edit2 size={16} /> Chỉnh sửa hồ sơ
          </Button>
        </Link>
      </div>

      {/* Bố cục lưới 2 Cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT CỦA BÉ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            
            {/* Khung Ảnh Đại Diện */}
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-gray-50 shadow-inner mb-4">
              <img src={pet.thumbnail || "https://placehold.co/150"} alt={pet.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Tên & Giới tính */}
            <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
              {pet.name} 
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {pet.gender?.toLowerCase() === 'male' ? '♂ Đực' : '♀ Cái'}
              </span>
            </h2>

            {/* Loài (Chó/Mèo) */}
            <p className="text-sm font-bold text-pet-blue mt-1 bg-pet-blue/5 inline-block px-3 py-1 rounded-xl">
              {pet.species?.name?.toUpperCase() === 'DOG' ? '🐶 Loài Chó' : pet.species?.name?.toUpperCase() === 'CAT' ? '🐱 Loài Mèo' : '🐾 Thú cưng'}
            </p>

            {/* Chỉ số lưới nhỏ Cân nặng & Tuổi */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-gray-50/70 p-3 rounded-2xl text-left">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <Scale size={14} /> <span className="text-xs font-bold">Cân nặng</span>
                </div>
                <p className="text-base font-black text-gray-800">{pet.weight_kg || 0} kg</p>
              </div>

              <div className="bg-gray-50/70 p-3 rounded-2xl text-left">
                <div className="text-gray-400 flex items-center gap-1 mb-1">
                  <Calendar size={14} /> <span className="text-xs font-bold">Tuổi đời</span>
                </div>
                <p className="text-base font-black text-gray-800">{pet.age} tuổi</p>
              </div>
            </div>

            {/* Chi tiết giống & Tính cách */}
            <div className="mt-6 pt-6 border-t border-gray-50 text-left space-y-3.5 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-gray-400">Giống loài:</span>
                <span className="text-gray-800 font-bold">{pet.breed || "Chưa rõ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Màu lông:</span>
                <span className="text-gray-800 font-bold">{pet.color || "Chưa rõ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tính cách:</span>
                <span className="text-gray-600 font-bold text-right max-w-[150px] truncate" title={pet.personality}>
                  {pet.personality || "Bình thường"}
                </span>
              </div>
            </div>
          </div>

          {/* Khối lưu ý dặn dò bệnh lý */}
          <div className="bg-orange-50/40 p-5 rounded-3xl border border-orange-100/60 text-left">
            <h3 className="font-black text-orange-800 text-sm uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Activity size={16} /> Lưu ý đặc biệt (Bệnh lý / Dị ứng)
            </h3>
            <div className="text-sm font-medium text-orange-700/90 space-y-2 leading-relaxed">
              <p><strong>Dị ứng:</strong> {pet.allergies || "Không có"}</p>
              <p><strong>Tiền sử bệnh:</strong> {pet.medical_note || "Không có ghi chú bệnh lý đặc biệt."}</p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ ĐẶT LỊCH SPA DÀNH CỦA BÉ */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left h-full min-h-[400px]">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <CalendarCheck className="text-pet-orange" size={22} /> Nhật ký dịch vụ Spa của bé ({bookings.length})
            </h3>

            {bookings.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                Bé chưa từng tham gia đặt dịch vụ Spa nào tại hệ thống.
                <div className="mt-4">
                  <Link to="/services">
                    <Button className="text-xs bg-pet-blue font-bold rounded-xl py-2 px-4">Đặt lịch ngay</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-2">
                {bookings.map((booking) => (
                  <BookingHistoryCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetDetail;