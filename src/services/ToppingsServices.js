import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const getToppings = async () => {
  try {
    let getToppingsResponse = await axios.get(`${API_URL}/toppings`);

    if (getToppingsResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getToppingsResponse?.data,
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

const createToppingCategory = async (name) => {
  try {
    let createToppingCategoryResponse = await axios.post(
      `${API_URL}/toppingCategories/create`,
      { name }
    );

    if (createToppingCategoryResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: createToppingCategoryResponse?.data,
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

const getToppingsCategories = async () => {
  try {
    let getToppingsCategoriesResponse = await axios.get(
      `${API_URL}/toppingCategories`
    );

    if (getToppingsCategoriesResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: getToppingsCategoriesResponse?.data,
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

const createTopping = async (name, category, price) => {
  try {
    let createToppingResponse = await axios.post(`${API_URL}/toppings/create`, {
      name,
      category,
      price,
    });

    if (createToppingResponse?.status === 201) {
      return {
        status: true,
        message: "users data",
        data: createToppingResponse?.data,
      };
    } else {
      return {
        status: false,
        message: createToppingResponse.error,
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const deleteToppingService = async (id) => {
  try {
    let deleteToppingResponse = await axios.delete(
      `${API_URL}/toppings/delete/${id}`
    );

    if (deleteToppingResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteToppingResponse?.data,
      };
    } else {
      return {
        status: false,
        message: deleteToppingResponse.message,
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

const deleteToppingCategoryService = async (id) => {
  try {
    let deleteToppingCategoryResponse = await axios.delete(
      `${API_URL}/toppingCategories/delete/${id}`
    );

    if (deleteToppingCategoryResponse?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: deleteToppingCategoryResponse?.data,
      };
    } else {
      return {
        status: false,
        message: deleteToppingCategoryResponse.message,
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
  getToppings,
  createToppingCategory,
  getToppingsCategories,
  createTopping,
  deleteToppingService,
  deleteToppingCategoryService,
};
