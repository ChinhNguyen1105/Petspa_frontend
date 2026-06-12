import React from "react";
import { Star, User } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

const ReviewService = ({ reviews = [] }) => {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-black text-pet-blue mb-8">
        Đánh giá từ khách hàng
      </h3>
      <div className="grid gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 p-6 rounded-3xl border border-gray-100 transition-hover hover:bg-white hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pet-blue/10 rounded-full flex items-center justify-center text-pet-blue shrink-0 overflow-hidden">
                    {review.avatarUrl ? (
                      <img
                        src={review.avatarUrl}
                        alt={review.customerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{review.userName}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(review.createdDate)}
                    </p>
                  </div>
                </div>
                <div className="flex text-pet-orange gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">
            Chưa có đánh giá nào cho dịch vụ này.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewService;
