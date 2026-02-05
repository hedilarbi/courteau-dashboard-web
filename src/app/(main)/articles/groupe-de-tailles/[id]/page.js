"use client";
import NavBackButton from "@/components/NavBackButton";
import Spinner from "@/components/spinner/Spinner";
import {
  getSizeGroup,
  updateSizeGroup,
} from "@/services/sizesGroupeServices";
import { getSizes } from "@/services/SizesServices";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdAdd, MdCheck, MdOutlineClose } from "react-icons/md";

const Page = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [name, setName] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [initialSizeIds, setInitialSizeIds] = useState([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [sizesResponse, groupResponse] = await Promise.all([
        getSizes(),
        getSizeGroup(id),
      ]);

      if (sizesResponse?.status) {
        setAvailableSizes(sizesResponse.data);
      } else {
        setError(sizesResponse?.message || "Impossible de récupérer les tailles");
      }

      if (groupResponse?.status) {
        const fetchedSizes = groupResponse.data?.sizes || [];
        setName(groupResponse.data?.name || "");
        setSelectedSizes(fetchedSizes);
        setInitialSizeIds(fetchedSizes.map((size) => size._id));
      } else {
        setError(groupResponse?.message || "Impossible de récupérer ce groupe");
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!error && !successMessage) return;

    const timer = setTimeout(() => {
      setError(null);
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, successMessage]);

  const handleAddSize = (size) => {
    setSelectedSizes((prev) => {
      if (prev.find((item) => item._id === size._id)) return prev;
      return [...prev, size];
    });
  };

  const handleRemoveSize = (id) => {
    setSelectedSizes((prev) => prev.filter((size) => size._id !== id));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage("");

    const formattedName = name.trim();
    if (!formattedName) {
      setError("Veuillez ajouter un nom au groupe");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Ajoutez au moins une taille au groupe");
      return;
    }

    const selectedIds = selectedSizes.map((size) => size._id);
    const addSizes = selectedIds.filter((sid) => !initialSizeIds.includes(sid));
    const removeSizes = initialSizeIds.filter(
      (sid) => !selectedIds.includes(sid)
    );

    try {
      setIsSubmitting(true);
      const response = await updateSizeGroup(
        id,
        formattedName,
        addSizes,
        removeSizes
      );

      if (response.status) {
        setSuccessMessage("Groupe de tailles mis à jour avec succès");
        setInitialSizeIds(selectedIds);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSizes = availableSizes.filter((size) => {
    const sizeName = size?.name?.toLowerCase() || "";
    return sizeName.includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 flex flex-col relative justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-h-screen p-4 h-screen">
      <NavBackButton />
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Modifier un groupe de tailles
      </h1>
      <div className="bg-white shadow-default rounded-md mt-6 p-5 h-[calc(100vh-150px)] flex flex-col overflow-hidden">
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
          {(error || successMessage) && (
            <div className="flex flex-col gap-2">
              {error && (
                <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="border border-green-300 bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Nom du groupe
            </label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Ex: Pizzas familiales"
              className="border border-gray-300 rounded-md w-full md:w-1/2 py-2 px-3 focus:outline-none focus:border-pr"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mt-4">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                    Tailles disponibles
                  </h2>
                  <p className="text-sm text-text-light-gray">
                    Cliquer pour ajouter au groupe
                  </p>
                </div>
                <div className="w-full sm:w-1/2">
                  <input
                    type="search"
                    placeholder="Rechercher une taille"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pr"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 h-[calc(100vh-450px)] overflow-y-auto content-start items-start auto-rows-min">
                {filteredSizes.length > 0 ? (
                  filteredSizes.map((size) => {
                    const isSelected = selectedSizes.some(
                      (item) => item._id === size._id
                    );
                    return (
                      <button
                        key={size._id}
                        type="button"
                        onClick={() => handleAddSize(size)}
                        disabled={isSelected}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 transition ${
                          isSelected
                            ? "bg-pr text-white border-pr cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-pr hover:bg-pr hover:bg-opacity-10"
                        }`}
                      >
                        <span className="text-left font-roboto font-medium truncate">
                          {size.name}
                        </span>
                        {isSelected ? (
                          <MdCheck size={20} />
                        ) : (
                          <MdAdd size={20} />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-text-light-gray col-span-full">
                    Aucune taille trouvée
                  </p>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-[#fafafa]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                    Tailles sélectionnées
                  </h2>
                  <p className="text-sm text-text-light-gray">
                    {selectedSizes.length} sélectionnée(s)
                  </p>
                </div>
              </div>
              {selectedSizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSizes.map((size) => (
                    <span
                      key={size._id}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-roboto"
                    >
                      {size.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(size._id)}
                        className="text-text-light-gray hover:text-warning-red transition"
                      >
                        <MdOutlineClose size={18} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-6 text-center">
                  <p className="text-text-light-gray text-sm">
                    Aucune taille sélectionnée. Ajoutez des tailles à partir de
                    la liste de gauche.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-pr text-white font-roboto font-semibold rounded-md px-6 py-3 w-full sm:w-auto disabled:opacity-70"
            >
              {isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
