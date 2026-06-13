import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { Image, Trash2, Check, Plus, AlertCircle, Loader2 } from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import { useCategoryStore } from "../../store/categoryStore";
import { usePetServiceImageStore } from "../../store/petServiceImageStore"; // 🌟 Import store ảnh

const ServiceFormAdmin = ({ isOpen, onClose, onSave, serviceData = null }) => {
  const isEdit = !!serviceData;

  // ─── STORES ──────────────────────────────────────────────────────────────────
  const { createService, updateService, submitting } = useServiceStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  // Các hàm tương tác ảnh từ Zustand Store của bạn
  const { 
    images, 
    loading: loadingImages, 
    fetchImages, 
    addImage, 
    deleteImage, 
    setMainImage,
    clearImages
  } = usePetServiceImageStore();

  // ─── LOCAL STATE ─────────────────────────────────────────────────────────────
  const emptyForm = {
    name: "",
    description: "",
    basePrice: 0,
    durationMin: 30,
    categoryId: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");
  const [newImageUrl, setNewImageUrl] = useState(""); // Lưu URL ảnh chuẩn bị thêm

  // ─── EFFECT: FETCH METADATA & IMAGES ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    fetchCategories({ type: "SERVICE" });
    
    // Nếu là chế độ chỉnh sửa, tiến hành fetch ảnh của dịch vụ này
    if (serviceData?.id) {
      fetchImages(serviceData.id);
    } else {
      clearImages(); // Thêm mới thì dọn sạch mảng ảnh cũ trong store
    }
  }, [isOpen, serviceData, fetchCategories, fetchImages, clearImages]);

  // ─── EFFECT: ĐIỀN / RESET FORM ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");
    setNewImageUrl("");

    if (serviceData) {
      setFormData({
        name: serviceData.name || "",
        description: serviceData.description || "",
        basePrice: serviceData.basePrice || serviceData.original_price || 0,
        durationMin: serviceData.durationMin || serviceData.duration_minutes || 30,
        categoryId: serviceData.categoryId || serviceData.category?.id || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, serviceData]);

  // ─── HANDLERS FORM TINH GỌN ─────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!formData.name.trim()) return setErrorMsg("Vui lòng điền tên dịch vụ");
    if (!formData.description.trim()) return setErrorMsg("Vui lòng điền mô tả dịch vụ");
    if (!formData.categoryId) return setErrorMsg("Vui lòng lựa chọn Danh mục dịch vụ");
    if (Number(formData.basePrice) <= 0) return setErrorMsg("Giá gốc niêm yết phải lớn hơn 0đ");
    if (Number(formData.durationMin) <= 0) return setErrorMsg("Thời lượng dịch vụ phải lớn hơn 0 phút");

    try {
      const payload = {
        id: isEdit ? serviceData.id : null,
        name: formData.name.trim(),
        description: formData.description.trim(),
        basePrice: Number(formData.basePrice),
        durationMin: Number(formData.durationMin),
        categoryId: Number(formData.categoryId),
      };

      const res = isEdit
        ? await updateService(serviceData.id, payload)
        : await createService(payload);
console.log("Response:", res);
      if (res?.success) {
        onSave(res.data);
        onClose();
      } else {
        setErrorMsg(res?.message || "Đã có lỗi xảy ra từ máy chủ khi lưu dữ liệu.");
      }
    } catch (err) {
      console.error("Submit Error: ", err);
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.");
    }
  };

  // ─── HANDLERS ẢNH REAL-TIME ──────────────────────────────────────────────────
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    try {
      // Mặc định nếu chưa có ảnh nào thì đặt ảnh đầu tiên này làm Thumbnail luôn
      const isFirstImg = images.length === 0;
      await addImage(serviceData.id, newImageUrl.trim(), isFirstImg);
      setNewImageUrl(""); // Thêm xong xóa trống thanh input url
    } catch (err) {
      alert("Không thể thêm ảnh. Vui lòng kiểm tra link ảnh hợp lệ.");
    }
  };

  const handleDeleteImage = async (imgId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này không?")) {
      try {
        await deleteImage(imgId);
      } catch (err) {
        alert("Xóa ảnh thất bại!");
      }
    }
  };

  const handleSetThumbnail = async (imgId) => {
    try {
      await setMainImage(imgId);
    } catch (err) {
      alert("Thiết lập ảnh đại diện thất bại!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "✏️ Cập Nhật Dịch Vụ Spa & Ảnh" : "✨ Thêm Mới Dịch Vụ Spa"}
      size="xl" // Mở rộng size xl để chứa vừa vặn giao diện 2 cột thông minh
    >
      {/* Giao diện lưới 2 cột chia đôi không gian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-1">
        
        {/* CỘT TRÁI (7 cột): Form nhập liệu 5 trường chính */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">
            📝 Thông tin dịch vụ cơ bản
          </h4>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Tên dịch vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ví dụ: Combo Cắt Tỉa Tạo Kiểu"
            />
          </div>

          {/* Mô tả dịch vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả dịch vụ *</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nhập giới thiệu chi tiết về hiệu quả gói dịch vụ..."
            />
          </div>

          {/* Danh mục dịch vụ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục dịch vụ *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 bg-white"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Giá và Thời lượng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc niêm yết (đ) *</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={formData.basePrice}
                onChange={(e) => handleChange("basePrice", e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none font-semibold text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (Phút) *</label>
              <input
                type="number"
                min="5"
                value={formData.durationMin}
                onChange={(e) => handleChange("durationMin", e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (5 cột): Quản lý kho ảnh album dịch vụ */}
        <div className="lg:col-span-5 bg-gray-50/70 rounded-2xl p-4 border border-gray-100 flex flex-col min-h-[350px]">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-200 mb-3 flex items-center gap-1.5">
            <Image size={16} className="text-blue-500" /> Album Hình Ảnh ({images.length})
          </h4>

          {!isEdit ? (
            // Nếu thêm mới chưa có ID dịch vụ thì khóa tính năng ảnh lại
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border border-dashed border-gray-200 my-auto">
              <Image size={32} className="text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-500">Chưa thể quản lý ảnh</p>
              <p className="text-[11px] text-gray-400 max-w-[200px] mt-0.5">
                Vui lòng tạo mới thông tin dịch vụ trước, sau đó bấm nút Sửa để quản lý ảnh album sau.
              </p>
            </div>
          ) : (
            // Nếu sửa, kích hoạt module ảnh hoàn chỉnh
            <div className="flex flex-col flex-grow space-y-3">
              
              {/* Form Input URL ảnh nhanh */}
              <form onSubmit={handleAddImage} className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="Dán link ảnh URL vào đây..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-grow text-xs rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!newImageUrl.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </form>

              {/* Danh sách cuộn hiển thị lưới ảnh đang có */}
              <div className="flex-grow overflow-y-auto max-h-[280px] pr-1 space-y-2 custom-scrollbar">
                {loadingImages ? (
                  <div className="h-40 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                    <Loader2 className="animate-spin text-blue-500" size={16} />
                    Đang tải danh sách ảnh...
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400 font-medium bg-white rounded-xl border border-gray-100">
                    Chưa có hình ảnh nào cho gói dịch vụ này.
                  </div>
                ) : (
                  images.map((img) => (
                    <div 
                      key={img.id} 
                      className={`flex items-center gap-3 p-2 bg-white rounded-xl border transition-all ${
                        img.isThumbnail ? "border-blue-500 ring-1 ring-blue-100" : "border-gray-200"
                      }`}
                    >
                      {/* Ảnh nhỏ xem trước (Preview) */}
                      <img 
                        src={img.imageUrl} 
                        alt="Service asset" 
                        className="w-12 h-12 object-cover rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0" 
                      />

                      {/* URL ẩn bớt */}
                      <span className="text-[11px] text-gray-400 font-mono truncate flex-grow">
                        {img.imageUrl}
                      </span>

                      {/* Các nút hành động trên ảnh */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Nút đặt ảnh chính */}
                        <button
                          type="button"
                          onClick={() => handleSetThumbnail(img.id)}
                          title={img.isThumbnail ? "Ảnh đại diện hiện tại" : "Đặt làm ảnh đại diện"}
                          className={`p-1.5 rounded-md border transition-all ${
                            img.isThumbnail 
                              ? "bg-blue-50 border-blue-200 text-blue-600 font-bold" 
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-500"
                          }`}
                        >
                          <Check size={14} className={img.isThumbnail ? "stroke-[3px]" : ""} />
                        </button>
                        
                        {/* Nút xóa ảnh */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          title="Xóa hình ảnh này"
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-md transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS MODAL */}
      <div className="flex items-center justify-end space-x-3 pt-4 mt-6 border-t border-gray-100 sticky bottom-0 bg-white z-10">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 text-white" />
              <span>Đang lưu dữ liệu...</span>
            </>
          ) : isEdit ? (
            "Lưu thay đổi"
          ) : (
            "Tạo dịch vụ"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ServiceFormAdmin;