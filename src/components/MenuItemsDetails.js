"use client";
import React, { useEffect, useState } from "react";
import MenuItemGeneralInfo from "./MenuItemGeneralInfo";
import MenuItemPrices from "./MenuItemPrices";
import MenuItemCustomizations from "./MenuItemCustomizations";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { getCategories } from "@/services/MenuItemServices";
import { getToppings } from "@/services/ToppingsServices";
import { getSizes } from "@/services/SizesServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MenuItemsDetails = ({ item }) => {
  const [data, setData] = useState(item);
  const [updateMode, setUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newCategory, setNewCategory] = useState({});
  const [newPrices, setNewPrices] = useState([]);
  const [newCustomizations, setNewCustomizations] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);

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
        setError(categoriesResponse.message);
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
        setError(toppingResponse.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activateUpdateMode = async () => {
    setIsLoading(true);
    fetchData().then(() => {
      setUpdateMode(true);
      setNewName(data.name);
      setNewDescription(data.description);

      setNewCategory({ label: data.category?.name, value: data.category?._id });
      setNewPrices(data.prices);
      const list = [];
      data.customization.map((item) =>
        list.push({ value: item._id, label: item.name })
      );
      setNewCustomizations(list);
    });
  };

  const saveChanges = async () => {
    if (!newName) {
      setError("Le nom ne peut pas être nul");
      setShowFailModel(true);
      return;
    }
    if (!newDescription) {
      setError("La description ne peut pas être nulle");
      setShowFailModel(true);
      return;
    }
    if (!newCategory) {
      setError("La categorie ne peut pas être nulle");
      setShowFailModel(true);
      return;
    }
    if (!newPrices.length) {
      setError("Le prix ne peut pas être nul");
      setShowFailModel(true);
      return;
    }
    const customization = newCustomizations.map((item) => ({
      _id: item.value,
    }));

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("description", newDescription);
    formData.append("category", newCategory.value);
    formData.append("prices", JSON.stringify(newPrices));
    formData.append("customization", JSON.stringify(customization));
    if (newImage) {
      formData.append("file", newImage);
      formData.append("fileToDelete", data.image);
    }
    const id = data._id;
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/menuItems/update/${id}`, {
        method: "PUT",

        body: formData,
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const res = await response.json();
      setData(res);
      setShowSuccessModel(true);
      setUpdateMode(false);
    } catch (err) {
      setError(err.message);
      setShowFailModel(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
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
    <>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="flex-1 w-full font-roboto  flex flex-col ">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-roboto font-semibold ">
            Informations generale
          </h2>
          {updateMode ? (
            <button
              className="bg-gray-400 text-white font-roboto font-semibold rounded-md py-2 px-6"
              onClick={() => setUpdateMode(false)}
            >
              Annuler
            </button>
          ) : (
            <button
              className="bg-pr font-roboto font-semibold rounded-md py-2 px-6"
              onClick={activateUpdateMode}
            >
              Modifier
            </button>
          )}
        </div>
        <MenuItemGeneralInfo
          data={data}
          updateMode={updateMode}
          newName={newName}
          setNewName={setNewName}
          newImage={newImage}
          setNewImage={setNewImage}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          categoriesNames={categoriesNames}
          setNewCategory={setNewCategory}
          newCategory={newCategory}
        />

        <h2 className="text-2xl font-roboto font-semibold mt-8">Prix</h2>
        <MenuItemPrices
          prices={data.prices}
          updateMode={updateMode}
          sizes={sizes}
          setNewPrices={setNewPrices}
          newPrices={newPrices}
        />
        <h2 className="text-2xl font-roboto font-semibold mt-8">
          Personnalisations
        </h2>
        <MenuItemCustomizations
          customizations={data.customization}
          updateMode={updateMode}
          newCustomizations={newCustomizations}
          setNewCustomizations={setNewCustomizations}
          toppings={toppings}
        />
        {updateMode && (
          <div className="flex justify-end mt-4">
            <button
              className="bg-pr font-roboto font-semibold rounded-md py-2 px-6"
              onClick={saveChanges}
            >
              Sauvegarder
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MenuItemsDetails;
