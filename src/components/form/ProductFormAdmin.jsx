import React, { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang bán (Active)" },
  { value: "INACTIVE", label: "Tạm ngưng (Inactive)" },
  { value: "OUT_OF_STOCK", label: "Hết hàng" },
];

const ProductFormAdmin = ({ categories, initialData, onSubmit, onClose }) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percent: 0,
    final_price: 0,
    stock_quantity: 0,
    category: "",
    status: "ACTIVE",
    thumbnail: "https://placehold.co/300x300",
    images: [],
    rating: 0,
    review_count: 0,
  });

  const [galleryInput, setGalleryInput] = useState("");

  // Đổ dữ liệu cũ vào form khi Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        original_price: initialData.original_price || initialData.price || 0,
        discount_percent: initialData.discount_percent || 0,
        final_price: initialData.final_price || initialData.price || 0,
        stock_quantity: initialData.stock_quantity ?? 0,
        category:
          initialData.category?.code ||
          initialData.category?.id ||
          initialData.category ||
          "",
        status: initialData.status || "ACTIVE",
        thumbnail: initialData.thumbnail || "https://placehold.co/300x300",
        images: initialData.images || [],
        rating: initialData.rating || 0,
        review_count: initialData.review_count || 0,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        original_price: 0,
        discount_percent: 0,
        final_price: 0,
        stock_quantity: 0,
        category: "",
        status: "ACTIVE",
        thumbnail: "https://placehold.co/300x300",
        images: [],
        rating: 0,
        review_count: 0,
      });
    }
    setGalleryInput("");
  }, [initialData]);

  // Tính giá cuối tự động
  const handlePriceOrDiscountChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: Number(value) };
      const originalPrice =
        field === "original_price" ? Number(value) : updated.original_price;
      const discount =
        field === "discount_percent" ? Number(value) : updated.discount_percent;
      updated.final_price = originalPrice - (originalPrice * discount) / 100;
      updated.price = updated.final_price;
      return updated;
    });
  };

  const addGalleryImage = (url) => {
    const trimmed = url.trim();
    if (!trimmed || formData.images.length >= 6) return;
    setFormData((p) => ({ ...p, images: [...p.images, trimmed] }));
    setGalleryInput("");
  };

  const removeGalleryImage = (index) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // 1. Validate Tên dịch vụ
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên dịch vụ");
      return;
    }

    // 2. Validate Danh mục
    if (!formData.category.id) {
      alert("Vui lòng lựa chọn Danh mục dịch vụ");
      return;
    }

    // 3. Validate Thời lượng
    if (!formData.duration_minutes || formData.duration_minutes < 5) {
      alert("Thời lượng dịch vụ phải từ 5 phút trở lên");
      return;
    }

    // 4. Validate Giá gốc
    if (formData.original_price === "" || formData.original_price < 0) {
      alert("Giá gốc không được để trống và phải lớn hơn hoặc bằng 0");
      return;
    }

    // 5. Validate Giảm giá (nếu có nhập)
    if (formData.discount_percent < 0 || formData.discount_percent > 100) {
      alert("Phần trăm giảm giá phải từ 0 đến 100");
      return;
    }

    // 6. Validate Loài thú cưng phù hợp (Tùy chọn - nếu bạn bắt buộc phải chọn)
    if (formData.suitable_for.length === 0) {
      alert("Vui lòng chọn ít nhất một loài thú cưng phù hợp");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">

      {/* ── Group 1: Tên & Danh mục ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ví dụ: Hạt Royal Canin Poodle 1kg"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Group 2: Mô tả ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sản phẩm
        </label>
        <textarea
          rows="3"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Nhập mô tả chi tiết về sản phẩm..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* ── Group 3: Giá ── */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá gốc (đ) *
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.original_price}
            onChange={(e) =>
              handlePriceOrDiscountChange("original_price", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none bg-white font-semibold text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giảm giá (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.discount_percent}
            onChange={(e) =>
              handlePriceOrDiscountChange("discount_percent", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700 font-semibold mb-1">
            Giá bán cuối (đ)
          </label>
          <input
            type="text"
            disabled
            value={
              formData.final_price
                ? formData.final_price.toLocaleString("vi-VN")
                : "0"
            }
            className="w-full rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-sm font-bold text-blue-700 cursor-not-allowed"
          />
        </div>
      </div>

      {/* ── Group 4: Tồn kho & Trạng thái ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng tồn kho *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) =>
              setFormData((p) => ({ ...p, stock_quantity: Number(e.target.value) }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái hiển thị
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Group 5: Ảnh sản phẩm ── */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-800">
          Ảnh sản phẩm
        </label>

        {/* Thumbnail */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Ảnh đại diện (Thumbnail)</p>
          <div className="flex items-start gap-4">
            <img
              src={formData.thumbnail}
              alt="thumbnail"
              className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shrink-0 bg-gray-50"
              onError={(e) => { e.target.src = "https://placehold.co/300x300"; }}
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={formData.thumbnail}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, thumbnail: e.target.value }))
                }
                placeholder="Dán URL ảnh thumbnail..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-gray-400">
                Khuyến nghị: ảnh vuông 300×300px, dưới 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Bộ ảnh minh hoạ ({formData.images.length}/6)
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`img-${idx}`}
                  className="w-full h-full rounded-xl object-cover border border-gray-200 bg-gray-50"
                  onError={(e) => { e.target.src = "https://placehold.co/300x300"; }}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  ×
                </button>
              </div>
            ))}
            {formData.images.length < 6 && (
              <div
                onClick={() => {
                  const url = window.prompt("Nhập URL ảnh:");
                  if (url?.trim()) {
                    setFormData((p) => ({
                      ...p,
                      images: [...p.images, url.trim()],
                    }));
                  }
                }}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-gray-400 hover:text-blue-500"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-[10px] mt-1">Thêm ảnh</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="Hoặc dán URL ảnh rồi nhấn Thêm..."
              className="flex-1 rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGalleryImage(galleryInput);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addGalleryImage(galleryInput)}
              disabled={formData.images.length >= 6}
              className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>

      {/* ── Group 6: Thống kê (chỉ Edit mode) ── */}
      {isEdit && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            ⭐ Thống kê & Đánh giá
            <span className="text-[11px] font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border">
              Dữ liệu tự động từ hệ thống
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-amber-100 space-y-1">
              <div className="text-2xl font-black text-amber-500">
                {formData.rating?.toFixed(1) ?? "—"}
              </div>
              <div className="text-xs text-gray-500">Điểm đánh giá TB</div>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= Math.round(formData.rating)
                        ? "text-amber-400"
                        : "text-gray-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 text-center border border-amber-100 space-y-1">
              <div className="text-2xl font-black text-blue-500">
                {formData.review_count?.toLocaleString() ?? 0}
              </div>
              <div className="text-xs text-gray-500">Lượt đánh giá</div>
              <div className="text-lg">💬</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              window.open(`/admin/reviews?product_id=${initialData?.id}`, "_blank")
            }
            className="w-full py-2 rounded-xl border border-amber-200 text-sm font-semibold text-amber-700 bg-white hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>📝</span> Xem tất cả đánh giá của sản phẩm này
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
      </div>
    </div>
  );
};

export default ProductFormAdmin;