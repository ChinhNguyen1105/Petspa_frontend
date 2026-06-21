import React, { useState, useEffect, useRef } from "react";
import { useProductStore } from "../../store/productStore";
import { useCategoryStore } from "../../store/categoryStore";
import { useProductImageStore } from "../../store/productImageStore";

const ProductFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const isEdit = !!initialData;

  const { loading: loadingProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Kết nối các phương thức quản lý ảnh từ useProductImageStore
  const {
    images: productImages,
    loading: loadingImages,
    fetchImages,
    uploadImages,
    deleteImage,
    setMainImage,
    clearImages,
  } = useProductImageStore();

  // State quản lý dữ liệu form bám sát theo Class ReqCreateProduct DTO
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    quantity: "",
  });

  // Dùng ref để clear input file dễ dàng sau khi upload thành công
  const fileInputRef = useRef(null);

  // ĐỒNG BỘ MỚI: Chỉ kích hoạt fetch các danh mục có loại là PRODUCT
  useEffect(() => {
    if (fetchCategories) {
      fetchCategories({ type: "PRODUCT" });
    }
  }, [fetchCategories]);

  // Đổ dữ liệu ban đầu hoặc Fetch ảnh từ server về nếu là Mode Edit
  useEffect(() => {
    if (initialData) {
      const productId = initialData.id;
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ?? "",
        categoryId: initialData.categoryId || initialData.category?.id || "",
        quantity:
          initialData.quantity ??
          initialData.stockQuantity ??
          initialData.stock_quantity ??
          "",
      });

      if (productId) {
        fetchImages(productId);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        quantity: "",
      });
      clearImages();
    }
  }, [initialData, fetchImages, clearImages]);

  // Xử lý upload tập tin hình ảnh (Hỗ trợ chọn nhiều ảnh cùng lúc)
  const handleFileChange = async (e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Ép kiểu FileList thành một Array thực thụ để pass qua Service/Store không bị lỗi .forEach
    const filesArray = Array.from(fileList);

    // Kiểm tra giới hạn số lượng ảnh (Tối đa 6) dựa trên mảng mới biến đổi
    if (productImages.length + filesArray.length > 6) {
      alert(
        `Hệ thống chỉ hỗ trợ tối đa 6 ảnh minh họa. Hiện tại bạn đã có ${productImages.length} ảnh.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Truyền mảng chuẩn (Array) thay vì FileList gốc
      await uploadImages(initialData.id, filesArray);
    } catch (err) {
      alert(
        "Tải tập tin hình ảnh lên thất bại, vui lòng kiểm tra lại định dạng tệp.",
      );
    } finally {
      // Reset input để có thể chọn lại chính tệp đó nếu muốn
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveGalleryImage = async (imageId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này không?"))
      return;
    try {
      await deleteImage(imageId);
    } catch (err) {
      alert("Xóa ảnh thất bại!");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage(initialData.id, imageId);
    } catch (err) {
      alert("Thay đổi ảnh đại diện chính thất bại!");
    }
  };

  // Validate và submit payload chuẩn DTO
  const handleSubmitForm = () => {
    if (!formData.name.trim()) return alert("Tên sản phẩm không được để trống");
    if (!formData.description.trim())
      return alert("Mô tả sản phẩm không được để trống");
    if (formData.price === "" || Number(formData.price) < 0)
      return alert("Giá sản phẩm không hợp lệ");
    if (!formData.categoryId) return alert("Vui lòng chọn danh mục");
    if (formData.quantity === "" || Number(formData.quantity) < 0)
      return alert("Số lượng nhập kho không hợp lệ");

    const submitPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      categoryId: Number(formData.categoryId),
      quantity: Number(formData.quantity),
    };

    if (isEdit && initialData?.id) {
      submitPayload.id = Number(initialData.id);
    }
    console.log("submit payload: ", submitPayload);
    onSubmit(submitPayload);
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay khi hệ thống đang xử lý sản phẩm */}
      {loadingProduct && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-sm font-medium text-gray-600">
            Đang xử lý dữ liệu sản phẩm...
          </span>
        </div>
      )}

      {/* ── Group 1: Tên & Danh mục sản phẩm ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Nhập tên sản phẩm..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục sản phẩm *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((p) => ({ ...p, categoryId: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {/* SỬA ĐỔI CHÍNH: Lọc chặt chẽ một lần nữa trước khi render lên UI */}
            {categories &&
              categories
                .filter(
                  (cat) =>
                    cat.categoryType === "PRODUCT" ||
                    cat.type === "PRODUCT" ||
                    !cat.categoryType,
                )
                // Thêm điều kiện !cat.categoryType dự phòng nếu store chỉ lưu mảng map sẵn {value, label}
                .map((cat) => (
                  <option key={cat.value || cat.id} value={cat.value || cat.id}>
                    {cat.label || cat.name}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* ── Group 2: Mô tả sản phẩm ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả sản phẩm *
        </label>
        <textarea
          rows="3"
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Mô tả chi tiết các đặc tính, công dụng sản phẩm..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* ── Group 3: Giá bán & Số lượng ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá sản phẩm (đ) *
          </label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData((p) => ({ ...p, price: e.target.value }))
            }
            placeholder="Nhập giá bán..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng nhập kho ban đầu *
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((p) => ({ ...p, quantity: e.target.value }))
            }
            placeholder="Nhập số lượng tồn..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── Group 4: Quản lý Album Ảnh bằng File Upload (Chỉ hiển thị khi EDIT) ── */}
      {isEdit && (
        <div className="space-y-4 border-t border-gray-100 pt-4 relative">
          {loadingImages && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-gray-500 animate-pulse">
                Đang đồng bộ tập tin ảnh...
              </span>
            </div>
          )}

          <label className="block text-sm font-semibold text-gray-800">
            Quản lý Album Ảnh sản phẩm
          </label>

          <div>
            <p className="text-xs text-gray-500 mb-2">
              Danh sách hình ảnh chi tiết từ hệ thống ({productImages.length}/6)
            </p>
            <p className="text-[11px] text-gray-400 mb-3">
              * Mẹo: Click trực tiếp vào một ảnh để cấu hình đặt làm ảnh hiển
              thị chính (Thumbnail).
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
              {productImages.map((img) => {
                const isMain = img.isThumbnail || img.isMain;
                const currentImgUrl = img.imageUrl || img.url;
                return (
                  <div
                    key={img.id}
                    className={`relative group aspect-square rounded-xl border overflow-hidden cursor-pointer ${
                      isMain
                        ? "border-orange-500 ring-2 ring-orange-400/30"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={currentImgUrl}
                      alt={`gallery-${img.id}`}
                      className="w-full h-full object-cover bg-gray-50"
                      onClick={() => handleSetMainImage(img.id)}
                      title="Click để đặt làm ảnh hiển thị chính"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/300x300";
                      }}
                    />

                    {isMain && (
                      <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow">
                        Chính
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveGalleryImage(img.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {productImages.length < 6 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-gray-400 hover:text-blue-500"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-[10px] mt-1">Tải ảnh lên</span>
                </div>
              )}
            </div>

            {/* Input file ẩn phục vụ việc click chọn tệp */}
            <div className="hidden">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
            </div>

            {productImages.length < 6 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 12 12M12 3v13.5"
                    />
                  </svg>
                  Chọn tệp từ thiết bị
                </button>
                <span className="text-xs text-gray-400">
                  Hỗ trợ các định dạng .png, .jpg, .jpeg, .webp
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Group 5: Hộp điều hướng Actions Footer ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={handleSubmitForm}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          {isEdit ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
        </button>
      </div>
    </div>
  );
};

export default ProductFormAdmin;
