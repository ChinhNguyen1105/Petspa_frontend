import { create } from "zustand";
import PetService from "../services/PetService";

export const usePetStore = create((set, get) => ({
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */
  pets: [],
  myPets: [],
  currentPet: null,
  species: [],

  loading: false,
  error: null,

  meta: null,

  /*
  |--------------------------------------------------------------------------
  | COMMON
  |--------------------------------------------------------------------------
  */
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  /*
  |--------------------------------------------------------------------------
  | GET ALL PETS (ADMIN)
  |--------------------------------------------------------------------------
  */
  fetchPets: async (params = {}, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.getPets(params, options);

      set({
        pets: res?.data?.result || [],
        meta: res?.data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err?.message || "Fetch pets failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | GET PET BY ID
  |--------------------------------------------------------------------------
  */
  fetchPetById: async (petId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.getPetById(petId, options);

      set({
        currentPet: res?.data || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err?.message || "Fetch pet failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | GET MY PETS
  |--------------------------------------------------------------------------
  */
  fetchMyPets: async (options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.getMyPets(options);

      set({
        myPets: res?.data || [],
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err?.message || "Fetch my pets failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | GET PETS BY USER
  |--------------------------------------------------------------------------
  */
  fetchPetsByUser: async (userId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.getPetsByUser(userId, options);
      
      console.log("response pet by users: ", res);
      set({
        pets: res?.data?.result || [],
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err?.message || "Fetch user pets failed",
        loading: false,
      });
    }
  },


  /*
  |--------------------------------------------------------------------------
  | CREATE PET
  |--------------------------------------------------------------------------
  */
  createPet: async (petData, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.createPet(petData, options);

      const newPet = res?.data;

      set((state) => ({
        pets: [newPet, ...state.pets],
        myPets: [newPet, ...state.myPets],
        loading: false,
      }));

      return res;
    } catch (err) {
      set({
        error: err?.message || "Create pet failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE PET
  |--------------------------------------------------------------------------
  */
  updatePet: async (petId, petData, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.updatePet(petId, petData, options);

      const updated = res?.data;

      set((state) => ({
        pets: state.pets.map((p) =>
          String(p.id) === String(petId) ? updated : p
        ),
        myPets: state.myPets.map((p) =>
          String(p.id) === String(petId) ? updated : p
        ),
        currentPet:
          String(state.currentPet?.id) === String(petId)
            ? updated
            : state.currentPet,
        loading: false,
      }));

      return res;
    } catch (err) {
      set({
        error: err?.message || "Update pet failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE PET
  |--------------------------------------------------------------------------
  */
  deletePet: async (petId, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await PetService.deletePet(petId, options);

      set((state) => ({
        pets: state.pets.filter((p) => String(p.id) !== String(petId)),
        myPets: state.myPets.filter((p) => String(p.id) !== String(petId)),
        currentPet:
          String(state.currentPet?.id) === String(petId)
            ? null
            : state.currentPet,
        loading: false,
      }));

      return res;
    } catch (err) {
      set({
        error: err?.message || "Delete pet failed",
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | UTIL
  |--------------------------------------------------------------------------
  */
  clearCurrentPet: () => set({ currentPet: null }),
  clearPets: () => set({ pets: [], myPets: [] }),
  clearError: () => set({ error: null }),
}));