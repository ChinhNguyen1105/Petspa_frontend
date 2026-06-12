import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { petMock } from "../assets/data/mocks/pet/petList";
import { speciesMock } from "../assets/data/mocks/pet/speciesMock";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/
let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/*
|--------------------------------------------------------------------------
| GET PETS
|--------------------------------------------------------------------------
*/
const getPets = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Pet.GET_ALL_PETS,
      { params }
    );

    return resp.data;
  }

  await delay(500);

  let result = [...petMock.data];

  const {
    keyword,
    speciesId,
    gender,
    ownerId,
  } = params;

  if (keyword) {
    result = result.filter((pet) =>
      pet.name
        ?.toLowerCase()
        .includes(keyword.toLowerCase())
    );
  }

  if (speciesId) {
    result = result.filter(
      (pet) =>
        String(pet.species?.id) ===
        String(speciesId)
    );
  }

  if (gender) {
    result = result.filter(
      (pet) => pet.gender === gender
    );
  }

  if (ownerId) {
    result = result.filter(
      (pet) =>
        String(
          pet.owner?.id ||
            pet.ownerId
        ) === String(ownerId)
    );
  }

  return {
    success: true,
    message:
      petMock.message ||
      "Get pets successfully",
    data: {
      meta: {
        ...(petMock.meta || {}),
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PET BY ID
|--------------------------------------------------------------------------
*/
const getPetById = async (
  petId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Pet.GET_PET_DETAIL.replace(
        "{id}",
        petId
      )
    );

    return resp.data;
  }

  await delay(500);

  const pet =
    petMock.data.find(
      (item) =>
        String(item.id) ===
        String(petId)
    ) || null;

  return {
    success: !!pet,
    message: pet
      ? "Get pet detail successfully"
      : "Pet not found",
    data: pet,
  };
};

/*
|--------------------------------------------------------------------------
| GET MY PETS
|--------------------------------------------------------------------------
*/
const getMyPets = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Pet.GET_MY_PETS
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      "Get my pets successfully",
    data: {
      meta: {
        total: petMock.data.length,
      },
      result: petMock.data,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PETS BY USER
|--------------------------------------------------------------------------
*/
const getPetsByUser = async (
  userId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Pet.GET_MY_PETS,
      {
        params: { userId },
      }
    );

    return resp.data;
  }

  await delay(500);

  const result = petMock.data.filter(
    (pet) =>
      String(
        pet.owner?.id ||
          pet.ownerId
      ) === String(userId)
  );

  return {
    success: true,
    message:
      "Get user pets successfully",
    data: {
      meta: {
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET SPECIES
|--------------------------------------------------------------------------
*/
const getSpecies = async (
  options = {}
) => {
  if (shouldUseApi(options)) {
    // Nếu backend chưa có API species
    // thì giữ mock như hiện tại
  }

  await delay(300);

  return {
    success: true,
    message:
      speciesMock.message ||
      "Get species successfully",
    data: speciesMock.data,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PET
|--------------------------------------------------------------------------
*/
const createPet = async (
  petData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Pet.CREATE_PET,
      petData
    );

    return resp.data;
  }

  await delay(800);

  const newPet = {
    id: Date.now(),

    name: petData.name,

    thumbnail:
      petData.thumbnail ||
      "https://placehold.co/300x300",

    species:
      typeof petData.species ===
      "object"
        ? petData.species
        : {
            id:
              petData.speciesId || 1,
            name: "Dog",
          },

    breed: petData.breed || "",

    gender:
      petData.gender || "MALE",

    weightKg: Number(
      petData.weightKg || 0
    ),

    color: petData.color || "",

    owner:
      petData.owner || {
        id: 101,
        fullName: "Nguyễn Văn A",
      },

    status: "ACTIVE",

    createdAt:
      new Date().toISOString(),
  };

  return {
    success: true,
    message:
      "Create pet successfully",
    data: newPet,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PET
|--------------------------------------------------------------------------
*/
const updatePet = async (
  petId,
  petData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Pet.UPDATE_PET,
      {
        id: petId,
        ...petData,
      }
    );

    return resp.data;
  }

  await delay(700);

  const updatedWeight =
    petData.weightKg ??
    petData.weight;

  return {
    success: true,
    message:
      "Update pet successfully",
    data: {
      id: Number(petId),

      ...petData,

      ...(updatedWeight !==
        undefined && {
        weightKg: Number(
          updatedWeight
        ),
      }),

      updatedAt:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE PET
|--------------------------------------------------------------------------
*/
const deletePet = async (
  petId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Pet.DELETE_PET.replace(
        "{id}",
        petId
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message: `Delete pet #${petId} successfully`,
    data: null,
  };
};

export default {
  setApi,

  getPets,
  getPetById,

  getMyPets,
  getPetsByUser,

  getSpecies,

  createPet,
  updatePet,
  deletePet,
};