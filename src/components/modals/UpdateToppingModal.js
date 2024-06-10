import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Image from "next/image";
import { MdOutlineClose } from "react-icons/md";
import DropDown from "../DropDown";
import Spinner from "../spinner/Spinner";
import { getToppingsCategories } from "@/services/ToppingsServices";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const UpdateToppingModal = ({
  setShowUpdateToppingModal,
  setToppings,
  topping,
}) => {
  const inputImageRef = useRef(null);
  const [image, setImage] = useState(topping.image);
  const [name, setName] = useState(topping.name);
  const [category, setCategory] = useState(topping.category);
  const [price, setPrice] = useState(topping.price);
  const [isLoading, setIsloading] = useState(true);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [error, setError] = useState(null);

  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getToppingsCategories();
      if (response?.status) {
        const list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setCategoriesNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleImageClick = () => {
    inputImageRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateItem = async () => {
    if (name.length < 1) {
      setError("Nom de l'article manquant");
      setShowFailModel(true);
      return;
    }

    if (!category) {
      setError("Selectionner une categorie");
      setShowFailModel(true);
      return;
    }

    const formData = new FormData();

    if (imagePreview) {
      formData.append("file", image);
      formData.append("fileToDelete", topping.image);
    }
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category.value);

    setAddingIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/toppings/update/${topping._id}`,
        {
          method: "PUT",

          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();

      setToppings((prev) =>
        prev.map((top) => (top._id === data._id ? data : top))
      );
      setShowSuccessModel(true);
    } catch (err) {
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    } finally {
      setAddingIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowUpdateToppingModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => {
        setShowFailModel(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModel]);
  return (
    <ModalWrapper zindex={10}>
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      {isLoading ? (
        <div className="w-2/3 bg-white p-4 h-3/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="w-2/3 bg-white p-4  overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Modifier une personnalisation
            </h1>
            <button onClick={() => setShowUpdateToppingModal(false)}>
              <MdOutlineClose size={32} />
            </button>
          </div>
          <div className="h-6 text-center my-4">
            {error && (
              <p className="text-warning-red text-sm font-roboto font-semibold">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4   flex-1 ">
            <div className="flex w-4/5  ">
              <div onClick={handleImageClick}>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  ref={inputImageRef}
                />

                <Image
                  src={imagePreview || topping.image}
                  alt="preview"
                  width={200}
                  height={200}
                  className="w-48 h-48 object-cover rounded-md"
                />
              </div>
              <div className="ml-4 flex flex-col justify-between flex-1">
                <div className=" flex gap-2 items-center ">
                  <label
                    htmlFor="name"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="border border-gray-300 rounded-md w-full py-1 px-2 "
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label
                    htmlFor="categorie"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Categorie
                  </label>

                  <DropDown
                    value={category}
                    setter={setCategory}
                    list={categoriesNames}
                    placeholder={"Selectionner une categorie"}
                  />
                </div>
                <div className="flex gap-2 items-center ">
                  <label
                    htmlFor="description"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Prix
                  </label>
                  <input
                    type="number"
                    id="name"
                    className="border border-gray-300 rounded-md w-full py-1 px-2 "
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-end mt-8    "
            onClick={updateItem}
          >
            <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
              Modifier
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default UpdateToppingModal;
