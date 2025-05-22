"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import SearchBar from "./SearchBar";
import CreateSizeModal from "./modals/CreateSizeModal";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import { deleteSizeService } from "@/services/SizesServices";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";

const SizesScreen = ({ data }) => {
  const [sizes, setSizes] = useState(data);
  const [showCreateSizeModal, setShowCreateSizeModal] = useState(false);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);

  const deleteSize = async () => {
    setIsLoading(true);
    try {
      const response = await deleteSizeService(selectedSize);
      if (response.status) {
        setSizes((prev) => prev.filter((size) => size._id !== selectedSize));
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

  return (
    <>
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={"Etes-vous sur de vouloir supprimer cette taille ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteSize}
        />
      )}
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {showCreateSizeModal && (
        <CreateSizeModal
          setShowCreateSizeModal={setShowCreateSizeModal}
          setSizes={setSizes}
        />
      )}
      <div className="mt-4 flex w-full justify-between">
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold py-3"
          onClick={() => setShowCreateSizeModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {data.length > 0 ? (
          <ul>
            {sizes.map((size, index) => (
              <li
                key={size._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center gap-10 px-5 py-4"
                    : "bg-white flex items-center gap-10 px-5 py-4"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/3 truncate flex-1">
                  {size.name}
                </p>
                <button
                  className="text-warning-red"
                  onClick={() => {
                    setShowDeleteWarningModal(true);
                    setSelectedSize(size._id);
                  }}
                >
                  <FaTrash size={26} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucune Taille
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default SizesScreen;
