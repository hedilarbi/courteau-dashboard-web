import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import Image from "next/image";
import SpinnerModal from "./SpinnerModal";
import SuccessModal from "./SuccessModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CreateCategoryModal = ({ setShowCreateCategoryModal, setCategories }) => {
  const inputImageRef = useRef();
  const [imageReader, setImageReader] = useState(null);
  const [name, setName] = useState("");
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

  const createCategory = async () => {
    if (!name) {
      setError("Le champ nom est obligatoire");
      return;
    }
    if (!image) {
      setError("Le champ image est obligatoire");
      return;
    }
    setError(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", image);
    try {
      const response = await fetch(`${API_URL}/categories/create`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setCategories((prev) => [...prev, data]);
      setShowSuccessModel(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateCategoryModal(false);
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
            Ajouter une categorie
          </h1>
          <button onClick={() => setShowCreateCategoryModal(false)}>
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
            {imageReader ? (
              <Image
                src={imageReader}
                alt="preview"
                width={200}
                height={200}
                className="w-24 h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-md flex justify-center items-center">
                <MdAddAPhoto size={32} />
              </div>
            )}
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
              />
            </div>
          </div>
        </div>
        <div
          className="w-full flex justify-end mt-8    "
          onClick={createCategory}
        >
          <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateCategoryModal;
