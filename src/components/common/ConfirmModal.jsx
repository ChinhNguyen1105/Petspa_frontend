import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal'; // Kế thừa từ Modal nền tảng của bạn

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận thao tác", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  type = "warning", // 'danger' (cho xóa) hoặc 'warning' (cho hủy/cập nhật)
  confirmText = "Đồng ý",
  cancelText = "Quay lại"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-1 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 ${
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;