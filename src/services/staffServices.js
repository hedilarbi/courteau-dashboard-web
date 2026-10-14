import axios from "axios";
import { getToken } from "@/actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = async () => {
  const token = await getToken();
  return token?.value ? { Authorization: `Bearer ${token.value}` } : {};
};
const loginStaff = async (username, password, expoToken) => {
  try {
    let loginStaffResponse = await axios.post(
      `${API_URL}/staffs/login`,
      {
        username,
        password,
        expoToken,
      },
      {
        timeout: 10000, // 10 seconds
      }
    );

    if (loginStaffResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: loginStaffResponse.data,
      };
    } else {
      return {
        status: false,
        message: loginStaffResponse.message,
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const affectOrderToStaff = async (orderId, staffId) => {
  try {
    let affectOrderToStaffResponse = await axios.put(
      `${API_URL}/staffs/affectOrder/${staffId}`,
      {
        orderId,
      },
      { headers: await getAuthHeaders() }
    );

    if (affectOrderToStaffResponse?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: affectOrderToStaffResponse.data,
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
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const getStaffByToken = async (token) => {
  try {
    let getStaffByTokenResponse = await axios.get(
      `${API_URL}/staffs/staffByToken/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (getStaffByTokenResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffByTokenResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const getStaffMembers = async () => {
  try {
    let getStaffMembersResponse = await axios.get(`${API_URL}/staffs/`, {
      headers: await getAuthHeaders(),
    });
    if (getStaffMembersResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMembersResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const getStaffMember = async (id) => {
  try {
    let getStaffMemberResponse = await axios.get(`${API_URL}/staffs/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (getStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const updateStaffMember = async (id, name, username, restaurant, role) => {
  try {
    let getStaffMemberResponse = await axios.put(
      `${API_URL}/staffs/update/${id}`,
      { name, username, restaurant, role },
      { headers: await getAuthHeaders() }
    );
    if (getStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: getStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const deleteStaffMember = async (id) => {
  try {
    let deleteStaffMemberResponse = await axios.delete(
      `${API_URL}/staffs/delete/${id}`,
      { headers: await getAuthHeaders() }
    );
    if (deleteStaffMemberResponse.status === 200) {
      return {
        status: true,
        message: "user data",
        data: deleteStaffMemberResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};

const getAvailableDrivers = async () => {
  try {
    let getAvailableDriversResponse = await axios.get(
      `${API_URL}/staffs/available`
    );
    if (getAvailableDriversResponse.status === 200) {
      return {
        status: true,

        data: getAvailableDriversResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};
const getStaffOrder = async (id) => {
  try {
    let getStaffOrderResponse = await axios.get(
      `${API_URL}/staffs/${id}/order`
    );
    if (getStaffOrderResponse.status === 200) {
      return {
        status: true,

        data: getStaffOrderResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};

const getDriverOrders = async (id) => {
  try {
    let getDriverOrderResponse = await axios.get(
      `${API_URL}/staffs/driver/orders/${id}`
    );
    if (getDriverOrderResponse.status === 200) {
      return {
        status: true,

        data: getDriverOrderResponse.data,
      };
    } else {
      return {
        status: false,
        message: "didn't found",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message || "Serveur injoignable. Réessayez dans un instant.",
    };
  }
};

export {
  loginStaff,
  getStaffByToken,
  getStaffMembers,
  getStaffMember,
  deleteStaffMember,
  updateStaffMember,
  affectOrderToStaff,
  getAvailableDrivers,
  getStaffOrder,
  getDriverOrders,
};
