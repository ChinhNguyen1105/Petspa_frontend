import { create } from "zustand";
import ProductImageService from "../services/ProductImageService";

export const useProductImageStore = create((set, get) => ({
  imagesByProductId: {},
  loading: false,
  error: null,

  /*
  |--------------------------------------------------------------------------
  | FETCH IMAGES
  |--------------------------------------------------------------------------
  */
  fetchImages: async (productId) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await ProductImageService.getProductImages(
          productId
        );

      const imageList =
        res?.data || [];

      console.log(
        "response img",
        imageList
      );

      set((state) => ({
        imagesByProductId: {
          ...state.imagesByProductId,
          [productId]: imageList,
        },
      }));

      return imageList;
    } catch (err) {
      console.error(
        "Fetch images error:",
        err
      );

      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch images failed",
      });

      throw err;
    } finally {
      set({
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | GET IMAGES OF PRODUCT
  |--------------------------------------------------------------------------
  */
  getImagesByProductId: (productId) => get().imagesByProductId[productId] || [],

    /*
    |--------------------------------------------------------------------------
    | UPLOAD IMAGES
    |--------------------------------------------------------------------------
    */
    uploadImages: async (
      productId,
      files
    ) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const res =
          await ProductImageService.addImages(
            productId,
            files
          );

        // refresh lại ảnh
        await get().fetchImages(
          productId
        );

        return res;
      } catch (err) {
        console.error(
          "Upload image error:",
          err
        );

        set({
          error:
            err?.response?.data
              ?.message ||
            err?.message ||
            "Upload images failed",
        });

        throw err;
      } finally {
        set({
          loading: false,
        });
      }
    },

    /*
    |--------------------------------------------------------------------------
    | DELETE IMAGE
    |--------------------------------------------------------------------------
    */
 /*
    |--------------------------------------------------------------------------
    | DELETE IMAGE
    |--------------------------------------------------------------------------
    */
    deleteImage: async (imageId) => {
      try {
        const res = await ProductImageService.deleteImage(imageId);

        // Cập nhật đồng nhất với cấu trúc Map imagesByProductId
        set((state) => {
          const updatedMap = { ...state.imagesByProductId };
          
          // Duyệt qua từng productId trong Map để lọc bỏ ảnh vừa xóa
          Object.keys(updatedMap).forEach((productId) => {
            if (Array.isArray(updatedMap[productId])) {
              updatedMap[productId] = updatedMap[productId].filter(
                (img) => img.id !== imageId
              );
            }
          });

          return { imagesByProductId: updatedMap };
        });

        return res;
      } catch (err) {
        console.error("Delete image error:", err);
        throw err;
      }
    },

    /*
    |--------------------------------------------------------------------------
    | SET THUMBNAIL
    |--------------------------------------------------------------------------
    */
    setMainImage: async (productId, imageId) => {
      try {
        const res = await ProductImageService.setMainImage(productId, imageId);

        // Cập nhật đồng nhất với cấu trúc Map imagesByProductId theo đúng productId truyền vào
        set((state) => {
          const updatedMap = { ...state.imagesByProductId };
          const productTargetId = String(productId); // Đảm bảo trùng kiểu Key (String) của Object

          if (Array.isArray(updatedMap[productTargetId])) {
            updatedMap[productTargetId] = updatedMap[productTargetId].map((img) => ({
              ...img,
              isMain: img.id === imageId,
              isThumbnail: img.id === imageId, // Đồng bộ cả 2 cờ hiển thị tránh sót logic
            }));
          }

          return { imagesByProductId: updatedMap };
        });

        return res;
      } catch (err) {
        console.error("Set thumbnail error:", err);
        throw err;
      }
    },
    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */
    getMainImage: () => {
      const images =
        get().images;

      return (
        images.find(
          (img) =>
            img.isThumbnail ||
            img.isMain
        ) || null
      );
    },

    clearImages: () =>
      set({
        images: [],
        error: null,
      }),
  }));