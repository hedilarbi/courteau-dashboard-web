import React, { useMemo, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import SpinnerModal from "./SpinnerModal";
import FailModal from "./FailModal";
import SuccessModal from "./SuccessModal";
import { createToppingGroup } from "@/services/ToppingGroupsServices";

const CreateToppingGroupModal = ({
  setShowCreateModal,
  setGroups,
  toppings = [],
}) => {
  const [name, setName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const canSubmit = useMemo(() => selected.length > 0 && name.trim(), [name, selected]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Nom du groupe requis");
      setShowFailModel(true);
      return;
    }
    if (isRequired && max !== "" && Number(max) < Number(min)) {
      setError("Max doit être supérieur ou égal à Min");
      setShowFailModel(true);
      return;
    }
    if (selected.length < 1) {
      setError("Sélectionnez au moins une personnalisation");
      setShowFailModel(true);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const payload = {
        name,
        toppings: selected,
        selectionRule: {
          isRequired,
          min: isRequired ? Number(min) : 0,
          max: isRequired && max !== "" ? Number(max) : null,
        },
      };
      const res = await createToppingGroup(payload);
      if (res.status) {
        setGroups((prev) => [...prev, res.data]);
        setShowSuccessModel(true);
        setTimeout(() => {
          setShowSuccessModel(false);
          setShowCreateModal(false);
        }, 1000);
      } else {
        setError(res.message);
        setShowFailModel(true);
      }
    } catch (err) {
      setError(err.message);
      setShowFailModel(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowFailModel(false), 2000);
    }
  };

  return (
    <ModalWrapper zindex={15}>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Nouveau groupe de personnalisations
            </h1>
            <p className="text-sm text-text-light-gray">
              Définissez les règles et les personnalisations associées.
            </p>
          </div>
          <button onClick={() => setShowCreateModal(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>

        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2 mt-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-light-gray">Nom</label>
            <input
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Base pizza"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-light-gray">
              Sélection requise
            </label>
            <input
              type="checkbox"
              checked={isRequired}
              onChange={() => setIsRequired((prev) => !prev)}
              className="h-4 w-4"
            />
          </div>
        </div>

        {isRequired && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-light-gray">Min</label>
              <input
                type="number"
                min={0}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-light-gray">
                Max (vide = illimité)
              </label>
              <input
                type="number"
                min={0}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm text-text-light-gray">
            Personnalisations
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
            {toppings.map((topping) => (
              <label
                key={topping._id}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected.includes(topping._id)}
                  onChange={() => toggleSelect(topping._id)}
                />
                <span className="truncate">{topping.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-end mt-6">
          <button
            className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-6 text-white shadow-sm hover:brightness-95 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            <FaPlus className="inline mr-2" />
            Créer
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateToppingGroupModal;
