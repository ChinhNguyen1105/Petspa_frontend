import React, { useState, useEffect } from "react";
import {
  Image,
  Trash2,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  Link,
} from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import { useCategoryStore } from "../../store/categoryStore";
import { usePetServiceImageStore } from "../../store/petServiceImageStore";
import { useCartStore } from "../../store/cartStore";

const ServiceFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const isEdit = !!initialData;
console.log("initialData", initialData);

  // ─── STORES ──────────────────────────────────────────────────────────────────
  const { submitting } = useServiceStore();
  const { categories, fetchCategories } = useCategoryStore();

  const {
    images: serviceImages,
    loading: loadingImages,
    fetchImages,
    addImage, // Giữ nguyên hàm addImage nhận Url từ store của bạn
    deleteImage,
    setMainImage,
    clearImages,
  } = usePetServiceImageStore();

  const { showToast } = useCartStore();

  // ─── LOCAL STATE ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    durationMin: "30",
    categoryId: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // ─── EFFECT: FETCH METADATA CATEGORIES ───────────────────────────────────────
  useEffect(() => {
    if (fetchCategories) {
      fetchCategories({ type: "SERVICE" });
    }
  }, [fetchCategories]);

  // ─── EFFECT: ĐIỀN DỮ LIỆU BAN ĐẦU HOẶC RESET ─────────────────────────────────
  // ─── EFFECT: ĐIỀN DỮ LIỆU BAN ĐẦU HOẶC RESET ─────────────────────────────────
  useEffect(() => {
    if (initialData) {
      const serviceId = initialData.id;

      // Tìm ID danh mục an toàn từ dữ liệu ban đầu
      const rawCategoryId =
        initialData.categoryId || initialData.category?.id || "";

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        basePrice: initialData.basePrice ?? initialData.original_price ?? "",
        durationMin:
          initialData.durationMin ?? initialData.duration_minutes ?? "30",
        // SỬA TẠI ĐÂY: Ép kiểu sang String để đồng bộ hoàn toàn với value của thẻ <select>
        categoryId: rawCategoryId ? rawCategoryId.toString() : "",
      });

      if (serviceId) {
        fetchImages(serviceId);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        durationMin: "30",
        categoryId: "",
      });
      clearImages();
    }
    setErrorMsg("");
    setNewImageUrl("");
  }, [initialData, fetchImages, clearImages]);

  // ─── HANDLERS FORM DỮ LIỆU ──────────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleValidationAndSubmit = () => {
    setErrorMsg("");

    if (!formData.name.trim())
      return setErrorMsg("Tên dịch vụ không được để trống");
    if (!formData.description.trim())
      return setErrorMsg("Mô tả dịch vụ không được để trống");
    if (!formData.categoryId)
      return setErrorMsg("Vui lòng lựa chọn danh mục dịch vụ");
    if (formData.basePrice === "" || Number(formData.basePrice) <= 0)
      return setErrorMsg("Giá dịch vụ niêm yết phải lớn hơn 0đ");
    if (formData.durationMin === "" || Number(formData.durationMin) <= 0)
      return setErrorMsg("Thời lượng thực hiện phải lớn hơn 0 phút");

    const submitPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      basePrice: Number(formData.basePrice),
      durationMin: Number(formData.durationMin),
      categoryId: Number(formData.categoryId),
    };

    if (isEdit && initialData?.id) {
      submitPayload.id = Number(initialData.id);
    }

    // Đẩy payload sạch lên view cha tự điều phối xử lý API
    onSubmit(submitPayload);
  };

  // ─── HANDLERS QUẢN LÝ ẢNH BẰNG URL REAL-TIME ──────────────────────────────────
  const handleAddImageUrl = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    if (serviceImages.length >= 6) {
      showToast(
        "Hệ thống chỉ hỗ trợ tối đa 6 hình ảnh minh họa cho một dịch vụ.",
        "error",
      );
      return;
    }

    try {
      if (isEdit && initialData?.id) {
        const isFirstImg = serviceImages.length === 0;
        await addImage(initialData.id, newImageUrl.trim(), isFirstImg);
        setNewImageUrl("");
        showToast("Thêm hình ảnh vào album thành công! 📸", "success");
      } else {
        showToast(
          "Vui lòng tạo dịch vụ trước khi thêm ảnh vào album chi tiết.",
          "error",
        );
      }
    } catch (err) {
      showToast(
        "Không thể lưu liên kết hình ảnh này. Vui lòng kiểm tra lại.",
        "error",
      );
    }
  };

  const handleRemoveImage = async (imageId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa hình ảnh này khỏi album không?",
      )
    )
      return;
    try {
      await deleteImage(imageId);
      showToast("Đã xóa hình ảnh thành công!", "success");
    } catch (err) {
      showToast("Xóa ảnh dịch vụ thất bại!", "error");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage(imageId);
      showToast("Thay đổi ảnh hiển thị đại diện thành công! 🖼️", "success");
    } catch (err) {
      showToast("Thiết lập ảnh đại diện thất bại!", "error");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Khung loading bao phủ khi form đang submit */}
      {submitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <span className="text-sm font-medium text-gray-600">
            Hệ thống đang lưu dữ liệu dịch vụ...
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Layout chia 2 phần tương tự form Product: Thông tin và Album (nếu sửa) */}
      <div className="grid grid-cols-1 gap-6">
        {/* ── Khối 1: Thông tin dịch vụ cơ bản ── */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên dịch vụ spa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ví dụ: Combo Tắm Sấy & Vệ Sinh Tai"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục dịch vụ *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  handleInputChange("categoryId", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="">-- Chọn danh mục dịch vụ --</option>
                {categories &&
                  categories
                    .filter(
                      (cat) =>
                        cat.categoryType === "SERVICE" ||
                        cat.type === "SERVICE" ||
                        !cat.categoryType ||
                        cat.id?.toString() === formData.categoryId, // SỬA TẠI ĐÂY: Luôn giữ lại danh mục đang chọn khi sửa
                    )
                    .map((cat) => (
                      // Ép cat.id sang string ở value để đồng nhất dữ liệu
                      <option key={cat.id} value={cat.id?.toString()}>
                        {cat.name}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả dịch vụ chi tiết *
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết các bước trong quy trình phục vụ thú cưng..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá gốc niêm yết (đ) *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.basePrice}
                onChange={(e) => handleInputChange("basePrice", e.target.value)}
                placeholder="Nhập giá cơ bản..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng hoàn thành (Phút) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationMin}
                onChange={(e) =>
                  handleInputChange("durationMin", e.target.value)
                }
                placeholder="Ví dụ: 30, 45, 60..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* ── Khối 2: Album Ảnh bằng URL (Chỉ hiển thị khi EDIT) ── */}
        {isEdit && (
          <div className="space-y-4 border-t border-gray-100 pt-4 relative">
            {loadingImages && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-blue-500" />{" "}
                  Đang đồng bộ ảnh dịch vụ...
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <Image size={16} className="text-blue-500" />
              <span>Quản lý Album ảnh gói dịch vụ</span>
            </div>

            {/* Ô nhập liên kết ảnh URL */}
            <form onSubmit={handleAddImageUrl} className="flex gap-2">
              <div className="relative flex-grow">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Dán đường dẫn ảnh mạng URL vào đây... (Ví dụ: https://example.com/pet.png)"
                  className="w-full text-xs rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={!newImageUrl.trim() || serviceImages.length >= 6}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-40 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={14} /> Thêm ảnh
              </button>
            </form>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                Ảnh hiện có ({serviceImages.length}/6){" "}
                <span className="text-gray-400 font-normal ml-1">
                  • Click chọn ảnh để đặt làm ảnh đại diện chính (Thumbnail)
                </span>
              </p>

              {/* Grid danh sách ảnh URL */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {serviceImages.map((img) => {
                  const isMain = img.isThumbnail || img.isMain;
                  const currentImgUrl = img.imageUrl || img.url;
                  return (
                    <div
                      key={img.id}
                      className={`relative group aspect-square rounded-xl border overflow-hidden cursor-pointer transition-all ${
                        isMain
                          ? "border-blue-500 ring-2 ring-blue-400/30 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={currentImgUrl}
                        alt={`gallery-${img.id}`}
                        className="w-full h-full object-cover bg-gray-50"
                        onClick={() => handleSetMainImage(img.id)}
                        title="Click để thiết lập làm ảnh đại diện chính"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/300x300?text=L%E1%BB%97i+Link+%E1%BA%A2nh";
                        }}
                      />

                      {isMain && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow flex items-center gap-0.5">
                          <Check size={8} strokeWidth={4} /> Chính
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(img.id);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600"
                        title="Gỡ ảnh này"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Khối 3: Các nút bấm điều hướng Footer ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleValidationAndSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          {isEdit ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}
        </button>
      </div>
    </div>
  );
};

export default ServiceFormAdmin;
