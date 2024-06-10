import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const createRewardService = async (points, item) => {
  try {
    let createRewardResponse = await axios.post(`${API_URL}/rewards/create`, {
      item,
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
      message: error.message,
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
      message: error.message,
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
      message: error.message,
    };
  }
};

export { createRewardService, getRewards, deleteRewardService };
