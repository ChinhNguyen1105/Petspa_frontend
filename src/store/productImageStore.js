import { create } from "zustand";
import ProductImageService from "../services/ProductImageService";

export const useProductImageStore =
  create((set, get) => ({
    images: [],
    loading: false,
    error: null,

    /*
    |--------------------------------------------------------------------------
    | FETCH IMAGES
    |--------------------------------------------------------------------------
    */
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

        console.log(
          "response img",
          res
        );

        set({
          images:
            res?.data || [],
        });

        return res;
      } catch (err) {
        console.error(
          "Fetch images error:",
          err
        );

        set({
          images: [],
          error:
            err?.response?.data
              ?.message ||
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
        console.error(
          "Delete image error:",
          err
        );

        throw err;
      }
    },

    /*
    |--------------------------------------------------------------------------
    | SET THUMBNAIL
    |--------------------------------------------------------------------------
    */
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
                  img.id ===
                  imageId,

                isThumbnail:
                  img.id ===
                  imageId,
              })
            ),
        }));

        return res;
      } catch (err) {
        console.error(
          "Set thumbnail error:",
          err
        );

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