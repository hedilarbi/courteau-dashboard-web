import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getSizes = async () => {
  try {
    let response = await axios.get(`${API_URL}/sizes/`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.error,
    };
  }
};
const createSize = async (name) => {
  try {
    let response = await axios.post(`${API_URL}/sizes/`, { name });

    if (response?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data,
    };
  }
};
const deleteSizeService = async (id) => {
  try {
    let response = await axios.delete(`${API_URL}/sizes/${id}`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        message: "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

export { getSizes, deleteSizeService, createSize };
