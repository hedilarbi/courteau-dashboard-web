import Image from "next/image";
import React, { useRef, useState } from "react";
import DropDown from "./DropDown";

const MenuItemGeneralInfo = ({
  data,
  updateMode,
  setNewName,
  newName,
  newDescription,
  setNewDescription,
  categoriesNames,
  newCategory,
  setNewCategory,
  newImage,
  setNewImage,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const inputImageRef = useRef();
  const handleImageClick = () => {
    inputImageRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="md:w-1/3 w-full">
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          ref={inputImageRef}
        />
        <div
          className={`relative rounded-xl border border-gray-200 overflow-hidden shadow-sm ${
            updateMode ? "cursor-pointer group" : ""
          }`}
          onClick={updateMode ? handleImageClick : undefined}
        >
          <Image
            src={imagePreview || data.image}
            alt={data.name}
            width={800}
            height={600}
            className="w-full h-full object-cover max-h-64"
          />
          {updateMode && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-semibold">
              Changer l&apos;image
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 text-text-dark-gray">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-light-gray">Nom</label>
          {updateMode ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
              placeholder="Nom de l'article"
            />
          ) : (
            <p className="text-lg font-semibold">{data.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-light-gray">Description</label>
          {updateMode ? (
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr min-h-[120px]"
              placeholder="Décrivez l'article"
            />
          ) : (
            <p className="text-sm leading-relaxed">
              {data.description || "Aucune description renseignée"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-light-gray">Catégorie</label>
          {updateMode ? (
            <DropDown
              value={newCategory}
              setter={setNewCategory}
              list={categoriesNames}
              placeholder={"Selectionner une categorie"}
            />
          ) : (
            <p className="font-semibold">
              {data.category?.name || "Non catégorisé"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemGeneralInfo;
