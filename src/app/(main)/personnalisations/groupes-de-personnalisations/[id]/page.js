"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavBackButton from "@/components/NavBackButton";
import Spinner from "@/components/spinner/Spinner";
import { MdAdd, MdCheck, MdOutlineClose } from "react-icons/md";
import { getToppings } from "@/services/ToppingsServices";
import {
  deleteToppingGroup,
  getToppingGroup,
  updateToppingGroup,
} from "@/services/ToppingGroupsServices";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import ToastNotification from "@/components/ToastNotification";

const Page = ({ params }) => {
  const { id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [group, setGroup] = useState(null);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupRes, toppingsRes] = await Promise.all([
        getToppingGroup(id),
        getToppings(),
      ]);
      if (groupRes.status) {
        setGroup(groupRes.data);
      } else {
        setError(groupRes.message || "Impossible de récupérer le groupe");
      }
      if (toppingsRes.status) {
        setAvailable(toppingsRes.data || []);
      }
    } catch (err) {
      setError("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!error && !toastData.show) return;
    const timer = setTimeout(
      () => setToastData((prev) => ({ ...prev, show: false })),
      3000
    );
    return () => clearTimeout(timer);
  }, [error, toastData.show]);

  const selected = useMemo(() => group?.toppings || [], [group]);
  const isRequired = group?.selectionRule?.isRequired || false;
  const min = group?.selectionRule?.min ?? 0;
  const max = group?.selectionRule?.max ?? "";

  const filtered = available.filter((t) =>
    (t.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (topping) => {
    if (!group) return;
    if (selected.find((t) => (t._id || t) === topping._id)) return;
    setGroup((prev) => ({
      ...prev,
      toppings: [...(prev?.toppings || []), topping],
    }));
  };

  const handleRemove = (id) => {
    if (!group) return;
    setGroup((prev) => ({
      ...prev,
      toppings: (prev?.toppings || []).filter(
        (t) => (t._id || t) !== id
      ),
    }));
  };

  const handleToggleRequired = () => {
    if (!group) return;
    setGroup((prev) => ({
      ...prev,
      selectionRule: {
        ...prev.selectionRule,
        isRequired: !prev.selectionRule?.isRequired,
      },
    }));
  };

  const handleRuleChange = (key, value) => {
    if (!group) return;
    setGroup((prev) => ({
      ...prev,
      selectionRule: {
        ...prev.selectionRule,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!group?.name?.trim()) {
      setToastData({
        show: true,
        type: "error",
        message: "Le nom du groupe est requis",
      });
      return;
    }
    if (group.selectionRule?.isRequired && max !== "" && Number(max) < Number(min)) {
      setToastData({
        show: true,
        type: "error",
        message: "Max doit être supérieur ou égal au Min",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: group.name,
        toppings: selected.map((t) => t._id || t),
        selectionRule: {
          isRequired: group.selectionRule?.isRequired || false,
          min: group.selectionRule?.isRequired ? Number(min) : 0,
          max:
            group.selectionRule?.isRequired && max !== ""
              ? Number(max)
              : null,
        },
      };
      const res = await updateToppingGroup(id, payload);
      if (res.status) {
        setGroup(res.data);
        setToastData({
          show: true,
          type: "success",
          message: "Groupe mis à jour",
        });
      } else {
        setToastData({
          show: true,
          type: "error",
          message: res.message || "Erreur lors de la mise à jour",
        });
      }
    } catch (err) {
      setToastData({
        show: true,
        type: "error",
        message: "Erreur lors de la mise à jour",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteToppingGroup(id);
      if (res.status) {
        window.history.back();
      } else {
        setToastData({
          show: true,
          type: "error",
          message: res.message || "Erreur lors de la suppression",
        });
      }
    } catch (err) {
      setToastData({
        show: true,
        type: "error",
        message: "Erreur lors de la suppression",
      });
    } finally {
      setShowDeleteWarningModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 flex flex-col relative justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="w-full h-full p-4 flex flex-col relative justify-center items-center">
        <p className="text-red-500 font-semibold">
          {error || "Groupe introuvable"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-h-screen p-4 h-screen">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={
            "Etes-vous sur de vouloir supprimer ce groupe de personnalisations ?"
          }
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={handleDelete}
        />
      )}
      <NavBackButton />
      <div className="flex items-center justify-between mt-2">
        <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
          Modifier le groupe
        </h1>
        <button
          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
          onClick={() => setShowDeleteWarningModal(true)}
        >
          Supprimer
        </button>
      </div>
      <div className="bg-white shadow-default rounded-md mt-6 p-5 h-[calc(100vh-160px)] flex flex-col overflow-hidden">
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
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
              value={group.name}
              placeholder="Nom du groupe"
              className="border border-gray-300 rounded-md w-full md:w-1/2 py-2 px-3 focus:outline-none focus:border-pr"
              onChange={(e) =>
                setGroup((prev) => ({ ...prev, name: e.target.value }))
              }
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
                      (item) => (item._id || item) === topping._id
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
                      key={topping._id || topping}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-roboto"
                    >
                      {topping.name || topping}
                      <button
                        type="button"
                        onClick={() => handleRemove(topping._id || topping)}
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
                    onChange={handleToggleRequired}
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
                        onChange={(e) => handleRuleChange("min", e.target.value)}
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
                        onChange={(e) => handleRuleChange("max", e.target.value)}
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
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-pr text-white font-roboto font-semibold rounded-md px-6 py-3 w-full sm:w-auto disabled:opacity-70"
            >
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
