import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import SpinnerModal from "./SpinnerModal";
import SuccessModal from "./SuccessModal";
import { createToppingCategory } from "@/services/ToppingsServices";

const CreateToppingCategoryModal = ({
  setShowCreateCategoryModal,
  setCategories,
}) => {
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);

  const addCategory = async () => {
    if (!category) {
      setError("Le champ nom est obligatoire");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await createToppingCategory(category);
      if (response.status) {
        setCategories((prev) => [...prev, response.data]);
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setError(response.message);
      }
    } catch (e) {
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
      <div className=" bg-white w-2/5 p-4 overflow-y-auto rounded-md flex flex-col ">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
            Ajouter une categorie de personnalisation
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
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end mt-14" onClick={addCategory}>
          <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateToppingCategoryModal;
