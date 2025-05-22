"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import SearchBar from "./SearchBar";

import CreateCategoryModal from "./modals/CreateCategoryModal";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { deleteCategoryService } from "@/services/MenuItemServices";
import UpdateCategoryModal from "./modals/UpdateCategoryModal";
import CreateToppingCategoryModal from "./modals/CreateToppingCategoryModal";

const ToppingCategoriesScreen = ({ data }) => {
  const [categories, setCategories] = useState(data);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [showUpdateCategoryModal, setShowUpdateCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);

  const deleteCategory = async () => {
    setIsLoading(true);
    try {
      const response = await deleteCategoryService(selectedCategory);
      if (response.status) {
        setCategories((prev) =>
          prev.filter((category) => category._id !== selectedCategory)
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
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={"Etes-vous sur de vouloir supprimer cette categorie ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteCategory}
        />
      )}
      {showUpdateCategoryModal && (
        <UpdateCategoryModal
          setShowUpdateCategoryModal={setShowUpdateCategoryModal}
          setCategories={setCategories}
          category={selectedCategory}
        />
      )}
      {showCreateCategoryModal && (
        <CreateToppingCategoryModal
          setShowCreateCategoryModal={setShowCreateCategoryModal}
          setCategories={setCategories}
        />
      )}
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="mt-4 flex w-full justify-between">
        <SearchBar />
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold "
          onClick={() => setShowCreateCategoryModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {categories.length > 0 ? (
          <ul>
            {categories.map((category, index) => (
              <li
                key={category._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center gap-10 px-5 py-4"
                    : "bg-white flex items-center gap-10 px-5 py-4"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/3 truncate flex-1">
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

export default ToppingCategoriesScreen;
