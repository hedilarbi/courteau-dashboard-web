import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getRestaurants = async () => {
  try {
    let getRestaurantsResponse = await axios.get(`${API_URL}/restaurants/`);

    if (getRestaurantsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantsResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getRestaurantsResponse.data.error,
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const getRestaurant = async (id) => {
  try {
    let getRestaurantResponse = await axios.get(`${API_URL}/restaurants/${id}`);

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const deleteRestaurantService = async (id) => {
  try {
    let deleteRestaurantResponse = await axios.delete(
      `${API_URL}/restaurants/delete/${id}`
    );

    if (deleteRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteRestaurantResponse?.data,
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
const updateRestaurant = async (id, body) => {
  try {
    let updateRestaurantResponse = await axios.put(
      `${API_URL}/restaurants/update/${id}`,
      { ...body }
    );

    if (updateRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: updateRestaurantResponse?.data,
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
      message: error.response.data.message,
    };
  }
};

const createRestaurantService = async (
  name,
  address,
  location,
  phoneNumber
) => {
  try {
    let createRestaurantResponse = await axios.post(
      `${API_URL}/restaurants/create`,
      { name, address, location, phoneNumber }
    );

    if (createRestaurantResponse?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: createRestaurantResponse?.data,
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

const getRestaurantItems = async (id) => {
  try {
    let getRestaurantResponse = await axios.get(
      `${API_URL}/restaurants/items/${id}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const getRestaurantToppings = async (id) => {
  try {
    let getRestaurantResponse = await axios.get(
      `${API_URL}/restaurants/toppings/${id}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const getRestaurantOffers = async (id) => {
  try {
    let getRestaurantResponse = await axios.get(
      `${API_URL}/restaurants/offers/${id}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const getRestaurantOrders = async (id) => {
  try {
    let getRestaurantResponse = await axios.get(
      `${API_URL}/restaurants/orders/${id}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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

const updateRestaurantItemAvailability = async (id, itemId) => {
  try {
    let getRestaurantResponse = await axios.put(
      `${API_URL}/restaurants/${id}/items/${itemId}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const updateRestaurantOfferAvailability = async (id, offerId) => {
  try {
    let getRestaurantResponse = await axios.put(
      `${API_URL}/restaurants/${id}/offers/${offerId}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const updateRestaurantToppingAvailability = async (id, toppingId) => {
  try {
    let getRestaurantResponse = await axios.put(
      `${API_URL}/restaurants/${id}/toppings/${toppingId}`
    );

    if (getRestaurantResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantResponse?.data,
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
const getRestaurantsSettings = async () => {
  try {
    let getRestaurantsResponse = await axios.get(
      `${API_URL}/restaurants/settings`
    );

    if (getRestaurantsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getRestaurantsResponse?.data,
      };
    } else {
      return {
        status: false,
        messge: getRestaurantsResponse.data.error,
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const updateSettings = async (id, settings) => {
  try {
    let response = await axios.put(
      `${API_URL}/restaurants/update/settings/${id}`,
      {
        settings,
      }
    );

    if (response?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message,
    };
  }
};

const sendNotifications = async (title, body, item) => {
  try {
    let response = await axios.post(`${API_URL}/notifiers/notifications`, {
      title,
      body,
      item,
    });

    if (response?.status === 200) {
      return {
        status: true,
        message: "user deleted",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        messge: "error",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error.message,
    };
  }
};

export {
  createRestaurantService,
  updateRestaurant,
  getRestaurant,
  getRestaurants,
  deleteRestaurantService,
  getRestaurantItems,
  getRestaurantOffers,
  getRestaurantToppings,
  getRestaurantOrders,
  updateRestaurantItemAvailability,
  updateRestaurantOfferAvailability,
  updateRestaurantToppingAvailability,
  getRestaurantsSettings,
  updateSettings,
  sendNotifications,
};
