import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PawPrint, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Send,
  Clock
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* --- CỘT 1: GIỚI THIỆU --- */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-pet-blue p-2 rounded-xl group-hover:bg-pet-orange transition-colors">
                <PawPrint className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                PET<span className="text-pet-orange">SPA</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Hệ thống chăm sóc thú cưng hàng đầu Việt Nam. Chúng tôi cam kết mang lại trải nghiệm 5 sao cho "người bạn bốn chân" của bạn.
            </p>
            <div className="flex items-center gap-4">
              <SocialIcon icon={<Facebook size={20} />} href="#" />
              <SocialIcon icon={<Instagram size={20} />} href="#" />
              <SocialIcon icon={<Youtube size={20} />} href="#" />
            </div>
          </div>

          {/* --- CỘT 2: DỊCH VỤ & CỬA HÀNG --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-pet-orange pl-3">Khám Phá</h4>
            <ul className="space-y-4">
              <FooterLink to="/spa" label="Dịch vụ Spa & Grooming" />
              <FooterLink to="/shop" label="Cửa hàng phụ kiện" />
              <FooterLink to="/shop" label="Thức ăn dinh dưỡng" />
              <FooterLink to="/pet" label="Quản lý thú cưng" />
              <FooterLink to="/auth/register" label="Đăng ký thành viên" />
            </ul>
          </div>

          {/* --- CỘT 3: LIÊN HỆ --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-pet-blue pl-3">Liên Hệ</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-pet-blue shrink-0" size={20} />
                <span>123 Đường Thú Cưng, Quận Hoàn Kiếm, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-pet-blue shrink-0" size={20} />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-pet-blue shrink-0" size={20} />
                <span>contact@petspa.vn</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="text-pet-blue shrink-0" size={20} />
                <span>08:00 - 21:00 (Tất cả các ngày)</span>
              </li>
            </ul>
          </div>

          {/* --- CỘT 4: ĐĂNG KÝ BẢN TIN --- */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-l-4 border-pet-pink pl-3">Bản Tin</h4>
            <p className="text-gray-400 text-sm mb-6">
              Để lại email để nhận các ưu đãi hấp dẫn và kiến thức chăm sóc thú cưng hàng tuần.
            </p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-pet-blue transition-colors"
              />
              <button className="absolute right-2 top-2 bg-pet-blue hover:bg-pet-orange p-1.5 rounded-lg transition-colors">
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>

        {/* --- DÒNG BẢN QUYỀN --- */}
        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <p>© {currentYear} PetSpa. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Sub-components dùng nội bộ ---

const FooterLink = ({ to, label }) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-400 hover:text-pet-blue hover:translate-x-2 transition-all flex items-center gap-2 group"
    >
      <span className="w-1.5 h-1.5 bg-gray-700 rounded-full group-hover:bg-pet-orange transition-colors"></span>
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    className="w-10 h-10 bg-[#2A2A2A] rounded-xl flex items-center justify-center text-gray-400 hover:bg-pet-blue hover:text-white hover:-translate-y-1 transition-all"
  >
    {icon}
  </a>
);

export default Footer;