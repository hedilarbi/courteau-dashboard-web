import axios from "axios";
import { getToken } from "@/actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = async () => {
  const token = await getToken();
  return token?.value ? { Authorization: `Bearer ${token.value}` } : {};
};

const getUsers = async () => {
  try {
    let getUsersResponse = await axios.get(`${API_URL}/users`, {
      headers: await getAuthHeaders(),
    });

    if (getUsersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUsersResponse?.data,
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

const getUser = async (id) => {
  try {
    let getUserResponse = await axios.get(`${API_URL}/users/${id}`, {
      headers: await getAuthHeaders(),
    });

    if (getUserResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUserResponse?.data,
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

const getUserStats = async (id, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/users/stats/${id}`, {
      params,
    });

    if (response?.status === 200) {
      return {
        status: true,
        data: response?.data || null,
      };
    }
    return {
      status: false,
      message: "Erreur de chargement des statistiques utilisateur.",
    };
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

const deleteUser = async (id) => {
  try {
    let deleteUserResponse = await axios.delete(
      `${API_URL}/users/delete/${id}`,
      { headers: await getAuthHeaders() }
    );

    if (deleteUserResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
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

const getUsersPagination = async (page, limit, name) => {
  try {
    let getUsersResponse = await axios.get(`${API_URL}/users/pagination`, {
      headers: await getAuthHeaders(),
      params: { page, limit, name },
    });

    if (getUsersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getUsersResponse?.data,
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

const banUser = async (id) => {
  try {
    let banUserResponse = await axios.put(
      `${API_URL}/users/ban/${id}`,
      null,
      { headers: await getAuthHeaders() }
    );

    if (banUserResponse?.status === 200) {
      return {
        status: true,
        message: "user banned",
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

export {
  getUsers,
  getUser,
  getUserStats,
  deleteUser,
  getUsersPagination,
  banUser,
};
