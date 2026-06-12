import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CartService from '../services/CartService';

// Bắt buộc dùng Named Export: export const useCartStore
export const useCartStore = create(
  persist(
    (set, get) => ({
      itemDtoList: [], 
      totalAmount: 0,  
      totalItem: 0,    
      isLoading: false,
      toast: { show: false, message: '', type: 'success' },

      showToast: (message, type = 'success') => {
        set({ toast: { show: true, message, type } });
        setTimeout(() => {
          set({ toast: { show: false, message: '', type: 'success' } });
        }, 3000);
      },
      
      // Kéo dữ liệu ban đầu từ Mock Service
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const res = await CartService.getCart();
          if (res.success && res.data) {
            set({
              itemDtoList: res.data.itemDtoList || [],
              totalAmount: res.data.totalAmount || 0,
              totalItem: res.data.totalItem || 0,
            });
          }
        } catch (error) {
          console.error("Lỗi khi đồng bộ dữ liệu giỏ hàng:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product) => {
        await CartService.addToCart(product.id, 1);
        set((state) => {
          const existingItem = state.itemDtoList.find(item => item.productId === product.id);
          let newItems = [];

          if (existingItem) {
            newItems = state.itemDtoList.map(item => 
              item.productId === product.id 
                ? { 
                    ...item, 
                    quantity: item.quantity + 1, 
                    totalPrice: (item.quantity + 1) * item.productPrice 
                  } 
                : item
            );
          } else {
            const newItem = {
              id: Date.now(), 
              quantity: 1,
              productId: product.id,
              productName: product.name || product.productName,
              productPrice: product.price || product.productPrice,
              productImage: product.thumbnailUrl || product.productImage || "https://placehold.co/300x300",
              totalPrice: product.price || product.productPrice,
            };
            newItems = [...state.itemDtoList, newItem];
          }

          const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItem = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return { itemDtoList: newItems, totalAmount, totalItem };
        });
        get().showToast(`Đã thêm ${product.name || product.productName} vào giỏ!`);
      },

      removeItem: async (id) => {
        await CartService.removeCartItem(id);
        set((state) => {
          const newItems = state.itemDtoList.filter(item => item.id !== id);
          const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItem = newItems.reduce((sum, item) => sum + item.quantity, 0);
          return { itemDtoList: newItems, totalAmount, totalItem };
        });
        get().showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
      },

      updateQuantity: async (id, quantity) => {
        const targetQuantity = Math.max(1, quantity);
        await CartService.updateCartItem(id, targetQuantity);
        set((state) => {
          const newItems = state.itemDtoList.map(item => 
            item.id === id 
              ? { ...item, quantity: targetQuantity, totalPrice: targetQuantity * item.productPrice } 
              : item
          );
          const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          const totalItem = newItems.reduce((sum, item) => sum + item.quantity, 0);
          return { itemDtoList: newItems, totalAmount, totalItem };
        });
      },

      clearCart: async () => {
        await CartService.clearCart();
        set({ itemDtoList: [], totalAmount: 0, totalItem: 0 });
      },
    }),
    {
      name: 'petspa-cart-storage',
      partialize: (state) => ({ 
        itemDtoList: state.itemDtoList,
        totalAmount: state.totalAmount,
        totalItem: state.totalItem
      }), 
    }
  )
);