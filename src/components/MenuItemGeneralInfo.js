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
    <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto space-x-4 p-4">
      {updateMode ? (
        <div onClick={handleImageClick}>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            ref={inputImageRef}
          />

          <Image
            src={imagePreview || data.image}
            alt="preview"
            width={200}
            height={200}
            className="w-48 h-48 object-cover rounded-md"
          />
        </div>
      ) : (
        <Image
          src={data.image}
          width={200}
          height={200}
          alt="article"
          className="object-cover rounded-md w-48 h-48 "
        />
      )}

      <div className="flex flex-col justify-between text-text-dark-gray w-1/2">
        <div className="flex w-full ">
          <p className="font-semibold">Nom:</p>
          {updateMode ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="ml-2 border-pr border rounded-md px-1 w-full"
            />
          ) : (
            <p className="ml-2"> {data.name}</p>
          )}
        </div>
        <div className="flex w-full">
          <p className="font-semibold">Description:</p>
          {updateMode ? (
            <textarea
              type="textArea"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="ml-2 border-pr border rounded-md px-1 w-full"
            />
          ) : (
            <p className="ml-2">{data.description}</p>
          )}
        </div>
        <div className="flex gap-2 items-center ">
          <p className="font-semibold">Categorie:</p>
          {updateMode ? (
            <DropDown
              value={newCategory}
              setter={setNewCategory}
              list={categoriesNames}
              placeholder={"Selectionner une categorie"}
            />
          ) : (
            <p className="">{data.category?.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemGeneralInfo;
