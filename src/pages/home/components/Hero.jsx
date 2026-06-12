import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';

const slides = [
  {
    url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1600",
    position: "object-right",
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1600",
    position: "object-center",
  },
  {
    url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=1600",
    position: "object-center",
  },
  {
    url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1600",
    position: "object-center",
  },
];

const INTERVAL_MS = 5000;

const Hero = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  // Tự động chuyển slide
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (index) => {
    if (index === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 400); // thời gian fade-out
  };

  return (
    // Bỏ rounded + max-width → phủ full width
    // Wrapper ngoài cùng cần negative margin để thoát khỏi padding của container cha
    <div className="relative w-full mb-12 overflow-hidden shadow-xl" style={{ minHeight: '480px' }}>

      {/* ── Ảnh nền tự đổi với fade ── */}
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.url}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            slide.position
          } ${i === current ? (fading ? 'opacity-0' : 'opacity-40') : 'opacity-0'} mix-blend-overlay`}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-pet-blue via-pet-blue/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-slate-900/60 z-0" />

      {/* ── Decor blob ── */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pet-orange/20 rounded-full blur-3xl -mr-24 -mb-24 pointer-events-none z-0" />

      {/* ── Nội dung ── */}
      <div className="relative z-10 flex items-center min-h-[480px] px-8 md:px-16 lg:px-24 py-28">
        <div className="max-w-2xl text-left text-white">
          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4 border border-white/10">
            Chào mừng tới PetSpa
          </span>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase leading-tight drop-shadow-sm">
            Chăm Sóc Thú Cưng <br />
            <span className="text-pet-orange drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.3)]">
              Toàn Diện
            </span>
          </h1>

          <p className="text-base md:text-lg mb-8 opacity-95 font-medium max-w-lg leading-relaxed text-slate-100 drop-shadow-sm">
            Hệ thống cung cấp sản phẩm chính hãng và dịch vụ Spa/Booking đặt lịch chuyên nghiệp dành riêng cho boss yêu của bạn.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/shop')}
              className="bg-pet-orange hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Mua Sắm Ngay
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/spa')}
              className="border-2 border-white text-white hover:bg-white hover:text-pet-blue font-bold px-6 py-3.5 rounded-xl transition-all backdrop-blur-sm active:scale-95"
            >
              Đặt Lịch Hẹn
            </Button>
          </div>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-pet-orange w-6 h-2'
                : 'bg-white/50 hover:bg-white/80 w-2 h-2'
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-pet-orange/60 z-20 transition-none"
           style={{
             width: `${((current + 1) / slides.length) * 100}%`,
             transition: `width ${INTERVAL_MS}ms linear`,
           }} />
    </div>
  );
};

export default Hero;