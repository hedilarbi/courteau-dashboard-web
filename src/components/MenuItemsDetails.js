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
import { getToppingGroups } from "@/services/ToppingGroupsServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MenuItemsDetails = ({ item }) => {
  const [data, setData] = useState(item);
  const [updateMode, setUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataIsFetching, setDataIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [newCategory, setNewCategory] = useState({});
  const [newPrices, setNewPrices] = useState([]);
  const [newCustomizations, setNewCustomizations] = useState([]);
  const [toppingGroups, setToppingGroups] = useState([]);
  const [selectedToppingGroup, setSelectedToppingGroup] = useState(null);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [toppingGroupsOptions, setToppingGroupsOptions] = useState([]);

  const fetchData = async () => {
    try {
      const [
        categoriesResponse,
        toppingResponse,
        sizeResponse,
        toppingGroupsResponse,
      ] = await Promise.all([
        getCategories(),
        getToppings(),
        getSizes(),
        getToppingGroups(),
      ]);

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

      if (toppingGroupsResponse?.status) {
        const list =
          toppingGroupsResponse?.data?.map((group) => ({
            value: group._id,
            label: group.name,
          })) || [];
        setToppingGroups(list);
        setToppingGroupsOptions([
          { value: "__none__", label: "Aucun groupe de personnalisation" },
          ...list,
        ]);
      } else {
        setError(toppingGroupsResponse?.message);
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
      (data.customization || []).map((item) =>
        list.push({ value: item._id, label: item.name })
      );
      setNewCustomizations(list);
      if (data?.customization_group?._id) {
        setSelectedToppingGroup({
          value: data.customization_group._id,
          label: data.customization_group.name,
        });
      } else {
        setSelectedToppingGroup(null);
      }
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
    const customization = selectedToppingGroup
      ? []
      : newCustomizations.map((item) => ({
          _id: item.value,
        }));

    const formattedPrices = newPrices.map((newPrice) => ({
      ...newPrice,
      price: parseFloat(newPrice.price).toFixed(2),
    }));

    const formData = new FormData();
    formData.append("name", newName);
    formData.append("description", newDescription);
    formData.append("category", newCategory.value);
    formData.append("prices", JSON.stringify(formattedPrices));
    formData.append("customization", JSON.stringify(customization));
    formData.append("customizationGroup", selectedToppingGroup?.value || "");
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

  const priceCount = Array.isArray(data?.prices) ? data.prices.length : 0;
  const customizationCount = Array.isArray(data?.customization)
    ? data.customization.length
    : 0;
  const customizationGroupName = data?.customization_group?.name;

  const handleSelectToppingGroup = (group) => {
    if (!group || group.value === "__none__") {
      setSelectedToppingGroup(null);
      return;
    }
    setSelectedToppingGroup(group);
  };

  return (
    <>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="flex-1 w-full font-roboto bg-[#f6f8fb]">
        <div className="  flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pr to-[#111827] text-white shadow-lg">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_45%)]" />
            <div className="relative p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                    Article
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-semibold">
                    {data.name}
                  </h1>
                  <p className="text-sm opacity-90 mt-2 max-w-3xl">
                    {data.description || "Aucune description renseignée"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {updateMode ? (
                    <button
                      className="bg-white/15 text-white border border-white/30 font-semibold rounded-md py-2 px-4 hover:bg-white/25 transition"
                      onClick={() => setUpdateMode(false)}
                    >
                      Annuler
                    </button>
                  ) : (
                    <button
                      className="bg-white text-[#111827] font-semibold rounded-md py-2 px-4 shadow-sm hover:brightness-95 transition"
                      onClick={activateUpdateMode}
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                  {data.category?.name || "Sans catégorie"}
                </span>
                <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                  {priceCount} prix
                </span>
                {customizationGroupName && (
                  <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                    Groupe: {customizationGroupName}
                  </span>
                )}
                {customizationCount > 0 && (
                  <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                    {customizationCount} personnalisation(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-dark-gray">
                Informations générales
              </h2>
              {updateMode && (
                <p className="text-xs text-text-light-gray">Edition activée</p>
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
          </section>
          <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-dark-gray">
                Personnalisations
              </h2>
              {updateMode && (
                <p className="text-xs text-text-light-gray">
                  Gérez les options disponibles
                </p>
              )}
            </div>
            <MenuItemCustomizations
              customizations={data.customization}
              customizationGroup={data.customization_group}
              updateMode={updateMode}
              newCustomizations={newCustomizations}
              setNewCustomizations={setNewCustomizations}
              toppings={toppings}
              toppingGroups={toppingGroupsOptions}
              selectedToppingGroup={selectedToppingGroup}
              onSelectGroup={handleSelectToppingGroup}
            />
          </section>

          <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-dark-gray">
                Prix
              </h2>
              {updateMode && (
                <p className="text-xs text-text-light-gray">
                  Ajustez les tarifs par taille
                </p>
              )}
            </div>
            <MenuItemPrices
              prices={data.prices}
              updateMode={updateMode}
              sizes={sizes}
              setNewPrices={setNewPrices}
              newPrices={newPrices}
            />
          </section>

          {updateMode && (
            <div className="flex justify-end">
              <button
                className="bg-pr font-semibold rounded-md py-2.5 px-6 text-white shadow-sm hover:brightness-95 transition"
                onClick={saveChanges}
              >
                Sauvegarder les changements
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuItemsDetails;
