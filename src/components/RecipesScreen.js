"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { HiMiniPencil } from "react-icons/hi2";
import CreateRecipeModal from "./modals/CreateRecipeModal";
import UpdateRecipeModal from "./modals/UpdateRecipeModal";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { deleteRecipeService } from "@/services/RecipesServices";

const RecipesScreen = ({ data, menuItems }) => {
  const [recipes, setRecipes] = useState(data || []);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);

  // Derive unique categories from recipes
  const uniqueCategories = recipes.reduce((acc, recipe) => {
    if (recipe.category && !acc.find((c) => c._id === recipe.category._id)) {
      acc.push(recipe.category);
    }
    return acc;
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.item?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      recipe.category?._id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { status, message } = await deleteRecipeService(selectedRecipe);
      if (status) {
        setRecipes((prev) => prev.filter((r) => r._id !== selectedRecipe));
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setError(message || "Une erreur s'est produite");
        setShowFailModel(true);
      }
    } catch (err) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowDeleteModal(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => setShowFailModel(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showFailModel]);

  return (
    <>
      {showDeleteModal && (
        <DeleteWarningModal
          message="Etes-vous sur de vouloir supprimer cette recette ?"
          setShowDeleteWarningModal={setShowDeleteModal}
          action={handleDelete}
        />
      )}
      {showCreateModal && (
        <CreateRecipeModal
          setShowCreateRecipeModal={setShowCreateModal}
          setRecipes={setRecipes}
          menuItems={menuItems}
        />
      )}
      {showUpdateModal && selectedRecipe && (
        <UpdateRecipeModal
          setShowUpdateRecipeModal={setShowUpdateModal}
          setRecipes={setRecipes}
          recipe={selectedRecipe}
          menuItems={menuItems}
        />
      )}
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}

      <div className="mt-4 gap-4 w-full">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-text-dark-gray font-roboto font-semibold text-lg">
              {filteredRecipes.length} recette(s)
            </p>
            <p className="text-sm text-text-light-gray">
              Gérez les recettes associées à vos articles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un article"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-pr"
              />
              <span className="absolute right-3 top-2.5 text-text-light-gray text-xs">
                {search.length > 0 ? filteredRecipes.length : ""}
              </span>
            </div>

            {/* Category filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pr bg-white w-full sm:w-48"
            >
              <option value="all">Toutes les catégories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Add button */}
            <button
              className="flex bg-pr items-center justify-center gap-3 rounded-md font-roboto font-bold py-2 px-4 hover:brightness-95 transition"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus />
              Ajouter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-default rounded-md border border-gray-100 mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              {/* Header */}
              <div className="grid grid-cols-[2fr,1.5fr,2fr,0.8fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Article</span>
                <span>Catégorie</span>
                <span>Ingrédients</span>
                <span className="text-right">Actions</span>
              </div>

              {filteredRecipes.length > 0 ? (
                <div className="h-[calc(100vh-320px)] overflow-y-auto divide-y divide-gray-100">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe._id}
                      className="grid grid-cols-[2fr,1.5fr,2fr,0.8fr] items-center px-4 py-3 text-sm"
                    >
                      {/* Article */}
                      <p className="text-text-dark-gray font-semibold truncate">
                        {recipe.item?.name || "—"}
                      </p>

                      {/* Catégorie */}
                      <span className="inline-flex">
                        <span className="bg-pr/10 text-pr text-xs font-roboto font-semibold px-2.5 py-1 rounded-full truncate max-w-[140px]">
                          {recipe.category?.name || "—"}
                        </span>
                      </span>

                      {/* Ingrédients */}
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients?.length > 0 ? (
                          recipe.ingredients.slice(0, 3).map((ing, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-text-light-gray text-xs px-2 py-0.5 rounded-full"
                            >
                              {ing}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-light-gray text-xs">—</span>
                        )}
                        {recipe.ingredients?.length > 3 && (
                          <span className="bg-gray-100 text-text-light-gray text-xs px-2 py-0.5 rounded-full">
                            +{recipe.ingredients.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setShowUpdateModal(true);
                          }}
                        >
                          <HiMiniPencil size={18} />
                        </button>
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setSelectedRecipe(recipe._id);
                            setShowDeleteModal(true);
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
                  Aucune recette trouvée. Créez votre première recette.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipesScreen;
