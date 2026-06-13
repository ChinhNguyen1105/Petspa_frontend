import { create } from "zustand";
import PetServiceImageService from "../services/PetServiceImageService";

export const usePetServiceImageStore =
  create((set) => ({
    images: [],
    loading: false,
    error: null,

    fetchImages: async (
      serviceId
    ) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const res =
          await PetServiceImageService.getServiceImages(
            serviceId
          );

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

    addImage: async (
      serviceId,
      imageUrl,
      isThumbnail = false
    ) => {
      try {
        const res =
          await PetServiceImageService.addImage(
            serviceId,
            imageUrl,
            isThumbnail
          );

        if (
          res?.status ===
          "SUCCESS"
        ) {
          set((state) => ({
            images: [
              ...state.images,
              res.data,
            ],
          }));
        }

        return res;
      } catch (err) {
        throw err;
      }
    },

    deleteImage: async (
      imageId
    ) => {
      try {
        const res =
          await PetServiceImageService.deleteImage(
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
      imageId
    ) => {
      try {
        const res =
          await PetServiceImageService.setMainImage(
            imageId
          );

        set((state) => ({
          images:
            state.images.map(
              (img) => ({
                ...img,
                isThumbnail:
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