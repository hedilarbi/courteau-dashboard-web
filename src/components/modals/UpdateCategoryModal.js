import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import Image from "next/image";
import SpinnerModal from "./SpinnerModal";
import SuccessModal from "./SuccessModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const UpdateCategoryModal = ({
  setShowUpdateCategoryModal,
  setCategories,
  category,
}) => {
  const inputImageRef = useRef();
  const [imageReader, setImageReader] = useState(null);
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);

  const handleImageClick = () => {
    inputImageRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageReader(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const modifierCategory = async () => {
    if (!name) {
      setError("Le champ nom est obligatoire");
      return;
    }

    setError(null);
    setIsLoading(true);
    const formData = new FormData();
    if (image) {
      formData.append("file", image);
      formData.append("fileToDelete", category.image);
    }
    formData.append("name", name);
    try {
      const response = await fetch(
        `${API_URL}/categories/update/${category._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setCategories((prev) =>
        prev.map((cat) => (cat._id === data._id ? data : cat))
      );
      setShowSuccessModel(true);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setError("Une erreur s'est produite");
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowUpdateCategoryModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  return (
    <ModalWrapper zindex={10}>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      <div className=" bg-white p-4 overflow-y-auto rounded-md flex flex-col w-2/5 ">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
            Modifier une categorie
          </h1>
          <button onClick={() => setShowUpdateCategoryModal(false)}>
            <MdOutlineClose size={32} />
          </button>
        </div>
        <div className="h-6 text-center my-4">
          {error && (
            <p className="text-warning-red text-sm font-roboto font-semibold">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center ">
          <div onClick={handleImageClick}>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              ref={inputImageRef}
            />

            <Image
              src={imageReader || category.image}
              alt="preview"
              width={200}
              height={200}
              className="w-24 h-24 object-cover rounded-md"
            />
          </div>

          <div className="ml-4 flex flex-col justify-between flex-1">
            <div className=" flex gap-2 items-center ">
              <label
                htmlFor="name"
                className="text-text-dark-gray font-roboto font-semibold"
              >
                Nom
              </label>
              <input
                type="text"
                id="name"
                className="border border-gray-300 rounded-md w-full py-1 px-2 "
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          </div>
        </div>
        <div
          className="w-full flex justify-end mt-8    "
          onClick={modifierCategory}
        >
          <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
            Modifier
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UpdateCategoryModal;
