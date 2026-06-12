import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import CoreValues from './components/CoreValues';
import TeamSection from './components/TeamSection';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-us-container max-w-7xl mx-auto px-4 py-12">
      
      {/* SECTION 1: Khối Tiêu Đề Ấn Tượng (Hero Story) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="text-left space-y-6">
          <span className="bg-pet-blue/10 text-pet-blue text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
            Câu chuyện thương hiệu 🐾
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight">
            Nơi Trao Gửi <br />
            <span className="text-pet-orange">Trọn Vẹn Yêu Thương</span>
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed">
            Được thành lập từ niềm đam mê lớn lao với thế giới thú cưng, chúng tôi tự hào xây dựng một hệ sinh thái chăm sóc toàn diện chuẩn hóa cao từ dịch vụ Spa dưỡng sinh đến chuỗi cung ứng sản phẩm thiết yếu chính hãng.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Tại đây, mỗi chú cún, chú mèo không đơn thuần là thú nuôi, các bé là những thành viên gia đình xứng đáng nhận được sự tôn trọng và những điều tuyệt vời nhất.
          </p>
          <div className="pt-2 flex gap-4">
            <Button 
              variant="primary" 
              onClick={() => navigate('/spa')}
              className="bg-pet-blue hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Đặt Dịch Vụ Ngay
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/shop')}
              className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-all"
            >
              Ghé Cửa Hàng
            </Button>
          </div>
        </div>

        {/* Khối hình ảnh Collage đan xen tạo sự độc bản nghệ thuật */}
        <div className="relative flex justify-center items-center">
          <div className="w-4/5 aspect-[4/3] rounded-3xl overflow-hidden shadow-md bg-slate-100 z-10 border-4 border-white transform -rotate-2">
            <img 
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600" 
              alt="Pet care time" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-4 w-1/2 aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white z-20 transform rotate-6 bg-slate-200 hidden sm:block">
            <img 
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300" 
              alt="Cute dog" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-pet-orange/10 rounded-full blur-2xl -mt-6 -mr-6"></div>
        </div>
      </div>

      {/* SECTION 2: Triết lý & Giá trị cốt lõi */}
      <CoreValues />

      {/* SECTION 3: Đội ngũ chuyên gia (Kéo dài trang, lấy từ API qua UserService) */}
      <TeamSection />

    </div>
  );
};

export default AboutUs;