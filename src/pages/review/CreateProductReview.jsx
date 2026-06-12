import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';

// TÍCH HỢP ZUSTAND STORES
import { useOrderStore } from '../../store/orderStore';
import { useReviewStore } from '../../store/reviewStore';

const CreateOrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // ĐƠN HÀNG: Lấy dữ liệu chi tiết đơn hàng từ useOrderStore
  const { 
    currentOrder: order, 
    loading: orderLoading, 
    fetchOrderById
  } = useOrderStore();

  // ĐÁNH GIÁ: Lấy trạng thái từ reviewStore
  const { 
    loading: reviewSubmitting, 
    createReview 
  } = useReviewStore();
  
  // Local Form States: Quản lý rating và comment độc lập cho từng productId bằng Object
  const [ratings, setRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState('');

  // Khởi tạo giá trị mặc định (5 sao, nội dung trống) cho từng sản phẩm khi order load xong
  useEffect(() => {
    if (order && order.orderDetails) {
      const initialRatings = {};
      const initialComments = {};
      order.orderDetails.forEach(item => {
        initialRatings[item.productId] = 5;
        initialComments[item.productId] = '';
      });
      setRatings(initialRatings);
      setComments(initialComments);
    }
  }, [order]);

  // Fetch chi tiết đơn hàng khi mount
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  if (orderLoading) return <Loading fullScreen />;

  if (!order) {
    return <div className="pt-32 text-center text-gray-500 font-medium">Không tìm thấy thông tin đơn hàng cần đánh giá.</div>;
  }

  const itemsList = order.orderDetails || [];

  // ─── XỬ LÝ UPDATE LOCAL STATE CHO TỪNG ITEM ─────────────────────────────────
  const handleRatingChange = (productId, value) => {
    setRatings(prev => ({ ...prev, [productId]: value }));
  };

  const handleHoverRatingChange = (productId, value) => {
    setHoverRatings(prev => ({ ...prev, [productId]: value }));
  };

  const handleCommentChange = (productId, value) => {
    setComments(prev => ({ ...prev, [productId]: value }));
  };

  // ─── XỬ LÝ GỬI ĐÁNH GIÁ TẤT CẢ CÁC SẢN PHẨM ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate: Đảm bảo toàn bộ sản phẩm đều được điền nhận xét đầy đủ
    let hasValidationError = false;
    itemsList.forEach(item => {
      const comment = comments[item.productId] || '';
      if (!comment.trim()) {
        hasValidationError = true;
      }
    });

    if (hasValidationError) {
      return setError('Vui lòng nhập đầy đủ nhận xét cho tất cả các sản phẩm.');
    }

    try {
      // Sử dụng Promise.all để đẩy đồng thời toàn bộ đánh giá của từng item lên API
      const reviewPromises = itemsList.map(item => {
        return createReview({
          orderId: Number(orderId),
          productId: item.productId, // Định danh đánh giá cho item cụ thể này
          rating: ratings[item.productId] || 5,
          comment: comments[item.productId].trim()
        });
      });

      await Promise.all(reviewPromises);
      
      alert("Cảm ơn bạn đã gửi đánh giá cho các sản phẩm!");
      navigate('/profile', { state: { activeTab: "orders" } });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình gửi đánh giá. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Nút Quay Lại */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-pet-blue font-bold mb-6 transition-colors cursor-pointer border-none bg-transparent outline-none"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black text-pet-blue mb-2">Đánh Giá Sản Phẩm</h2>
          <p className="text-gray-500 font-semibold mb-6">Mã đơn: #{order.id}</p>

          {error && (
            <p className="text-red-500 text-sm mb-6 font-semibold bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* DANH SÁCH FORM ĐÁNH GIÁ TỪNG ITEM */}
            <div className="space-y-8 divide-y divide-dashed divide-gray-200">
              {itemsList.map((item, index) => {
                const pId = item.productId;
                const currentItemRating = ratings[pId] || 5;
                const currentItemHover = hoverRatings[pId] || 0;
                const currentItemComment = comments[pId] || '';

                return (
                  <div key={item.id || index} className={`space-y-4 ${index > 0 ? 'pt-8' : ''}`}>
                    {/* Header thông tin item nhỏ */}
                    <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <img 
                        src={item.productImage || 'https://placehold.co/300x300'} 
                        alt={item.productName} 
                        className="w-12 h-12 rounded-xl object-contain bg-white border p-1 flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 truncate">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">Số lượng: x{item.quantity || 1}</p>
                      </div>
                    </div>

                    {/* Chọn số sao độc lập cho item */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Đánh giá sản phẩm này *
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="text-xl outline-none transition-transform active:scale-95 cursor-pointer bg-transparent border-none p-0"
                            onClick={() => handleRatingChange(pId, star)}
                            onMouseEnter={() => handleHoverRatingChange(pId, star)}
                            onMouseLeave={() => handleHoverRatingChange(pId, 0)}
                          >
                            <Star
                              size={26}
                              className={(currentItemHover || currentItemRating) >= star ? "text-pet-orange" : "text-gray-200"}
                              fill={(currentItemHover || currentItemRating) >= star ? "currentColor" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ô nhập text độc lập cho item */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Nhận xét chi tiết *
                      </label>
                      <textarea
                        rows="3"
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none italic text-sm transition-all text-gray-700 bg-white"
                        placeholder={`Chia sẻ trải nghiệm của bạn về sản phẩm ${item.productName}...`}
                        value={currentItemComment}
                        onChange={(e) => handleCommentChange(pId, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NÚT GỬI ĐÁNH GIÁ TỔNG */}
            <Button 
              type="submit" 
              disabled={reviewSubmitting || itemsList.length === 0} 
              className="w-full !py-3.5 font-bold rounded-2xl text-lg flex items-center justify-center gap-2 mt-6"
            >
              {reviewSubmitting ? 'Đang gửi các đánh giá...' : 'Gửi tất cả đánh giá'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderReview;