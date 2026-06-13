import { create } from "zustand";
import { persist } from "zustand/middleware";
import CartService from "../services/CartService";

export const useCartStore = create(
  persist(
    (set, get) => ({
      itemDtoList: [],
      totalAmount: 0,
      totalItem: 0,

      isLoading: false,

      toast: {
        show: false,
        message: "",
        type: "success",
      },

      showToast: (
        message,
        type = "success"
      ) => {
        set({
          toast: {
            show: true,
            message,
            type,
          },
        });

        setTimeout(() => {
          set({
            toast: {
              show: false,
              message: "",
              type: "success",
            },
          });
        }, 3000);
      },

      /*
       * FETCH CART
       */
      fetchCart: async () => {
        set({ isLoading: true });

        try {
          const res =
            await CartService.getCart();

          console.log(
            "cart from store:",
            res
          );

          if (
            res?.status === "SUCCESS" &&
            res?.data
          ) {
            set({
              itemDtoList:
                res.data.itemDtoList ?? [],
              totalAmount:
                res.data.totalAmount ?? 0,
              totalItem:
                res.data.totalItem ?? 0,
            });
          }
        } catch (error) {
          console.error(
            "Lỗi fetch cart:",
            error
          );
        } finally {
          set({ isLoading: false });
        }
      },

      /*
       * ADD ITEM
       */
      addItem: async (product) => {
        try {
          await CartService.addToCart(
            product.id,
            1
          );

          await get().fetchCart();

          get().showToast(
            `Đã thêm ${
              product.name ||
              product.productName
            } vào giỏ hàng`
          );
        } catch (error) {
          console.error(error);

          get().showToast(
            "Không thể thêm sản phẩm",
            "error"
          );
        }
      },

      /*
       * REMOVE ITEM
       */
      removeItem: async (itemId) => {
        try {
          await CartService.removeCartItem(
            itemId
          );

          await get().fetchCart();

          get().showToast(
            "Đã xóa sản phẩm khỏi giỏ hàng",
            "info"
          );
        } catch (error) {
          console.error(error);

          get().showToast(
            "Không thể xóa sản phẩm",
            "error"
          );
        }
      },

      /*
       * UPDATE QUANTITY
       */
      updateQuantity: async (itemId, quantity) => {
  try {
    if (!itemId) {
      throw new Error("itemId is missing");
    }

    await CartService.updateCartItem(itemId, quantity);

    await get().fetchCart();
  } catch (error) {
    console.error("updateQuantity error:", error);

    get().showToast(
      "Không thể cập nhật số lượng",
      "error"
    );
  }
},

      /*
       * CLEAR CART
       */
      clearCart: async () => {
        try {
          const res =
            await CartService.clearCart();

          if (res?.success) {
            set({
              itemDtoList: [],
              totalAmount: 0,
              totalItem: 0,
            });

            get().showToast(
              "Đã xóa giỏ hàng",
              "info"
            );
          }
        } catch (error) {
          console.error(error);

          get().showToast(
            "Không thể xóa giỏ hàng",
            "error"
          );
        }
      },
    }),
    {
      name: "petspa-cart-storage",

      partialize: (state) => ({
        itemDtoList: state.itemDtoList,
        totalAmount: state.totalAmount,
        totalItem: state.totalItem,
      }),
    }
  )
);