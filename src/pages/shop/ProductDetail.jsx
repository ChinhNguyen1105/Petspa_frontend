import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Minus, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/ui/Badge';
import Loading from '../../components/common/Loading';
import { formatPrice } from '../../utils/formatPrice';

import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import { useReviewStore } from '../../store/reviewStore';

import ReviewProduct from '../review/ReviewProduct';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  const { addItem, showToast } = useCartStore();

  const {
    currentProduct: product,
    detailLoading: productLoading,
    fetchProductById,
    clearCurrentProduct,
  } = useProductStore();

  const {
    reviews,
    loading: reviewLoading,
    getProductReviews,
    clearReviews,
  } = useReviewStore();

  // Fetch product detail
  useEffect(() => {
    if (id) fetchProductById(id);
    return () => clearCurrentProduct?.();
  }, [id, fetchProductById, clearCurrentProduct]);

  // Fetch reviews khi có product
  useEffect(() => {
    if (product?.id) {
      getProductReviews(product.id);
    }
    return () => clearReviews();
  }, [product?.id, getProductReviews, clearReviews]);

  // Sync ảnh thumbnail
  useEffect(() => {
    if (product?.images?.length > 0) {
      const thumbnail = product.images.find(img => img.isThumbnail) || product.images[0];
      setActiveImage(thumbnail.imageUrl);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stockQuantity <= 0 || product.status === 'OUT_OF_STOCK') {
      showToast?.('Sản phẩm này hiện đang tạm hết hàng!', 'error');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  if (productLoading) return <Loading fullScreen />;
  if (!product) return <div className="pt-32 text-center font-bold">Sản phẩm không tồn tại.</div>;

  const isOutOfStock = product.stockQuantity <= 0 || product.status === 'OUT_OF_STOCK';
  const galleryImages = product.images?.map(img => img.imageUrl).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white pt-10 pb-20 text-left">
      <div className="container mx-auto px-20 lg:px-60">

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pet-blue font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* CỘT TRÁI: GALLERY - Đồng bộ phong cách ServiceDetail */}
          <div className="flex flex-col gap-4">
            {/* Khung hiển thị ảnh lớn - Fill ảnh đầy thẻ, bo góc tròn trịa */}
            <div className="aspect-square w-full rounded-[32px] overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
              <img
                src={activeImage || galleryImages[0] || 'https://placehold.co/500x500'}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300 transform hover:scale-105"
              />
            </div>

            {/* Thanh trượt ảnh phụ - Fill đầy và bo góc mượt mà */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                      activeImage === imgUrl
                        ? 'border-pet-orange shadow-md scale-[0.95]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - ảnh ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary" className="w-fit">Mã SKU: {product.id}</Badge>
              {product.categoryName && (
                <Badge variant="secondary" className="w-fit bg-blue-50 text-pet-blue border-none">
                  {product.categoryName}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-black text-pet-blue mb-4 leading-tight">{product.name}</h1>
            <p className="text-3xl font-black text-pet-orange mb-6">{formatPrice(product.price)}</p>

            <p className="text-gray-600 mb-8 leading-relaxed font-medium">{product.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 font-bold select-none text-gray-800">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(prev =>
                      product.stockQuantity && prev >= product.stockQuantity ? prev : prev + 1
                    )
                  }
                  disabled={isOutOfStock}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 !py-3 !text-lg flex items-center justify-center gap-2 shadow-lg ${
                  isOutOfStock
                    ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'shadow-pet-blue/10'
                }`}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Hết hàng tạm thời' : 'Thêm vào giỏ'}
              </Button>
            </div>

            <div className={`flex items-center gap-3 font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
              <ShieldCheck size={20} />
              <span>
                {isOutOfStock
                  ? 'Sản phẩm hiện đã hết hàng'
                  : `Còn ${product.stockQuantity} sản phẩm trong kho`}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-0 pt-8 border-t border-gray-100">
          <ReviewProduct reviews={reviews} loading={reviewLoading} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;