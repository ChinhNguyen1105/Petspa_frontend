import React, { useState, useEffect, useRef } from "react";
import { Camera, UploadCloud, X, Eye, EyeOff } from "lucide-react";
import { useRoleStore } from "../../store/roleStore";
import { useUserStore } from "../../store/userStore";

const UserFormAdmin = ({ initialData, onSubmit, onClose, onUploadAvatar }) => {
  const { fetchUserById } = useUserStore();
  const isEditMode = !!initialData?.id;

  // Lấy dữ liệu và hành động từ useRoleStore
  const { roles, fetchRoles, loading: loadingRoles } = useRoleStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "", // Sẽ lưu URL ảnh (được map từ avatarUrl hoặc avatar)
    roleId: "",
    gender: "",
    dateOfBirth: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Gọi API lấy danh sách roles khi component mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // 2. Đồng bộ dữ liệu khi mở form sửa và ưu tiên lấy avatarUrl từ hàm fetchUserById
  useEffect(() => {
    if (initialData) {
      let formattedDate = "";
      if (initialData.dateOfBirth && initialData.dateOfBirth !== "undefined") {
        formattedDate = initialData.dateOfBirth.split("T")[0];
      }

      let currentRoleId = initialData.roleId || "";

      if (!currentRoleId && initialData.role) {
        if (typeof initialData.role === "object") {
          currentRoleId = initialData.role.id;
        } else if (roles.length > 0) {
          const matchedRole = roles.find((r) => r.name === initialData.role);
          if (matchedRole) currentRoleId = matchedRole.id;
        }
      }

      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        // Ưu tiên avatarUrl từ store lấy về, fallback về avatar cũ
        avatar: initialData.avatarUrl || initialData.avatar || "",
        roleId: currentRoleId,
        gender:
          initialData.gender && initialData.gender !== "undefined"
            ? initialData.gender
            : "",
        dateOfBirth: formattedDate,
        password: "",
      });
    }
  }, [initialData, roles]);

  // Tự động chọn vai trò đầu tiên nếu thêm mới
  useEffect(() => {
    if (!isEditMode && roles.length > 0 && !formData.roleId) {
      const defaultRole = roles.find((r) => r.name === "CUSTOMER") || roles[0];
      setFormData((prev) => ({ ...prev, roleId: defaultRole.id }));
    }
  }, [roles, isEditMode, formData.roleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Vui lòng chọn file định dạng ảnh hợp lệ!",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Kích thước ảnh không vượt quá 2MB",
      }));
      return;
    }

    if (isEditMode && onUploadAvatar) {
      try {
        setIsUploading(true);
        setErrors((prev) => ({ ...prev, avatar: "" }));

        const response = await onUploadAvatar(initialData.id, file);

        if (response?.status === "SUCCESS") {
          const refreshedUser = await fetchUserById(initialData.id);

          setFormData((prev) => ({
            ...prev,
            avatar: refreshedUser.data.avatarUrl,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            avatar: response?.message || "Upload ảnh thất bại.",
          }));
        }
        console.log("UPLOAD RESPONSE:", response);
        console.log("TYPE:", typeof response.data);
      } catch (err) {
        console.error("Lỗi upload avatar trực tiếp từ form:", err);
        setErrors((prev) => ({
          ...prev,
          avatar: "Gặp lỗi hệ thống khi tải ảnh.",
        }));
      } finally {
        setIsUploading(false);
      }
    } else {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: previewUrl, rawFile: file }));
      if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: "", rawFile: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ và tên không được để trống";
    if (!formData.roleId) newErrors.roleId = "Vui lòng chọn vai trò";

    if (!isEditMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = "Email không được để trống";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Định dạng email không hợp lệ";
      }

      if (!formData.password) {
        newErrors.password = "Mật khẩu bắt buộc nhập đối với tài khoản mới";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Mật khẩu mới phải chứa ít nhất 6 ký tự";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let finalPayload = {
      name: formData.name,
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.split("T")[0]
        : undefined,
      gender: formData.gender || undefined,
      avatar: formData.avatar || undefined,
      role: {
        id: Number(formData.roleId),
      },
    };

    if (isEditMode) {
      finalPayload.id = initialData.id;
      finalPayload.email = formData.email;

      if (formData.password) {
        finalPayload.password = formData.password;
      } else {
        finalPayload.password = undefined;
      }
    } else {
      finalPayload.email = formData.email;
      finalPayload.password = formData.password;
      if (formData.rawFile) {
        finalPayload.rawFile = formData.rawFile;
      }
    }

    finalPayload = Object.fromEntries(
      Object.entries(finalPayload).filter(([_, value]) => value !== undefined),
    );

    try {
      await onSubmit(finalPayload);
    } catch (error) {
      console.error("Lỗi khi xử lý form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      {/* ẢNH ĐẠI DIỆN */}
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <label className="text-sm font-bold text-gray-700 mb-3 w-full text-left">
          Ảnh đại diện
        </label>

        <div className="relative group">
          <div
            className={`w-28 h-28 rounded-full overflow-hidden border-2 border-orange-100 bg-white flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 duration-200 ${isUploading ? "opacity-60" : ""}`}
          >
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-300 flex flex-col items-center gap-1">
                <UploadCloud size={28} />
                <span className="text-[10px] font-medium text-gray-400">
                  Chưa có ảnh
                </span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-xs font-bold rounded-full">
                Đang tải...
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            title="Tải ảnh lên"
          >
            <Camera size={16} />
          </button>

          {formData.avatar && !isUploading && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all active:scale-90"
              title="Xóa ảnh hiện tại"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 text-xs font-bold text-orange-500 hover:text-orange-600 underline disabled:text-gray-400"
        >
          {formData.avatar ? "Thay đổi ảnh khác" : "Chọn tệp từ máy tính"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {errors.avatar && (
          <p className="text-xs text-red-500 font-medium mt-1">
            {errors.avatar}
          </p>
        )}
      </div>

      {/* THÔNG TIN CHI TIẾT Ô NHẬP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Họ và tên *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên thành viên"
            className={`w-full px-4 py-2.5 bg-white border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:outline-none focus:border-orange-500`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Địa chỉ Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">
            Địa chỉ Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isEditMode}
            placeholder="example@petspa.vn"
            className={`w-full px-4 py-2.5 bg-white border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:outline-none focus:border-orange-500 ${isEditMode ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Vai trò Hệ thống */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">
            Vai trò thành viên *
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-white border ${errors.roleId ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700 font-semibold`}
          >
            <option value="" disabled>
              -- Chọn vai trò --
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.description || role.name}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="text-xs text-red-500 font-medium">{errors.roleId}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Giới tính</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          >
            <option value="">Chọn giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        {/* Ngày sinh */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Ngày sinh</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* Mật khẩu */}
        <div className="space-y-1.5 relative">
          <label className="text-sm font-bold text-gray-700">
            {isEditMode
              ? "Mật khẩu mới (Bỏ trống nếu không đổi)"
              : "Mật khẩu tài khoản *"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isEditMode ? "••••••••" : "Nhập mật khẩu ít nhất 6 ký tự"
              }
              className={`w-full px-4 py-2.5 bg-white border ${errors.password ? "border-red-500" : "border-gray-200"} rounded-xl text-sm focus:outline-none focus:border-orange-500 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isUploading}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md transition-colors disabled:opacity-50"
        >
          {isEditMode ? "Lưu thay đổi" : "Tạo tài khoản"}
        </button>
      </div>
    </form>
  );
};

export default UserFormAdmin;
