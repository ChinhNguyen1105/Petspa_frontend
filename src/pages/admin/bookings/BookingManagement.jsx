import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  CheckCircle,
  Clock,
  ChevronRight,
  User,
  Edit2,
} from "lucide-react";
import Loading from "../../../components/common/Loading";
import { formatPrice } from "../../../utils/formatPrice";
import Modal from "../../../components/common/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal";

import { useCartStore } from "../../../store/cartStore";
import { useBookingStore } from "../../../store/bookingStore";

import BookingFormAdmin from "../../../components/form/BookingFormAdmin";
import BookingFormAdminUpdate from "../../../components/form/BookingFormAdminUpdate";

import Pagination from "../../../components/common/Pagination";
import { BOOKING_STATUS_LIST } from "../../../constants";

const BookingManagement = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const meta = useBookingStore((state) => state.meta);
  const loading = useBookingStore((state) => state.loading);
  const errorStore = useBookingStore((state) => state.error);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const createBooking = useBookingStore((state) => state.createBooking);
  const updateBookingStatus = useBookingStore(
    (state) => state.updateBookingStatus || state.updateBooking,
  );
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("CREATE"); // "CREATE" hoặc "EDIT"
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  const showToast = useCartStore((state) => state.showToast);
  const statusFilters = BOOKING_STATUS_LIST;

  // ─── FETCH ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBookings({ page: currentPage });
  }, [currentPage, fetchBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // ─── MODAL HANDLERS ──────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setModalType("CREATE");
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setModalType("EDIT");
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formOutputData) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_SAVE_FORM",
      title:
        modalType === "CREATE"
          ? "Xác nhận thêm lịch đặt"
          : "Xác nhận cập nhật trạng thái",
      message:
        modalType === "CREATE"
          ? "Bạn có chắc chắn muốn tạo lịch hẹn dịch vụ mới này không?"
          : `Bạn có chắc chắn muốn thay đổi trạng thái cho lịch hẹn #${selectedBooking?.id} không?`,
      pendingData: formOutputData,
    });
  };

  const executeSaveBooking = async () => {
    const formData = confirmModal.pendingData;
    try {
      if (modalType === "CREATE") {
        const res = await createBooking(formData);
        showToast(
          res?.success !== false
            ? "Tạo mới lịch hẹn đặt dịch vụ thành công!"
            : res?.message || "Gặp sự cố khi tạo lịch hẹn.",
          res?.success !== false ? "success" : "error",
        );
      } else {
        // ✅ Thay thế updateBooking thành hành động updateBookingStatus tương ứng
        const res = await updateBookingStatus(selectedBooking.id, formData);
        showToast(
          res?.success !== false
            ? `Cập nhật trạng thái lịch hẹn #${selectedBooking.id} thành công!`
            : res?.message || "Gặp sự cố khi cập nhật trạng thái.",
          res?.success !== false ? "success" : "error",
        );
      }
      setIsModalOpen(false);
      closeConfirmModal();
    } catch (err) {
      console.error("Lỗi khi xử lý lưu dữ liệu form:", err);
      showToast("Đã xảy ra lỗi, không thể lưu dữ liệu.", "error");
    }
  };

  // ─── STATUS CHANGE (QUICK BANNER) ─────────────────────────────────────────────
  const handleStatusChangeClick = (bookingId, userName, targetStatus) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_STATUS_UPDATE",
      title: "Xác nhận cập nhật trạng thái",
      message: `Bạn có chắc chắn muốn chuyển trạng thái lịch hẹn của "${userName}" sang [${targetStatus}] không?`,
      pendingData: {
        id: bookingId,
        status: targetStatus,
        customerName: userName,
      },
    });
  };

  const executeUpdateStatus = async () => {
    const { id, status, customerName } = confirmModal.pendingData;
    try {
      const res = await updateBookingStatus(id, { status });
      showToast(
        res?.success !== false
          ? `Cập nhật trạng thái lịch hẹn của ${customerName} thành công!`
          : res?.message || "Gặp sự cố khi cập nhật trạng thái.",
        res?.success !== false ? "success" : "error",
      );
      closeConfirmModal();
    } catch (err) {
      console.error("Gặp lỗi khi cập nhật trạng thái:", err);
      showToast("Đã xảy ra lỗi hệ thống khi cập nhật trạng thái.", "error");
    }
  };

  // ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
  const handleConfirmCancelBooking = (bookingId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_CANCEL_BOOKING",
      title: "Hủy lịch hẹn vĩnh viễn",
      message: `Hành động này sẽ hủy lịch đặt dịch vụ của khách hàng "${userName}". Bạn có chắc chắn muốn tiếp tục?`,
      pendingData: { id: bookingId, name: userName },
    });
  };

  const executeCancelBooking = async () => {
    const { id, name } = confirmModal.pendingData;
    try {
      const res = await cancelBooking(id);
      const isSuccess = res?.status === "SUCCESS";

      showToast(
        isSuccess
          ? `Đã hủy lịch hẹn của khách hàng "${name}" thành công!`
          : res?.message || "Xảy ra lỗi khi tiến hành hủy lịch.",
        isSuccess ? "success" : "error",
      );
      closeConfirmModal();
    } catch (err) {
      console.error("Lỗi khi hủy lịch:", err);
      showToast("Đã xảy ra lỗi khi tiến hành hủy lịch.", "error");
    }
  };

  // ─── CONFIRM DISPATCHER ───────────────────────────────────────────────────────
  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;
      case "CONFIRM_SAVE_FORM":
        executeSaveBooking();
        break;
      case "CONFIRM_STATUS_UPDATE":
        executeUpdateStatus();
        break;
      case "CONFIRM_CANCEL_BOOKING":
        executeCancelBooking();
        break;
      default:
        closeConfirmModal();
    }
  };

  const closeConfirmModal = () =>
    setConfirmModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      pendingData: null,
    });

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thay đổi bạn vừa nhập trên Form sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  // ─── FILTER (client-side) ─────────────────────────────────────────────────────
  const filteredBookings = bookings.filter((booking) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(booking.userName ?? "")
        .toLowerCase()
        .includes(q) ||
      String(booking.petName ?? "")
        .toLowerCase()
        .includes(q) ||
      String(booking.id ?? "")
        .toLowerCase()
        .includes(q);
    return (
      matchesSearch &&
      (selectedStatus === "ALL" || booking.status === selectedStatus)
    );
  });

  // ─── STATUS BADGE ─────────────────────────────────────────────────────────────
  const renderStatusBadge = (status) => {
    const map = {
      CONFIRMED: ["Đã xác nhận", "text-emerald-600 bg-emerald-50"],
      PENDING: ["Chờ xử lý", "text-amber-500 bg-amber-50"],
      COMPLETED: ["Đã hoàn thành", "text-blue-600 bg-blue-50"],
      CANCELLED: ["Đã hủy", "text-red-500 bg-red-50"],
    };
    const [label, cls] = map[status] ?? [status, "text-gray-500 bg-gray-100"];
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${cls}`}
      >
        {label}
      </span>
    );
  };

  if (errorStore) {
    return <div className="text-center p-6 text-red-500">{errorStore}</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Shop</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Đặt lịch dịch vụ</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            DANH SÁCH ĐẶT LỊCH
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} /> Đặt lịch mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên khách, thú cưng hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-52 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {statusFilters.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loading size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                  <th className="p-4 w-16 text-center">Mã</th>
                  <th className="p-4">Khách hàng &amp; Thú cưng</th>
                  <th className="p-4">Chi tiết dịch vụ</th>
                  <th className="p-4">Thời gian đặt</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-400">
                      <Calendar
                        size={36}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      Không tìm thấy lịch đặt nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-4 text-center font-bold text-blue-600 font-mono text-xs">
                        #{booking.id}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          {booking.userName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Thú cưng:{" "}
                          <span className="font-bold text-orange-500">
                            {booking.petName}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {booking.bookingDetails?.length > 0 ? (
                            booking.bookingDetails.map((detail) => (
                              <div
                                key={detail.id}
                                className="text-xs bg-gray-50 border px-2 py-0.5 rounded-md inline-block mr-1 text-gray-700 font-medium"
                              >
                                {detail.serviceName}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-gray-800 flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="text-xs font-semibold text-gray-400 mt-0.5">
                          {booking.bookingDate}
                        </div>
                      </td>

                      <td className="p-4 font-black text-gray-900 text-base">
                        {formatPrice(booking.actualPrice)}
                      </td>

                      <td className="p-4 text-center">
                        {renderStatusBadge(booking.status)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 size={16} />
                          </button>
                          {booking.status === "PENDING" && (
                            <button
                              onClick={() =>
                                handleStatusChangeClick(
                                  booking.id,
                                  booking.userName,
                                  "CONFIRMED",
                                )
                              }
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-200 transition-all"
                              title="Xác nhận lịch hẹn"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() =>
                                handleConfirmCancelBooking(
                                  booking.id,
                                  booking.userName,
                                )
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                              title="Hủy lịch đặt"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-50 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "CREATE"
            ? "Tạo lượt đặt lịch hẹn dịch vụ Spa"
            : `Chỉnh sửa & Xem thông tin chi tiết lịch hẹn #${selectedBooking?.id}`
        }
        size="lg"
      >
        {modalType === "CREATE" ? (
          <BookingFormAdmin
            initialData={null}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
          />
        ) : (
          <BookingFormAdminUpdate
            initialData={selectedBooking}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
          />
        )}
      </Modal>

      {/* MODAL XÁC NHẬN */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={
          confirmModal.type === "CONFIRM_CANCEL_BOOKING" ? "danger" : "warning"
        }
      />
    </div>
  );
};

export default BookingManagement;
