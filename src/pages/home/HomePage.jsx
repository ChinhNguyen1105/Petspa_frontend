import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Hero from '../home/components/Hero';
import StatsSection from '../home/components/StatsSection';
import FacilitiesTeaser from './components/FacilitiesTeaser.jsx';
import Loading from '../../components/common/Loading';
import { Button } from '../../components/common/Button';

import ProductCard from '../../components/ui/ProductCard';
import ServiceCard from '../../components/ui/ServiceCard';

import ScrollReveal from '../home/components/Scrollreveal';

import { useProductStore } from '../../store/productStore';
import { useServiceStore } from '../../store/serviceStore';
import { useCart } from '../../hooks/useCart';

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('ALL');

  const {
    products: allProducts,
    loading: productLoading,
    fetchProducts,
  } = useProductStore();

  const {
    services: allServices,
    loading: serviceLoading,
    fetchServices,
  } = useServiceStore();

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, [fetchProducts, fetchServices]);

  console.log('products: ', allProducts);
  const popularServices = useMemo(
    () => (Array.isArray(allServices) ? allServices : []).slice(0, 4),
    [allServices]
  );

  const isGlobalLoading = productLoading || serviceLoading;

  const filteredProducts = useMemo(() => {
    return (Array.isArray(allProducts) ? allProducts : [])
      .filter((product) => {
        if (activeTab === 'ALL') return true;
        const currentCategoryId = product.category_id || product.categoryId;
        if (activeTab === 'FOOD') return currentCategoryId === 1;
        if (activeTab === 'TOY') return currentCategoryId === 2;
        if (activeTab === 'ACCESSORY') return currentCategoryId === 3;
        return true;
      })
      .slice(0, 4);
  }, [allProducts, activeTab]);

  if (isGlobalLoading && allProducts.length === 0 && allServices.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="homepage-container w-full mx-auto px-0 no-scrollbar">
      <Hero />
      <div className="px-20">

        {/* SECTION 2: Stats */}
        <ScrollReveal variant="zoom-in" duration={800} threshold={0.2}>
          <StatsSection />
        </ScrollReveal>

        {/* SECTION 3: Dịch vụ Spa */}
        <section className="mb-20">
          <ScrollReveal variant="fade-right" duration={700}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-2">
              <div>
                <span className="text-pet-orange font-bold text-xs uppercase tracking-widest block mb-1">
                  Dành Cho Thú Cưng Của Bạn
                </span>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                  Dịch Vụ Spa Chuyên Sâu
                </h2>
              </div>
              <Button
                variant="text"
                onClick={() => navigate('/spa')}
                className="text-pet-blue hover:text-pet-orange font-bold p-0 self-start md:self-auto"
              >
                Khám phá menu dịch vụ &rarr;
              </Button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <ScrollReveal
                key={service.id}
                variant="fade-up"
                delay={index * 100}
                duration={650}
                threshold={0.1}
              >
                <ServiceCard
                  service={service}
                  onBookingClick={() =>
                    navigate(`/spa/booking/create?serviceId=${service.id}`)
                  }
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION 4: Vaccination Teaser */}
        <ScrollReveal variant="flip-up" duration={900} threshold={0.2}>
          <FacilitiesTeaser />
        </ScrollReveal>

        {/* SECTION 5: Sản phẩm */}
        <section className="mb-20">
          <ScrollReveal variant="fade-down" duration={600}>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
              <div>
                <span className="text-pet-orange font-bold text-xs uppercase tracking-widest block mb-1">
                  Cửa hàng bách hóa Boss
                </span>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                  Sản Phẩm Được Yêu Thích
                </h2>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full">
                {['ALL', 'FOOD', 'TOY', 'ACCESSORY'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-pet-blue text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'ALL' && 'Tất Cả'}
                    {tab === 'FOOD' && 'Thức Ăn'}
                    {tab === 'TOY' && 'Đồ Chơi'}
                    {tab === 'ACCESSORY' && 'Phụ Kiện'}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  variant="fade-up"
                  delay={index * 75}
                  duration={600}
                  threshold={0.08}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => addToCart(product)}
                    onClick={() => navigate(`/shop/product/${product.id}`)}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal variant="fade-up">
              <div className="text-center py-12 text-slate-400 font-medium">
                Hiện chưa có sản phẩm nào thuộc danh mục này.
              </div>
            </ScrollReveal>
          )}
        </section>

      </div>
    </div>
  );
};

export default HomePage;