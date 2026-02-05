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
      <div className="bg-white p-5 overflow-y-auto rounded-md flex flex-col w-full max-w-xl shadow-lg">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Modifier une catégorie
            </h1>
            <p className="text-sm text-text-light-gray">
              Mettez à jour l&apos;image et le nom de la catégorie.
            </p>
          </div>
          <button onClick={() => setShowUpdateCategoryModal(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>
        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2 mt-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <p className="text-text-dark-gray font-roboto font-semibold mb-2">
              Image
            </p>
            <div
              onClick={handleImageClick}
              className="border border-dashed border-gray-300 rounded-md p-4 flex items-center gap-3 cursor-pointer hover:border-pr"
            >
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
                width={120}
                height={120}
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="text-sm text-text-dark-gray font-roboto font-semibold">
                  Cliquez pour changer l&apos;image
                </p>
                <p className="text-xs text-text-light-gray">
                  JPG ou PNG, taille recommandée 400x300px.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Nom
            </label>
            <input
              type="text"
              id="name"
              className="border border-gray-300 rounded-md w-full py-2 px-3 focus:outline-none focus:border-pr"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Ex: Pizzas"
            />
          </div>
        </div>
        <div className="w-full flex justify-end mt-6">
          <button
            className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-6 text-white shadow-sm hover:brightness-95"
            onClick={modifierCategory}
          >
            Modifier
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UpdateCategoryModal;
