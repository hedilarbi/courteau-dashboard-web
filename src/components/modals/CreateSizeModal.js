import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import SpinnerModal from "./SpinnerModal";
import { createSize } from "@/services/SizesServices";
import SuccessModal from "./SuccessModal";

const CreateSizeModal = ({ setShowCreateSizeModal, setSizes }) => {
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);

  const addSize = async () => {
    if (!size) {
      setError("Le champ nom est obligatoire");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await createSize(size);

      if (response.status) {
        setSizes((prev) => [...prev, response.data]);
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
        setShowCreateSizeModal(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);

  return (
    <ModalWrapper zindex={10}>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      <div className="bg-white w-full max-w-md p-5 overflow-y-auto rounded-md flex flex-col shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter une taille
            </h1>
            <p className="text-sm text-text-light-gray">
              Créez une taille pour l&apos;associer aux articles.
            </p>
          </div>
          <button onClick={() => setShowCreateSizeModal(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>
        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2 mt-4">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2 mt-4">
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
            onChange={(e) => setSize(e.target.value)}
            placeholder="Ex: Large"
          />
        </div>
        <div className="w-full flex justify-end mt-6">
          <button
            className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-6 text-white shadow-sm hover:brightness-95"
            onClick={addSize}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateSizeModal;
