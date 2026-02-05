"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
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
  const [search, setSearch] = useState("");

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

  const filteredSizes = sizes.filter((size) =>
    size.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="mt-4  gap-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-text-dark-gray font-roboto font-semibold text-lg">
              {filteredSizes.length} taille(s)
            </p>
            <p className="text-sm text-text-light-gray">
              Liste des tailles disponibles pour vos articles.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une taille"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-pr"
              />
              <span className="absolute right-3 top-2.5 text-text-light-gray text-xs">
                {search.length > 0 ? filteredSizes.length : ""}
              </span>
            </div>
            <button
              className="flex bg-pr items-center justify-center gap-3 rounded-md font-roboto font-bold py-3 px-4"
              onClick={() => setShowCreateSizeModal(true)}
            >
              <FaPlus />
              Ajouter
            </button>
          </div>
      </div>

        <div className="mt-4 bg-white shadow-default rounded-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-[2fr,0.8fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Nom</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredSizes.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
                  {filteredSizes.map((size) => (
                    <div
                      key={size._id}
                      className="grid grid-cols-[2fr,0.8fr] items-center px-4 py-3 text-sm"
                    >
                      <p className="text-text-dark-gray font-semibold truncate">
                        {size.name}
                      </p>
                      <div className="flex justify-end">
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setShowDeleteWarningModal(true);
                            setSelectedSize(size._id);
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
                  Aucune taille. Ajoutez vos premières tailles pour les associer aux articles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizesScreen;
