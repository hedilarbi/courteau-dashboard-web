"use client";

import React, { useEffect, useState } from "react";
import NavBackButton from "@/components/NavBackButton";
import Spinner from "@/components/spinner/Spinner";
import { getToppings } from "@/services/ToppingsServices";
import { createToppingGroup } from "@/services/ToppingGroupsServices";
import { MdAdd, MdCheck, MdOutlineClose } from "react-icons/md";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [name, setName] = useState("");
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState("");

  const fetchToppings = async () => {
    setIsLoading(true);
    try {
      const res = await getToppings();
      if (res.status) {
        setAvailable(res.data || []);
        setError(null);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  useEffect(() => {
    if (!error && !successMessage) return;
    const timer = setTimeout(() => {
      setError(null);
      setSuccessMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, successMessage]);

  const handleAdd = (topping) => {
    setSelected((prev) => {
      if (prev.find((item) => item._id === topping._id)) return prev;
      return [...prev, topping];
    });
  };

  const handleRemove = (id) => {
    setSelected((prev) => prev.filter((t) => t._id !== id));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage("");
    if (!name.trim()) {
      setError("Veuillez ajouter un nom au groupe");
      return;
    }
    if (selected.length === 0) {
      setError("Ajoutez au moins une personnalisation au groupe");
      return;
    }
    if (isRequired && max !== "" && Number(max) < Number(min)) {
      setError("Max doit être supérieur ou égal au Min");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        toppings: selected.map((t) => t._id),
        selectionRule: {
          isRequired,
          min: isRequired ? Number(min) : 0,
          max: isRequired && max !== "" ? Number(max) : null,
        },
      };
      const res = await createToppingGroup(payload);
      if (res.status) {
        setSuccessMessage("Groupe de personnalisations créé avec succès");
        setName("");
        setSelected([]);
        setIsRequired(false);
        setMin(0);
        setMax("");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = available.filter((t) =>
    (t.name || "").toLowerCase().includes(search.toLowerCase())
  );

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
        Ajouter un groupe de personnalisations
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
              placeholder="Ex: Base pizza"
              className="border border-gray-300 rounded-md w-full md:w-1/2 py-2 px-3 focus:outline-none focus:border-pr"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mt-2">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                    Personnalisations disponibles
                  </h2>
                  <p className="text-sm text-text-light-gray">
                    Cliquer pour ajouter au groupe
                  </p>
                </div>
                <div className="w-full sm:w-1/2">
                  <input
                    type="search"
                    placeholder="Rechercher une personnalisation"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pr"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 h-[calc(100vh-450px)] overflow-y-auto content-start items-start auto-rows-min">
                {filtered.length > 0 ? (
                  filtered.map((topping) => {
                    const isSelected = selected.some(
                      (item) => item._id === topping._id
                    );
                    return (
                      <button
                        key={topping._id}
                        type="button"
                        onClick={() => handleAdd(topping)}
                        disabled={isSelected}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 transition ${
                          isSelected
                            ? "bg-pr text-white border-pr cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-pr hover:bg-pr hover:bg-opacity-10"
                        }`}
                      >
                        <span className="text-left font-roboto font-medium truncate">
                          {topping.name}
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
                    Aucune personnalisation trouvée
                  </p>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-[#fafafa] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                    Personnalisations sélectionnées
                  </h2>
                  <p className="text-sm text-text-light-gray">
                    {selected.length} sélectionnée(s)
                  </p>
                </div>
              </div>
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.map((topping) => (
                    <span
                      key={topping._id}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-roboto"
                    >
                      {topping.name}
                      <button
                        type="button"
                        onClick={() => handleRemove(topping._id)}
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
                    Aucune personnalisation sélectionnée. Ajoutez-les depuis la
                    liste de gauche.
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={() => setIsRequired((prev) => !prev)}
                    className="h-4 w-4"
                  />
                  <p className="text-sm text-text-dark-gray font-semibold">
                    Sélection requise
                  </p>
                </div>
                {isRequired && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-text-light-gray">
                        Min
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-text-light-gray">
                        Max (vide = illimité)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-pr text-white font-roboto font-semibold rounded-md px-6 py-3 w-full sm:w-auto disabled:opacity-70"
            >
              {isSubmitting ? "Création en cours..." : "Créer le groupe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
