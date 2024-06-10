"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import Link from "next/link";
import CreateItemModal from "./modals/CreateItemModal";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { deleteMenuItem, menuTri } from "@/services/MenuItemServices";
import ToggleButton from "./toggleButton/ToggleButton";
import { updateRestaurantItemAvailability } from "@/services/RestaurantServices";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";

const MenuItemsScreen = ({ data, role, restaurant, categories }) => {
  const [menuItems, setMenuItems] = useState(data);
  const [filter, setFilter] = useState("tout");
  const [triMode, setTriMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);

  const filterItems = (filter) => {
    if (filter === "tout") {
      setMenuItems(data);
    } else {
      const filteredItems = data.filter(
        (item) => item.category?.name === filter
      );
      setMenuItems(filteredItems);
    }
    setFilter(filter);
  };

  const handleTri = async (from, to) => {
    const menuItemsCopy = [...menuItems];
    menuItemsCopy[from].order = to;
    menuItemsCopy[to].order = from;
    const temp = menuItemsCopy[from];
    menuItemsCopy[from] = menuItemsCopy[to];
    menuItemsCopy[to] = temp;
    setMenuItems(menuItemsCopy);
  };

  const discardTri = () => {
    if (filter === "tout") {
      setMenuItems(data);
    } else {
      const filteredItems = data.filter(
        (item) => item.category?.name === filter
      );
      setMenuItems(filteredItems);
    }
    setTriMode(false);
  };

  const saveTri = async () => {
    setIsLoading(true);
    try {
      const list = menuItems.map((item) => {
        return { id: item._id, order: item.order };
      });
      const response = await menuTri(list);
      if (response.status) {
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setShowFailModel(true);
        setError("Une erreur s'est produite");
      }
    } catch (error) {
      setShowFailModel(true);
      setError("Une erreur s'est produite");
    }
  };

  const deleteItem = async () => {
    setIsLoading(true);
    try {
      const response = await deleteMenuItem(selectedItem);
      if (response.status) {
        setMenuItems((prev) =>
          prev.filter((item) => item._id !== selectedItem)
        );
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    }
  };

  const updateAvailability = async (id) => {
    setIsLoading(true);
    try {
      const response = await updateRestaurantItemAvailability(restaurant, id);
      if (response.status) {
        setMenuItems((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, availability: !item.availability }
              : item
          )
        );
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
      console.log(error);
      setShowFailModel(true);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowDeleteWarningModal(false);
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
      {showCreateItemModal && (
        <CreateItemModal
          setShowCreateItemModal={setShowCreateItemModal}
          setMenuItems={setMenuItems}
        />
      )}
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={
            "Etes-vous sur de vouloir supprimer cet article ? toutes les offres et recompenses associé seront supprimé"
          }
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteItem}
        />
      )}
      {role === "admin" ? (
        <div className="mt-4 flex w-full justify-between">
          <SearchBar />
          <button
            className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold "
            onClick={() => setShowCreateItemModal(true)}
          >
            <FaPlus />
            Ajouter
          </button>
          <Link
            href="/articles/categories"
            className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold"
          >
            Categories
          </Link>
          <Link
            href="/articles/tailles"
            className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold"
          >
            Tailles
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex w-full justify-between">
          <SearchBar />
        </div>
      )}

      <div className="flex w-full justify-between mt-4">
        <button
          className="flex bg-pr items-center w-1/6 justify-between gap-3 rounded-md font-roboto font-bold py-2 px-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span>Filtre</span>
          {showFilters ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
        </button>
        <div className="flex items-center gap-3 ">
          {role === "admin" && (
            <button
              className={
                triMode
                  ? "flex bg-gray-300 items-center  justify-center gap-3 rounded-md font-roboto font-bold py-2 px-8"
                  : "flex bg-pr items-center  justify-center gap-3 rounded-md font-roboto font-bold py-2 px-8"
              }
              onClick={triMode ? discardTri : () => setTriMode(true)}
            >
              <span>{triMode ? "Annuler" : "Modifier Ordre"}</span>
            </button>
          )}
          {triMode && (
            <button
              className="flex bg-pr items-center  justify-center gap-3 rounded-md font-roboto font-bold py-2 px-8"
              onClick={saveTri}
            >
              <span>Sauvegarder</span>
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center  gap-3 mt-4">
          <button
            className={
              filter === "tout"
                ? "flex bg-pr items-center w-1/6 justify-center gap-3 rounded-md font-roboto font-bold py-2"
                : "flex border-2 border-pr items-center w-1/6 justify-center gap-3 rounded-md font-roboto font-bold py-2"
            }
            onClick={() => filterItems("tout")}
          >
            <span>Tout</span>
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => filterItems(category.name)}
              className={
                filter === category.name
                  ? "flex bg-pr items-center w-1/6 justify-center gap-3 rounded-md font-roboto font-bold py-2"
                  : "flex border-2 border-pr items-center w-1/6 justify-center gap-3 rounded-md font-roboto font-bold py-2"
              }
            >
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-4 ">
        {data.length > 0 ? (
          <ul>
            {menuItems.map((menuItem, index) => (
              <li
                key={menuItem._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-50 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <Image
                  src={
                    role === "admin" ? menuItem.image : menuItem.menuItem.image
                  }
                  width={112}
                  height={80}
                  alt="perso"
                  className="w-28 h-20  object-cover"
                />
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {role === "admin" ? menuItem.name : menuItem.menuItem.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {role === "admin"
                    ? menuItem.prices.map((price, i) =>
                        i !== menuItem.prices.length - 1
                          ? price.size[0].toUpperCase() + "/"
                          : price.size[0].toUpperCase()
                      )
                    : menuItem.menuItem.prices.map((price, i) =>
                        i !== menuItem.menuItem.prices.length - 1
                          ? price.size[0].toUpperCase() + "/"
                          : price.size[0].toUpperCase()
                      )}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {role === "admin"
                    ? menuItem.prices.map((price, i) =>
                        i !== menuItem.prices.length - 1
                          ? price.price.toFixed(2) + "/"
                          : price.price.toFixed(2)
                      )
                    : menuItem.menuItem.prices.map((price, i) =>
                        i !== menuItem.menuItem.prices.length - 1
                          ? price.price.toFixed(2) + "/"
                          : price.price.toFixed(2)
                      )}
                  $
                </p>
                {role !== "admin" && (
                  <ToggleButton
                    isToggled={menuItem.availability}
                    setIsToggled={() => updateAvailability(menuItem._id)}
                  />
                )}
                {role === "admin" && (
                  <button className="text-primary-blue">
                    <Link href={`/articles/${menuItem._id}`}>
                      <FaEye size={28} color="" />
                    </Link>
                  </button>
                )}
                {role === "admin" && (
                  <button
                    className="text-warning-red"
                    onClick={() => {
                      setSelectedItem(menuItem._id);
                      setShowDeleteWarningModal(true);
                    }}
                  >
                    <FaTrash size={26} />
                  </button>
                )}
                {triMode && (
                  <div className="flex flex-col justify-between  h-20">
                    <button>
                      <FaCircleChevronUp
                        size={24}
                        onClick={() => handleTri(index, index - 1)}
                      />
                    </button>
                    <button>
                      <FaCircleChevronDown
                        size={24}
                        onClick={() => handleTri(index, index + 1)}
                      />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucun Articles
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default MenuItemsScreen;
