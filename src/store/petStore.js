import { create } from "zustand";
import PetService from "../services/PetService";

export const usePetStore = create((set, get) => ({
  // ───────────────────────── STATES ─────────────────────────
  pets: [],
  meta: null,

  currentPet: null,
  species: [],

  loading: false,
  loadingSpecies: false,
  submitting: false,

  // filters
  keyword: "",
  selectedSpecies: "",
  selectedGender: "",
  selectedOwner: "",

  // ───────────────────────── FILTER ACTIONS ─────────────────────────

  setKeyword: (keyword) => set({ keyword }),

  setSelectedSpecies: (id) =>
    set({ selectedSpecies: id }),

  setSelectedGender: (gender) =>
    set({ selectedGender: gender }),

  setSelectedOwner: (ownerId) =>
    set({ selectedOwner: ownerId }),

  clearCurrentPet: () =>
    set({ currentPet: null }),

  // ───────────────────────── READ PETS ─────────────────────────
  fetchPets: async (overrideParams = {}) => {
    try {
      set({ loading: true });

      const state = get();

      const params = {
        keyword: state.keyword,
        speciesId: state.selectedSpecies || null,
        gender: state.selectedGender || null,
        ownerId: state.selectedOwner || null,
        ...overrideParams,
      };

      const res = await PetService.getPets(params);

      if (res?.success) {
        set({
          pets: res.data?.result || [],
          meta: res.data?.meta || null,
        });
      } else {
        set({
          pets: [],
          meta: null,
        });
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── PET DETAIL ─────────────────────────
  fetchPetById: async (petId) => {
    if (get().currentPet?.id === Number(petId)) return;

    try {
      set({
        loading: true,
        currentPet: null,
      });

      const res = await PetService.getPetById(petId);

      set({
        currentPet: res?.success ? res.data : null,
      });
    } catch (err) {
      console.error("Error fetching pet detail:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── SPECIES ─────────────────────────
  fetchSpecies: async () => {
    if (get().species.length > 0) return;

    try {
      set({ loadingSpecies: true });

      const res = await PetService.getSpecies();

      set({
        species: res?.success ? res.data : [],
      });
    } catch (err) {
      console.error("Error fetching species:", err);
    } finally {
      set({ loadingSpecies: false });
    }
  },

  // ───────────────────────── CREATE ─────────────────────────
  createPet: async (petData) => {
    try {
      set({ submitting: true });

      const res = await PetService.createPet(petData);

      if (res?.success) {
        set((state) => ({
          pets: [res.data, ...state.pets],
        }));
      }

      return res;
    } catch (err) {
      console.error("Error creating pet:", err);
      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ submitting: false });
    }
  },

  // ───────────────────────── UPDATE ─────────────────────────
  updatePet: async (petId, petData) => {
    try {
      set({ submitting: true });

      const res = await PetService.updatePet(petId, petData);

      if (res?.success) {
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === Number(petId)
              ? { ...p, ...res.data }
              : p
          ),

          currentPet:
            state.currentPet?.id === Number(petId)
              ? { ...state.currentPet, ...res.data }
              : state.currentPet,
        }));
      }

      return res;
    } catch (err) {
      console.error("Error updating pet:", err);
      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ submitting: false });
    }
  },

  // ───────────────────────── DELETE ─────────────────────────
  deletePet: async (petId) => {
    try {
      set({ submitting: true });

      const res = await PetService.deletePet(petId);

      if (res?.success) {
        set((state) => ({
          pets: state.pets.filter(
            (p) => p.id !== Number(petId)
          ),

          currentPet:
            state.currentPet?.id === Number(petId)
              ? null
              : state.currentPet,
        }));
      }

      return res;
    } catch (err) {
      console.error("Error deleting pet:", err);
      return {
        success: false,
        message: "System error",
      };
    } finally {
      set({ submitting: false });
    }
  },


  fetchPetsByUser: async (userId) => {
  try {
    set({ loading: true, error: null });

  const response = await PetService.getPetsByUser(userId);

    if (response.success) {
      set({
        pets: response.data?.result || [],
        loading: false,
      });

      return {
        success: true,
        data: response.data,
      };
    }

    set({
      pets: [],
      loading: false,
      error: response.message,
    });

    return {
      success: false,
      message: response.message,
    };
  } catch (error) {
    set({
      pets: [],
      loading: false,
      error: error.message || "Failed to fetch user pets",
    });

    return {
      success: false,
      message: error.message || "Failed to fetch user pets",
    };
  }
},
}));