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
import { deleteToppingCategoryService } from "@/services/ToppingsServices";

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
      console.log("Selected Category:", selectedCategory);
      const response = await deleteToppingCategoryService(selectedCategory);
      if (response.status) {
        setCategories((prev) =>
          prev.filter((category) => category._id !== selectedCategory)
        );
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        console.log(response.message);
        setError(response.message.message);
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
      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="bg-white rounded-xl shadow-default p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between  gap-3">
          <div>
            <p className="text-lg font-semibold text-text-dark-gray">
              Catégories de personnalisations
            </p>
            <p className="text-sm text-text-light-gray">
              Structurez vos options par famille.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 ">
            <button
              className="flex bg-pr items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-white shadow-sm hover:brightness-95 transition"
              onClick={() => setShowCreateCategoryModal(true)}
            >
              <FaPlus />
              Ajouter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[2fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Nom</span>
                <span className="text-right">Actions</span>
              </div>
              {categories.length > 0 ? (
                <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="grid grid-cols-[2fr,0.6fr] items-center px-4 py-3 text-sm"
                    >
                      <p className="text-text-dark-gray font-semibold truncate">
                        {category.name}
                      </p>
                      <div className="flex justify-end">
                        <button
                          className="text-warning-red hover:text-red-700"
                          onClick={() => {
                            setSelectedCategory(category._id);
                            setShowDeleteWarningModal(true);
                          }}
                        >
                          <FaTrash size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucune catégorie enregistrée.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToppingCategoriesScreen;
