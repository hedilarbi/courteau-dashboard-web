"use client";
import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import SpinnerModal from "./SpinnerModal";
import SuccessModal from "./SuccessModal";
import DropDown from "@/components/DropDown";
import { MdOutlineClose } from "react-icons/md";
import { FaPlus, FaTrash } from "react-icons/fa";
import { createRecipeService } from "@/services/RecipesServices";

const CreateRecipeModal = ({ setShowCreateRecipeModal, setRecipes, menuItems }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [showIngredientInput, setShowIngredientInput] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);

  const articlesList = (menuItems || []).map((item) => ({
    label: item.name,
    value: item._id,
    category: item.category,
  }));

  const handleAddIngredient = () => {
    if (!showIngredientInput) {
      setShowIngredientInput(true);
      return;
    }
    if (ingredientInput.trim()) {
      setIngredients((prev) => [...prev, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!selectedArticle) {
      setError("Veuillez sélectionner un article");
      return;
    }
    if (!selectedArticle.category) {
      setError("L'article sélectionné n'a pas de catégorie");
      return;
    }
    setError(null);
    setIsLoading(true);
    const { status, data, message } = await createRecipeService(
      selectedArticle.value,
      selectedArticle.category._id,
      ingredients,
      instruction
    );
    setIsLoading(false);
    if (status) {
      setRecipes((prev) => [...prev, data]);
      setShowSuccessModel(true);
    } else {
      setError(message || "Une erreur s'est produite");
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateRecipeModal(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  return (
    <ModalWrapper zindex={10}>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      <div className="bg-white p-5 overflow-y-auto rounded-md flex flex-col w-full max-w-xl shadow-lg my-4">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter une recette
            </h1>
            <p className="text-sm text-text-light-gray">
              Associez un article à sa recette et ses ingrédients.
            </p>
          </div>
          <button onClick={() => setShowCreateRecipeModal(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>

        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2 mt-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {/* Article */}
          <div className="flex flex-col gap-2">
            <label className="text-text-dark-gray font-roboto font-semibold">
              Article
            </label>
            <DropDown
              value={selectedArticle}
              setter={setSelectedArticle}
              list={articlesList}
              placeholder="Sélectionner un article"
            />
          </div>

          {/* Catégorie (auto) */}
          <div className="flex flex-col gap-2">
            <label className="text-text-dark-gray font-roboto font-semibold">
              Catégorie
            </label>
            <div className="border border-gray-200 bg-gray-50 rounded-md py-2 px-3 text-sm text-text-light-gray">
              {selectedArticle?.category?.name || "Automatiquement définie par l'article"}
            </div>
          </div>

          {/* Ingrédients */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-text-dark-gray font-roboto font-semibold">
                Ingrédients
              </label>
              <button
                onClick={handleAddIngredient}
                className="flex items-center gap-1.5 bg-pr/10 text-pr hover:bg-pr/20 transition rounded-md px-3 py-1.5 text-sm font-roboto font-semibold"
              >
                <FaPlus size={12} />
                {showIngredientInput && ingredientInput.trim() ? "Ajouter" : "Nouveau"}
              </button>
            </div>

            {showIngredientInput && (
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddIngredient();
                }}
                placeholder="Ex: Farine de blé"
                className="border border-gray-300 rounded-md w-full py-2 px-3 text-sm focus:outline-none focus:border-pr"
                autoFocus
              />
            )}

            {ingredients.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md px-3 py-2"
                  >
                    <span className="text-sm text-text-dark-gray">{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-warning-red hover:text-warning-red/70 transition"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {ingredients.length === 0 && !showIngredientInput && (
              <p className="text-xs text-text-light-gray">
                Aucun ingrédient ajouté.
              </p>
            )}
          </div>

          {/* Instruction */}
          <div className="flex flex-col gap-2">
            <label className="text-text-dark-gray font-roboto font-semibold">
              Instruction
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Décrivez les étapes de préparation..."
              rows={4}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-sm focus:outline-none focus:border-pr resize-none"
            />
          </div>
        </div>

        <div className="w-full flex justify-end mt-6">
          <button
            className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-6 shadow-sm hover:brightness-95"
            onClick={handleCreate}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateRecipeModal;
