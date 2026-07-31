import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Le serveur renvoie un message explicite (taille invalide, doublon...),
// on le remonte tel quel pour l'afficher dans les modales.
const extractError = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message;

const createRewardService = async (points, item, size) => {
  try {
    let createRewardResponse = await axios.post(`${API_URL}/rewards/create`, {
      item,
      size,
      points,
    });

    if (createRewardResponse?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: createRewardResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: extractError(error),
    };
  }
};

const updateRewardService = async (id, points, item, size) => {
  try {
    let updateRewardResponse = await axios.put(
      `${API_URL}/rewards/update/${id}`,
      {
        item,
        size,
        points,
      }
    );

    if (updateRewardResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: updateRewardResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: extractError(error),
    };
  }
};

const getRewards = async () => {
  try {
    let getRewardsResponse = await axios.get(`${API_URL}/rewards`);

    if (getRewardsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRewardsResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: extractError(error),
    };
  }
};

const deleteRewardService = async (id) => {
  try {
    let deleteRewardResponse = await axios.delete(
      `${API_URL}/rewards/delete/${id}`
    );

    if (deleteRewardResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteRewardResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: extractError(error),
    };
  }
};

export {
  createRewardService,
  updateRewardService,
  getRewards,
  deleteRewardService,
};
