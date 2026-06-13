import { create } from "zustand";
import ProductImageService from "../services/ProductImageService";

export const useProductImageStore =
  create((set) => ({
    images: [],
    loading: false,
    error: null,

     fetchImages: async (
          productId
     ) => {
        
          try {
            set({
              loading: true,
              error: null,
            });
    
            const res =
              await ProductImageService.getProductImages(
                productId
              );
              console.log("image product from store", res);
            set({
              images:
                res?.data || [],
            });
    
            return res;
          } catch (err) {
            set({
              error:
                err?.response?.data
                  ?.message ||
                "Fetch images failed",
            });
          } finally {
            set({
              loading: false,
            });
          }
        },
    

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

        return res;
      } catch (err) {
        set({
          error:
            err?.response?.data
              ?.message ||
            "Upload images failed",
        });

        throw err;
      } finally {
        set({
          loading: false,
        });
      }
    },

    deleteImage: async (
      imageId
    ) => {
      try {
        const res =
          await ProductImageService.deleteImage(
            imageId
          );

        set((state) => ({
          images:
            state.images.filter(
              (img) =>
                img.id !== imageId
            ),
        }));

        return res;
      } catch (err) {
        throw err;
      }
    },

    setMainImage: async (
      productId,
      imageId
    ) => {
      try {
        const res =
          await ProductImageService.setMainImage(
            productId,
            imageId
          );

        set((state) => ({
          images:
            state.images.map(
              (img) => ({
                ...img,
                isMain:
                  img.id === imageId,
              })
            ),
        }));

        return res;
      } catch (err) {
        throw err;
      }
    },

    clearImages: () =>
      set({
        images: [],
      }),
  }));