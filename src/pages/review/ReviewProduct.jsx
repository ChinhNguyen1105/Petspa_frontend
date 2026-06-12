import React from "react";
import { Star, User } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

const ReviewProduct = ({ reviews = [] }) => {
  return (
    <div className="mt-12 max-w-2xl ml-0 pl-0 w-full">
      <h3 className="text-2xl font-black text-pet-blue mb-8">
        Đánh giá từ khách hàng
      </h3>

      <div className="flex flex-col gap-5">
        {reviews.length > 0 ? (
          reviews.map((review, index) => {
            const customerName =
              review.userName ||
              review.customer?.full_name ||
              "Khách hàng PetSpa";
            const reviewDate = review.createdDate || review.created_at;
            const starRating = review.star ?? review.rating ?? 5;
            const avatar = review.avatarUrl;

            return (
              <div
                key={review.id || review._id || index}
                className="bg-gray-50 p-5 rounded-2xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-pet-blue/10 rounded-full flex items-center justify-center text-pet-blue shrink-0 overflow-hidden">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={customerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {customerName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {reviewDate ? formatDate(reviewDate) : "Gần đây"}
                      </p>
                    </div>
                  </div>

                  <div className="flex text-pet-orange gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < starRating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed italic pl-12">
                  "{review.comment || "Sản phẩm rất tốt, dịch vụ chu đáo!"}"
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm italic bg-gray-50 p-6 rounded-2xl text-center border border-dashed">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewProduct;
