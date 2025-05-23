import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getOrders = async () => {
  try {
    let getOrdersResponse = await axios.get(`${API_URL}/orders`);

    if (getOrdersResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrdersResponse?.data,
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

const orderDelivered = async (id, staffId) => {
  try {
    let orderDeliveredResponse = await axios.put(
      `${API_URL}/orders/update/delivered/${id}`,
      { staffId }
    );

    if (orderDeliveredResponse?.status === 200) {
      return {
        status: true,
        message: "order delivered",
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

const getOrder = async (id) => {
  try {
    let getOrderResponse = await axios.get(`${API_URL}/orders/${id}`);

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getOrderResponse?.data?.error || "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const deleteOrder = async (id) => {
  try {
    let deleteUserResponse = await axios.delete(
      `${API_URL}/orders/delete/${id}`
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
const updateStatus = async (id, status) => {
  try {
    let updateStatusResponse = await axios.put(
      `${API_URL}/orders/update/status/${id}`,
      { status },
      { timeout: 10000 }
    );

    if (updateStatusResponse?.status === 200) {
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
const updateStatusAndPrice = async (id, status, price) => {
  try {
    let response = await axios.put(
      `${API_URL}/orders/update/priceandstatus/${id}`,
      { status, price },
      { timeout: 10000 }
    );

    if (response?.status === 200) {
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
const updatePrice = async (id, price) => {
  try {
    let updatePriceResponse = await axios.put(
      `${API_URL}/orders/update/price/${id}`,
      { price },
      { timeout: 10000 }
    );

    if (updatePriceResponse?.status === 200) {
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
const getOrderFiltred = async (filters) => {
  try {
    let getOrderResponse = await axios.get(`${API_URL}/orders/filter`, {
      params: { ...filters },
    });

    if (getOrderResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getOrderResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getOrderResponse?.data?.error || "error",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const getRestaurantList = async () => {
  try {
    let response = await axios.get(`${API_URL}/restaurants/list`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch {
    return {
      status: false,
      message: error.message,
    };
  }
};

export {
  getOrders,
  getOrder,
  deleteOrder,
  updatePrice,
  updateStatus,
  orderDelivered,
  updateStatusAndPrice,
  getOrderFiltred,
  getRestaurantList,
};
