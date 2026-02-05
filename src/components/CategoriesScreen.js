"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaPen } from "react-icons/fa";
import Image from "next/image";
import CreateCategoryModal from "./modals/CreateCategoryModal";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { deleteCategoryService } from "@/services/MenuItemServices";
import UpdateCategoryModal from "./modals/UpdateCategoryModal";
import { HiMiniPencil } from "react-icons/hi2";

const CategoriesScreen = ({ data }) => {
  const [categories, setCategories] = useState(data);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [showUpdateCategoryModal, setShowUpdateCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

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

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );
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
        <CreateCategoryModal
          setShowCreateCategoryModal={setShowCreateCategoryModal}
          setCategories={setCategories}
        />
      )}
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="mt-4 gap-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-text-dark-gray font-roboto font-semibold text-lg">
              {filteredCategories.length} catégorie(s)
            </p>
            <p className="text-sm text-text-light-gray">
              Gérez l&apos;image et le nom de vos catégories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une catégorie"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-pr"
              />
              <span className="absolute right-3 top-2.5 text-text-light-gray text-xs">
                {search.length > 0 ? filteredCategories.length : ""}
              </span>
            </div>
            <button
              className="flex bg-pr items-center justify-center gap-3 rounded-md font-roboto font-bold py-2 px-4"
              onClick={() => setShowCreateCategoryModal(true)}
            >
              <FaPlus />
              Ajouter
            </button>
          </div>
        </div>

        <div className="bg-white shadow-default rounded-md border border-gray-100 mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[140px,1.6fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Image</span>
                <span>Nom</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredCategories.length > 0 ? (
                <div className="h-[calc(100vh-300px)] overflow-y-auto divide-y divide-gray-100">
                  {filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className="grid grid-cols-[140px,1.6fr,0.6fr] items-center px-4 py-3 text-sm"
                    >
                      <div className="h-20 w-32 relative overflow-hidden rounded-md border border-gray-100">
                        <Image
                          src={category.image}
                          width={128}
                          height={96}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-text-dark-gray font-semibold truncate">
                        {category.name}
                      </p>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowUpdateCategoryModal(true);
                          }}
                        >
                          <HiMiniPencil size={18} />
                        </button>
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setSelectedCategory(category._id);
                            setShowDeleteWarningModal(true);
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucune catégorie. Créez votre première catégorie pour
                  organiser vos articles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesScreen;
