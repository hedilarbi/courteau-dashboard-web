"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaEye, FaTrash, FaPlus } from "react-icons/fa";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import Link from "next/link";
import CreateToppingCategoryModal from "./modals/CreateToppingCategoryModal";

const ToppingsCategoriesScreen = ({ data }) => {
  const [categories, setCategories] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateToppingCategoryModal, setShowCreateToppingCategoryModal] =
    useState(false);

  const deleteTopping = async () => {
    //  setIsLoading(true);
    // try {
    //   const response = await deleteMenuItem(selectedItem);
    //   if (response.status) {
    //     setMenuItems((prev) =>
    //       prev.filter((item) => item._id !== selectedItem)
    //     );
    //     setIsLoading(false);
    //     setShowSuccessModel(true);
    //   } else {
    //     setIsLoading(false);
    //     setError(response.message);
    //     setShowFailModel(true);
    //   }
    // } catch (error) {
    //   setIsLoading(false);
    //   setError("Une erreur s'est produite");
    //   setShowFailModel(true);
    // }
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
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={
            "Etes-vous sur de vouloir supprimer cette personnalisation ?"
          }
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteTopping}
        />
      )}
      {showCreateToppingCategoryModal && (
        <CreateToppingCategoryModal
          setShowCreateToppingCategoryModal={setShowCreateToppingCategoryModal}
          setCategories={setCategories}
        />
      )}
      <div className="mt-4 flex w-full justify-between">
        <SearchBar />
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold "
          onClick={() => setShowCreateToppingCategoryModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-4 ">
        {data.length > 0 ? (
          <ul>
            {categories.map((category, index) => (
              <li
                key={category._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {category.name}
                </p>

                <button
                  className="text-warning-red"
                  onClick={() => {
                    setSelectedCategory(category._id);
                    setShowDeleteWarningModal(true);
                  }}
                >
                  <FaTrash size={26} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucune Categorie
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default ToppingsCategoriesScreen;
