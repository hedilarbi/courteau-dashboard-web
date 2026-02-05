import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import DropDown from "../DropDown";
import { MdOutlineClose } from "react-icons/md";

const AddToppingModal = ({
  setShowAddToppingModel,
  customizations,
  setCustomizations,
  toppings,
}) => {
  const [customization, setCustomization] = useState(null);
  const [error, setError] = useState(null);
  const addCustomization = () => {
    setError(null);

    if (customizations.find((c) => c.label === customization.label)) {
      setError("La personnalisation existe déjà");
      return;
    }
    if (!customization) {
      setError("La personnalisation ne peut pas être nulle");
      return;
    }

    setCustomizations([...customizations, customization]);
    setCustomization(null);
    setShowAddToppingModel(false);
  };
  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-md bg-white p-6 relative overflow-y-auto rounded-lg flex flex-col z-30 shadow-lg gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter une personnalisation
            </h1>
            <p className="text-sm text-text-light-gray">
              Choisissez une personnalisation à associer à l&apos;article.
            </p>
          </div>
          <button onClick={() => setShowAddToppingModel(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>
        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="customization"
            className="text-text-dark-gray font-roboto font-semibold"
          >
            Personnalisation
          </label>

          <DropDown
            value={customization}
            setter={setCustomization}
            list={toppings}
            placeholder={"Selectionner une personnalisation"}
          />
        </div>

        <div className="w-full flex justify-end">
          <button
            className="bg-pr text-white rounded-md px-6 py-2.5 mt-2 font-roboto font-semibold shadow-sm hover:brightness-95"
            onClick={addCustomization}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddToppingModal;
