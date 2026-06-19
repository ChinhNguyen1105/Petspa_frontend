import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useProductStore } from '../../store/productStore';

const OrderFormAdmin = ({ initialData, onSubmit, onClose, mode }) => {
  const { products: availableProducts, fetchProducts } = useProductStore();

  // Hàm helper chuyển đổi định dạng ISO từ API sang định dạng cho input datetime-local (YYYY-MM-DDTHH:mm)
  const formatISODateToInput = (isoString) => {
    if (!isoString) return "";
    return isoString.substring(0, 16); 
  };

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    createdDate: initialData?.createdDate || "",
    customer_name: initialData?.shippingName || "",
    shipping_phone: initialData?.shippingPhone || "",
    shipping_address: initialData?.shippingAddressFull || "",
    payment_status: initialData?.paymentStatus || "PENDING", // Đồng bộ theo mẫu "SUCCESS", "PENDING",...
    status: initialData?.status || "PENDING",
    items: initialData?.orderDetails || [],
    total_amount: initialData?.totalAmount || 0,
  });

  // ─── LOAD SẢN PHẨM TỪ STORE ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'VIEW') fetchProducts();
  }, [mode, fetchProducts]);

  // ─── TÍNH LẠI TỔNG TIỀN KHI ITEMS THAY ĐỔI ──────────────────────────────────
  useEffect(() => {
    const total = formData.items.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0
    );
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [formData.items]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const numericValue = Number(value) || 0;

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? numericValue : value,
    };

    updatedItems[index].totalAmount =
      updatedItems[index].quantity * updatedItems[index].unitPrice;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleProductNameChange = (index, value) => {
    const updatedItems = [...formData.items];
    const found = availableProducts.find(
      p => p.name?.toLowerCase() === value.trim().toLowerCase()
    );

    if (found) {
      updatedItems[index].productId = found.id;
      updatedItems[index].productName = found.name;
      updatedItems[index].productImage = found.image || "";
      updatedItems[index].unitPrice = found.price;
    } else {
      updatedItems[index].productName = value;
    }

    updatedItems[index].totalAmount =
      updatedItems[index].quantity * updatedItems[index].unitPrice;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addEmptyItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { 
          id: Date.now(), 
          productId: "", 
          productImage: "",
          productName: '', 
          quantity: 1, 
          unitPrice: 0, 
          totalAmount: 0 
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.shipping_address || formData.items.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng và ít nhất 1 sản phẩm!');
      return;
    }
    onSubmit(formData);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">

      {/* Khách hàng & Số điện thoại & Ngày tạo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên khách hàng</label>
          <input
            type="text"
            required
            disabled={mode === 'VIEW'}
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Số điện thoại</label>
          <input
            type="text"
            required
            disabled={mode === 'VIEW'}
            value={formData.shipping_phone}
            onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngày tạo đơn</label>
          <input
            type="datetime-local"
            disabled // Thường ngày tạo do hệ thống sinh ra nên để disabled ở form admin
            value={formatISODateToInput(formData.createdDate)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none disabled:opacity-70 text-gray-500"
          />
        </div>
      </div>

      {/* Địa chỉ giao hàng */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Địa chỉ giao hàng</label>
        <input
          type="text"
          required
          disabled={mode === 'VIEW'}
          value={formData.shipping_address}
          onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
        />
      </div>

      {/* Trạng thái đơn hàng & Thanh toán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái thanh toán</label>
          <select
            disabled={mode === 'VIEW'}
            value={formData.payment_status}
            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
          >
            <option value="PENDING">Chờ thanh toán (PENDING)</option>
            <option value="SUCCESS">Đã thanh toán (SUCCESS)</option>
            <option value="FAILED">Thanh toán thất bại (FAILED)</option>
            <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái đơn hàng</label>
          <select
            disabled={mode === 'VIEW'}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
          >
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
            <option value="SHIPPED">Đang giao hàng (SHIPPING)</option>
            <option value="DELIVERED">Đã hoàn thành (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Danh sách sản phẩm</h3>
          {mode !== 'VIEW' && (
            <button
              type="button"
              onClick={addEmptyItem}
              className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              <Plus size={14} /> Thêm dòng sản phẩm
            </button>
          )}
        </div>

        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex flex-col sm:flex-row gap-2 bg-white border border-gray-100 p-3 rounded-xl shadow-sm items-center"
            >
              {item.productImage && (
                <img 
                  src={item.productImage} 
                  alt={item.productName} 
                  className="w-10 h-10 object-cover rounded-lg hidden sm:block border"
                />
              )}
              
              <div className="w-full sm:flex-1 relative">
                <input
                  type="text"
                  placeholder="Nhập hoặc chọn sản phẩm..."
                  required
                  disabled={mode === 'VIEW'}
                  value={item.productName || ''}
                  onChange={(e) => handleProductNameChange(index, e.target.value)}
                  list="product-suggestions"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="SL"
                  min="1"
                  required
                  disabled={mode === 'VIEW'}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-center focus:outline-none"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Đơn giá"
                  min="0"
                  required
                  disabled={mode === 'VIEW'}
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-right focus:outline-none"
                />
              </div>
              <div className="w-32 text-right font-black text-slate-800 text-sm hidden sm:block">
                {formatPrice(item.totalAmount || item.unitPrice * item.quantity)}
              </div>
              {mode !== 'VIEW' && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center p-6 text-gray-400 border border-dashed rounded-xl">
              Chưa có sản phẩm nào trong đơn hàng.
            </div>
          )}
        </div>
      </div>

      <datalist id="product-suggestions">
        {availableProducts.map(p => (
          <option key={p.id} value={p.name}>{formatPrice(p.price)}</option>
        ))}
      </datalist>

      {/* Tổng thanh toán */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500 uppercase">Tổng tiền thanh toán:</span>
        <span className="text-2xl font-black text-orange-500">{formatPrice(formData.total_amount)}</span>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          {mode === 'VIEW' ? 'Đóng' : 'Hủy bỏ'}
        </button>
        {mode !== 'VIEW' && (
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all"
          >
            Lưu thay đổi
          </button>
        )}
      </div>
    </form>
  );
};

export default OrderFormAdmin;