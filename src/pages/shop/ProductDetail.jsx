import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Minus, Plus, ImageIcon } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/ui/Badge';
import Loading from '../../components/common/Loading';
import { formatPrice } from '../../utils/formatPrice';

import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';
import { useProductImageStore } from '../../store/productImageStore';
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

  const {
    images: storeImages,
    loading: imagesLoading,
    fetchImages,
  } = useProductImageStore();

  // Fetch thông tin chi tiết sản phẩm
  useEffect(() => {
    if (id) fetchProductById(id);
    return () => clearCurrentProduct?.();
  }, [id, fetchProductById, clearCurrentProduct]);

  // Fetch danh sách hình ảnh từ store mới
  useEffect(() => {
    if (id) fetchImages(id);
  }, [id, fetchImages]);

  // Fetch reviews khi sản phẩm tải thành công
  useEffect(() => {
    if (product?.id) {
      getProductReviews(product.id);
    }
    return () => clearReviews?.(); 
  }, [product?.id, getProductReviews, clearReviews]);

  // Gom danh sách ảnh hiển thị
  const galleryImages = storeImages && storeImages.length > 0
    ? storeImages.map(img => img.imageUrl).filter(Boolean)
    : product?.images?.map(img => img.imageUrl).filter(Boolean) || [];

  // 🔥 SỬA LỖI TẠI ĐÂY: Đồng bộ ảnh hiển thị chính mặc định (Chỉ chạy khi có mảng ảnh mới từ API)
  useEffect(() => {
    if (galleryImages.length > 0) {
      // Ưu tiên tìm ảnh thumbnail từ storeImages trước
      const thumbnailImg = storeImages?.find(img => img.isThumbnail);
      const defaultImage = thumbnailImg?.imageUrl || galleryImages[0];
      setActiveImage(defaultImage);
    }
  }, [storeImages, product?.id]); // 🌟 Dùng product.id và storeImages thay vì dùng mảng galleryImages để tránh lặp vô hạn

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

  return (
    <div className="min-h-screen bg-white pt-10 pb-20 text-left">
      <div className="container mx-auto px-6 lg:px-24 xl:px-48">

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pet-blue font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* CỘT TRÁI: KHU VỰC HÌNH ẢNH */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner relative">
              {imagesLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
                  <ImageIcon size={32} />
                </div>
              ) : (
                <img
                  src={activeImage || 'https://placehold.co/500x500'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300 transform hover:scale-105"
                />
              )}
            </div>

            {/* Thanh trượt danh sách ảnh phụ */}
            {!imagesLoading && galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)} // 🌟 Giờ đây nút bấm đã ăn trạng thái mượt mà không lo bị ghi đè
                    className={`relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                      activeImage === imgUrl
                        ? 'border-orange-500 shadow-md scale-[0.95]'
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

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
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

            {/* Số lượng & Nút Thêm vào giỏ */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
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
                  type="button"
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

            {/* Tình trạng kho hàng */}
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

        {/* Khu vực đánh giá sản phẩm */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <ReviewProduct reviews={reviews} loading={reviewLoading} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;