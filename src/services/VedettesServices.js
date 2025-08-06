import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createVedette = async (menuItem) => {
  try {
    const response = await axios.post(`${API_URL}/vedettes/`, {
      menuItem,
    });

    if (response?.status === 201) {
      return {
        status: true,
        message: "Vedette created successfully",
        data: response.data,
      };
    } else {
      return {
        status: false,
        message: "Failed to create vedette",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const getVedettes = async () => {
  try {
    const response = await axios.get(`${API_URL}/vedettes/`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "Vedettes fetched successfully",
        data: response.data,
      };
    } else {
      return {
        status: false,
        message: "Failed to fetch vedettes",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

const deleteVedette = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/vedettes/${id}`);

    if (response?.status === 200) {
      return {
        status: true,
        message: "Vedette deleted successfully",
      };
    } else {
      return {
        status: false,
        message: "Failed to delete vedette",
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
const vedetteTri = async (list) => {
  try {
    let response = await axios.put(`${API_URL}/vedettes/tri`, { list });

    if (response?.status === 200) {
      return {
        status: true,
        message: "users data",
        data: response?.data,
      };
    } else {
      return {
        status: false,
        messge: response.data.message,
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};

export { createVedette, getVedettes, deleteVedette, vedetteTri };
