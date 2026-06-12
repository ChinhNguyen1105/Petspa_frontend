import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";

import { useServiceStore } from "../../store/serviceStore";
import { usePetStore } from "../../store/petStore";
import { useCategoryStore } from "../../store/categoryStore";

const ServiceFormAdmin = ({ isOpen, onClose, onSave, serviceData = null }) => {
  const isEdit = !!serviceData;

  // ─── STORES ──────────────────────────────────────────────────────────────────
  const {
    createService,
    updateService,
    submitting,
  } = useServiceStore();

  const { 
    categories, 
    fetchCategories 
  } = useCategoryStore();

  const { species: availableSpecies, fetchSpecies } = usePetStore();

  // ─── LOCAL STATE ─────────────────────────────────────────────────────────────
  const emptyForm = {
    name:              "",
    slug:              "",
    description:       "",
    duration_minutes:  30,
    price:             0,
    original_price:    0,
    discount_percent:  0,
    final_price:       0,
    category:          { id: "", name: "" },
    suitable_for:      [],
    included_services: [],
    notes:             [],
    is_featured:       false,
    status:            "ACTIVE",
    thumbnail:         "https://placehold.co/500x500",
    images:            [], 
    average_rating:    0,
    review_count:      0,
    booking_count:     0,
  };

  const [formData,      setFormData]      = useState(emptyForm);
  const [inputIncluded, setInputIncluded] = useState("");
  const [inputNote,    setInputNote]    = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [errorMsg,     setErrorMsg]     = useState("");

  // ─── FETCH METADATA KHI MỞ FORM ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    
    fetchCategories({ type: "SERVICE" });
    fetchSpecies();
  }, [isOpen, fetchCategories, fetchSpecies]);

  // ─── ĐIỀN / RESET FORM ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg("");

    if (serviceData) {
      setFormData({
        ...serviceData,
        price:             serviceData.price             || 0,
        original_price:    serviceData.original_price    || 0,
        discount_percent:  serviceData.discount_percent  || 0,
        final_price:       serviceData.final_price       || serviceData.price || 0,
        category:          serviceData.category          || { id: "", name: "" },
        suitable_for:      serviceData.suitable_for      || [],
        included_services: serviceData.included_services || [],
        notes:             serviceData.notes             || [],
        thumbnail:         serviceData.thumbnail         || "https://placehold.co/500x500",
        images:            Array.isArray(serviceData.images) && serviceData.images.length > 0 ? serviceData.images : [],
        average_rating:    serviceData.average_rating    || 0,
        review_count:      serviceData.review_count      || 0,
        booking_count:     serviceData.booking_count     || 0,
      });
    } else {
      setFormData(emptyForm);
    }

    setGalleryInput("");
    setInputIncluded("");
    setInputNote("");
  }, [isOpen, serviceData]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    
    let slugValue = nameValue.toLowerCase();
    slugValue = slugValue.replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, "a");
    slugValue = slugValue.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, "e");
    slugValue = slugValue.replace(/í|ì|ỉ|ĩ|ị/g, "i");
    slugValue = slugValue.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, "o");
    slugValue = slugValue.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, "u");
    slugValue = slugValue.replace(/ý|ỳ|ỷ|ỹ|ỵ/g, "y");
    slugValue = slugValue.replace(/đ/g, "d");
    slugValue = slugValue.replace(/[^a-z0-9-\s]/g, ""); 
    slugValue = slugValue.replace(/([\s]+)/g, "-");    
    slugValue = slugValue.replace(/-+/g, "-");          
    slugValue = slugValue.replace(/^-+|-+$/g, "");      

    setFormData(prev => ({ ...prev, name: nameValue, slug: slugValue }));
  };

  const handlePriceOrDiscountChange = (field, value) => {
    if (value === "") {
      setFormData(prev => ({ ...prev, [field]: "" }));
      return;
    }

    const numValue = Number(value);
    setFormData(prev => {
      const updated       = { ...prev, [field]: numValue };
      const originalPrice = field === "original_price"   ? numValue : Number(updated.original_price || 0);
      const discount      = field === "discount_percent" ? numValue : Number(updated.discount_percent || 0);
      
      const finalPrice    = Math.max(0, originalPrice - (originalPrice * discount) / 100);
      return { ...updated, final_price: finalPrice, price: finalPrice };
    });
  };

  const handleSpeciesCheck = (speciesName) => {
    setFormData(prev => {
      const updated = prev.suitable_for.includes(speciesName)
        ? prev.suitable_for.filter(item => item !== speciesName)
        : [...prev.suitable_for, speciesName];
      return { ...prev, suitable_for: updated };
    });
  };

  const addArrayItem = (field, value, setInput) => {
    if (!value.trim()) return;
    if (formData[field].includes(value.trim())) {
      alert("Nội dung này đã tồn tại trong danh sách!");
      return;
    }
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setInput("");
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addGalleryImage = (url) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    if (formData.images.length >= 6) {
      alert("Hệ thống giới hạn tối đa 6 ảnh minh họa!");
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, trimmed] }));
    setGalleryInput("");
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Vui lòng điền tên dịch vụ");
      return;
    }
    if (!formData.category.id) {
      setErrorMsg("Vui lòng lựa chọn Danh mục dịch vụ");
      return;
    }
    if (!formData.original_price || Number(formData.original_price) <= 0) {
      setErrorMsg("Giá gốc niêm yết phải lớn hơn 0đ");
      return;
    }

    try {
      const payload = {
        ...formData,
        original_price: Number(formData.original_price),
        discount_percent: Number(formData.discount_percent || 0)
      };

      const res = isEdit
        ? await updateService(serviceData.id, payload)
        : await createService(payload);

      if (res?.success) {
        onSave(res.data);
        onClose();
      } else {
        setErrorMsg(res?.message || "Đã có lỗi xảy ra từ phía máy chủ khi lưu dữ liệu.");
      }
    } catch (err) {
      console.error("Submit Error: ", err);
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "✏️ Cập Nhật Dịch Vụ Spa" : "✨ Thêm Mới Dịch Vụ Spa"}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1 no-scrollbar">
        
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* ── 1. Tên & Slug ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Ví dụ: Combo Tắm Sấy Khử Mùi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug hệ thống (Auto)</label>
            <input
              type="text"
              disabled
              value={formData.slug}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* ── 2. Mô tả ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tóm tắt dịch vụ</label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Nhập giới thiệu chi tiết về hiệu quả gói dịch vụ..."
          />
        </div>

        {/* ── 3. Danh mục, thời lượng, trạng thái ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
            <select
              required
              value={formData.category.id}
              onChange={(e) => {
                const selectedId   = e.target.value;
                const selectedName = categories.find(c => String(c.id) === String(selectedId))?.name || "";
                setFormData(prev => ({ ...prev, category: { id: selectedId, name: selectedName } }));
              }}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 bg-white"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (Phút) *</label>
            <input
              type="number"
              required
              min="5"
              value={formData.duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiển thị</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none bg-white"
            >
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Tạm ngưng (Inactive)</option>
            </select>
          </div>
        </div>

        {/* ── 4. Giá ── */}
        <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc niêm yết (đ) *</label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.original_price}
              onChange={(e) => handlePriceOrDiscountChange("original_price", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none bg-white font-semibold text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount_percent}
              onChange={(e) => handlePriceOrDiscountChange("discount_percent", e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 font-semibold mb-1">Giá bán cuối cùng (đ)</label>
            <input
              type="text"
              disabled
              value={formData.final_price ? Math.round(formData.final_price).toLocaleString("vi-VN") : "0"}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 p-2.5 font-bold text-blue-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* ── 5. Loài phù hợp ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Thú cưng phù hợp:</label>
          <div className="flex flex-wrap gap-4">
            {availableSpecies.map(sp => (
              <label key={sp.id} className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.suitable_for.includes(sp.name)}
                  onChange={() => handleSpeciesCheck(sp.name)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {sp.name} {sp.description ? `(${sp.description})` : ""}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── 6. Danh sách động (Bao gồm & Ghi chú) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Các bước bao gồm trong gói</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputIncluded}
                onChange={(e) => setInputIncluded(e.target.value)}
                placeholder="Ví dụ: Cắt tỉa móng..."
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("included_services", inputIncluded, setInputIncluded);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addArrayItem("included_services", inputIncluded, setInputIncluded)}
                className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-900 shrink-0"
              >
                Thêm
              </button>
            </div>
            <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {formData.included_services?.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg text-sm text-gray-700 border gap-2">
                  <span className="break-all">⚡ {item}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("included_services", idx)}
                    className="text-red-500 hover:text-red-700 font-bold ml-2 shrink-0 text-base leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Ghi chú & Lưu ý</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                placeholder="Ví dụ: Không nhận cún đang bệnh nặng..."
                className="flex-1 rounded-lg border border-gray-300 p-2 text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("notes", inputNote, setInputNote);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addArrayItem("notes", inputNote, setInputNote)}
                className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-900 shrink-0"
              >
                Thêm
              </button>
            </div>
            <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {formData.notes?.map((note, idx) => (
                <li key={idx} className="flex items-center justify-between bg-amber-50/60 px-3 py-1.5 rounded-lg text-sm text-amber-900 border border-amber-100 min-w-0 gap-2">
                  <span className="truncate flex-1">⚠️ {note}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("notes", idx)}
                    className="text-red-500 hover:text-red-700 font-bold ml-2 shrink-0 text-base leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 7. Ảnh dịch vụ ── */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800">Ảnh dịch vụ</label>

          {/* Thumbnail */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Ảnh đại diện (Thumbnail)</p>
            <div className="flex items-start gap-4">
              <img
                src={formData.thumbnail}
                alt="thumbnail"
                className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shrink-0 bg-gray-50"
                onError={(e) => { e.target.src = "https://placehold.co/500x500"; }}
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="Dán URL ảnh thumbnail..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-400">Khuyến nghị: ảnh vuông 500×500px, dưới 2MB</p>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Bộ ảnh minh hoạ ({formData.images.length}/6)</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.images.map((url, idx) => (
                <div key={idx} className="relative group w-20 h-20 sm:w-24 sm:h-24">
                  <img
                    src={url}
                    alt={`img-${idx}`}
                    className="w-full h-full rounded-xl object-cover border border-gray-200 bg-gray-50"
                    onError={(e) => { e.target.src = "https://placehold.co/500x500"; }}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    ×
                  </button>
                </div>
              ))}

              {formData.images.length < 6 && (
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt("Nhập URL ảnh:");
                    if (url?.trim()) addGalleryImage(url);
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-gray-400 hover:text-blue-500 bg-transparent"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-[10px] mt-1">Thêm ảnh</span>
                </button>
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
                className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* ── 8. Thống kê (chỉ Edit mode) ── */}
        {isEdit && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 space-y-4">
            <div className="text-sm font-semibold text-gray-700 flex flex-wrap items-center gap-2">
              <span>⭐ Thống kê & Đánh giá</span>
              <span className="text-[11px] font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border">
                Dữ liệu tự động từ hệ thống
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100 space-y-1">
                <div className="text-2xl font-black text-amber-500">{formData.average_rating ? Number(formData.average_rating).toFixed(1) : "0.0"}</div>
                <div className="text-xs text-gray-500">Điểm TB</div>
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-sm ${star <= Math.round(formData.average_rating || 0) ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100 space-y-1">
                <div className="text-2xl font-black text-blue-500">{formData.review_count?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-gray-500">Lượt đánh giá</div>
                <div className="text-lg">💬</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-amber-100 space-y-1">
                <div className="text-2xl font-black text-green-500">{formData.booking_count?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-gray-500">Lượt đặt lịch</div>
                <div className="text-lg">📅</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.open(`/admin/reviews?service_id=${serviceData?.id}`, "_blank")}
              className="w-full py-2 rounded-xl border border-amber-200 text-sm font-semibold text-amber-700 bg-white hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>📝</span> Xem tất cả đánh giá của dịch vụ này
            </button>
          </div>
        )}

        {/* ── 9. Nổi bật ── */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2 cursor-pointer"
          />
          <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            🔥 Đánh dấu đây là dịch vụ Nổi bật (Featured Service) để hiển thị lên trang chủ
          </label>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
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
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Tạo dịch vụ"
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default ServiceFormAdmin;