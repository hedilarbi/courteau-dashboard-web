import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getRecipes = async () => {
  try {
    const response = await axios.get(`${API_URL}/recipes`);
    if (response?.status === 200) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const createRecipeService = async (item, category, ingredients, instruction) => {
  try {
    const response = await axios.post(`${API_URL}/recipes/create`, {
      item,
      category,
      ingredients,
      instruction,
    });
    if (response?.status === 201) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur" };
  } catch (error) {
    return {
      status: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const updateRecipeService = async (id, item, category, ingredients, instruction) => {
  try {
    const response = await axios.put(`${API_URL}/recipes/update/${id}`, {
      item,
      category,
      ingredients,
      instruction,
    });
    if (response?.status === 200) {
      return { status: true, data: response.data };
    }
    return { status: false, message: "Erreur" };
  } catch (error) {
    return {
      status: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

const deleteRecipeService = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/recipes/delete/${id}`);
    if (response?.status === 200) {
      return { status: true };
    }
    return { status: false, message: "Erreur" };
  } catch (error) {
    return {
      status: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export { getRecipes, createRecipeService, updateRecipeService, deleteRecipeService };
