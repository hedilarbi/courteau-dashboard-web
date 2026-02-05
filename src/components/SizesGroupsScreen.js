"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

import DeleteWarningModal from "./modals/DeleteWarningModal";

import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { deleteSizeGroupService } from "@/services/sizesGroupeServices";
import { HiMiniPencil } from "react-icons/hi2";
import Link from "next/link";

const SizesGroupsScreen = ({ data }) => {
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
      const response = await deleteSizeGroupService(selectedSize);
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

  const filteredGroups = sizes.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={"Etes-vous sur de vouloir supprimer ce groupe de tailles ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteSize}
        />
      )}
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}

      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-text-dark-gray font-roboto font-semibold text-lg">
              {filteredGroups.length} groupe(s)
            </p>
            <p className="text-sm text-text-light-gray">
              Gérez les groupes et leurs tailles associées
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un groupe"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-pr"
              />
              <span className="absolute right-3 top-2.5 text-text-light-gray text-xs">
                {search.length > 0 ? `${filteredGroups.length}` : ""}
              </span>
            </div>
            <Link
              className="flex bg-pr items-center justify-center gap-3 rounded-md font-roboto font-bold py-2 px-4"
              href="/articles/groupe-de-tailles/ajouter"
            >
              <FaPlus />
              Ajouter
            </Link>
            <Link
              href="/articles/tailles"
              className=" bg-[#111827] text-white px-4 rounded-md font-roboto font-bold py-2"
            >
              Gestion des tailles
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-default rounded-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.6fr,0.6fr,1.6fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Nom</span>
                <span>Tailles</span>
                <span>Aperçu</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredGroups.length > 0 ? (
                <div className="h-[calc(100vh-320px)] overflow-y-auto divide-y divide-gray-100">
                  {filteredGroups.map((group) => {
                    const sizeCount = Array.isArray(group.sizes)
                      ? group.sizes.length
                      : 0;
                    const previewSizes = Array.isArray(group.sizes)
                      ? group.sizes.slice(0, 3)
                      : [];

                    return (
                      <div
                        key={group._id}
                        className="grid grid-cols-[1.6fr,0.6fr,1.6fr,0.6fr] items-center px-4 py-3 text-sm"
                      >
                        <p className="text-text-dark-gray font-semibold truncate">
                          {group.name}
                        </p>
                        <span className="text-xs bg-pr text-white rounded-full px-2 py-0.5 font-roboto w-fit">
                          {sizeCount} taille(s)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {previewSizes.length > 0 ? (
                            <>
                              {previewSizes.map((s) => (
                                <span
                                  key={s._id}
                                  className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2 py-1 text-text-dark-gray"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {sizeCount > previewSizes.length && (
                                <span className="text-xs text-text-light-gray">
                                  +{sizeCount - previewSizes.length} autres
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-text-light-gray">
                              Aucune taille
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <Link
                            className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                            href={`/articles/groupe-de-tailles/${group._id}`}
                          >
                            <HiMiniPencil size={16} />
                          </Link>
                          <button
                            className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                            onClick={() => {
                              setShowDeleteWarningModal(true);
                              setSelectedSize(group._id);
                            }}
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucun groupe de tailles. Créez votre premier groupe pour
                  organiser vos tailles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizesGroupsScreen;
