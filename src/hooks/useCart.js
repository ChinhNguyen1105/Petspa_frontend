import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);

  // Tải dữ liệu giỏ hàng từ localStorage khi khởi chạy hook
  useEffect(() => {
    const storedCart = localStorage.getItem('petspa_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Lưu thay đổi vào localStorage mỗi khi biến cartItems biến động
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('petspa_cart', JSON.stringify(items));
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex !== -1) {
      // Nếu đã có trong giỏ hàng, tăng số lượng lên
      updatedCart[existingIndex].quantity += quantity;
    } else {
      // Nếu chưa có, đẩy item mới vào cấu trúc phẳng gọn
      updatedCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sku: product.sku,
        quantity: quantity
      });
    }
    saveCart(updatedCart);
  };

  // Cập nhật số lượng của một sản phẩm cụ thể
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(updatedCart);
  };

  // Xóa sản phẩm ra khỏi giỏ
  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    saveCart(updatedCart);
  };

  // Làm trống hoàn toàn giỏ hàng (Gọi sau khi hoàn tất đặt hàng thành công)
  const clearCart = () => {
    saveCart([]);
  };

  // Tính tổng số lượng vật phẩm có trong giỏ hàng
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng số tiền cần thanh toán của toàn bộ giỏ
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount
  };
};