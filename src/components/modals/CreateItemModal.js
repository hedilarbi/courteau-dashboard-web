import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Image from "next/image";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import DropDown from "../DropDown";
import Spinner from "../spinner/Spinner";
import { getCategories } from "@/services/MenuItemServices";
import { getToppings } from "@/services/ToppingsServices";
import { getSizes } from "@/services/SizesServices";

import AddPriceModal from "./AddPriceModal";
import AddToppingModal from "./AddToppingModal";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateItemModal = ({ setShowCreateItemModal, setMenuItems }) => {
  const inputImageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [customizations, setCustomizations] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [error, setError] = useState(null);
  const [showAddPriceModel, setShowAddPriceModel] = useState(false);
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = async () => {
    try {
      const [categoriesResponse, toppingResponse, sizeResponse] =
        await Promise.all([getCategories(), getToppings(), getSizes()]);

      if (categoriesResponse?.status) {
        const list = [];
        categoriesResponse?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setCategoriesNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }

      if (sizeResponse?.status) {
        setSizes(
          sizeResponse?.data.map((size) => ({
            label: size.name,
            value: size.name,
          }))
        );
      }

      if (toppingResponse?.status) {
        const list = [];
        toppingResponse?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setToppings(list);
      } else {
        console.error("topping data not found:", toppingResponse.message);
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

  const deletePrice = (index) => {
    const newPrices = prices.filter((price, i) => i !== index);
    setPrices(newPrices);
  };

  const deleteCustomization = (index) => {
    const newCustomizations = customizations.filter((custo, i) => i !== index);
    setCustomizations(newCustomizations);
  };

  const createItem = async () => {
    if (!image) {
      setError("Image de l'article manquante");
      setShowFailModel(true);
      return;
    }

    if (name.length < 1) {
      setError("Nom de l'article manquant");
      setShowFailModel(true);
      return;
    }
    if (prices.length < 1) {
      setError("Ajouter au moin un prix ");
      setShowFailModel(true);
      return;
    }
    if (description.length < 1) {
      setError("Description de l'article manquante");
      setShowFailModel(true);
      return;
    }
    if (!category) {
      setError("Selectionner une categorie");
      setShowFailModel(true);
      return;
    }

    const customization = customizations.map((item) => {
      return item.value;
    });

    const formData = new FormData();

    formData.append("file", image);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category.value);
    formData.append("customization", JSON.stringify(customization));
    formData.append("prices", JSON.stringify(prices));

    setAddingIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/menuItems/create`, {
        method: "POST",

        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      console.log(data);
      setMenuItems((prev) => [data, ...prev]);

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
        setShowCreateItemModal(false);
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
      {showAddPriceModel && (
        <AddPriceModal
          sizes={sizes}
          setPrices={setPrices}
          prices={prices}
          setShowAddPriceModel={setShowAddPriceModel}
        />
      )}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      {showAddToppingModel && (
        <AddToppingModal
          toppings={toppings}
          setCustomizations={setCustomizations}
          customizations={customizations}
          setShowAddToppingModel={setShowAddToppingModel}
        />
      )}
      {isLoading ? (
        <div className="w-2/3 bg-white p-4 h-4/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="w-2/3 bg-white p-4 h-4/5 overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter un article
            </h1>
            <button onClick={() => setShowCreateItemModal(false)}>
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
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-200 rounded-md flex justify-center items-center">
                    <MdAddAPhoto size={44} />
                  </div>
                )}
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
                <div className="flex gap-2 ">
                  <label
                    htmlFor="description"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w border border-gray-300 rounded-md w-full py-1 px-2"
                    onChange={(e) => setDescription(e.target.value)}
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
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-roboto font-semibold text-text-dark-gray">
                Prix
              </h2>
              <div className="flex gap-2 mt-4 flex-wrap">
                {prices.map((price, index) => (
                  <div
                    key={index}
                    className="border border-pr rounded-md py-1 px-2 flex items-center gap-2 font-roboto"
                  >
                    <p className="font-bold">{price.size} :</p>
                    <p>{parseFloat(price.price).toFixed(2)} $</p>
                    <button
                      className="text-warning-red"
                      onClick={() => deletePrice(index)}
                    >
                      <MdOutlineClose size={24} />
                    </button>
                  </div>
                ))}
                <button
                  className="bg-pr rounded-md font-roboto py-1 px-10 font-semibold"
                  onClick={() => setShowAddPriceModel(true)}
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-roboto font-semibold text-text-dark-gray">
                Personnalisations
              </h2>
              <div className="flex gap-2 mt-4 flex-wrap">
                {customizations.map((custo, index) => (
                  <div
                    key={index}
                    className="border border-pr rounded-md py-1 px-2 flex items-center gap-2 font-roboto"
                  >
                    <p className="font-bold">{custo.label} </p>

                    <button
                      className="text-warning-red"
                      onClick={() => deleteCustomization(index)}
                    >
                      <MdOutlineClose size={24} />
                    </button>
                  </div>
                ))}
                <button
                  className="bg-pr rounded-md font-roboto py-1 px-10 font-semibold"
                  onClick={() => setShowAddToppingModel(true)}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-end mt-8    "
            onClick={createItem}
          >
            <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
              Ajouter
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateItemModal;
