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
      <div className="w-1/3 bg-white p-4 h-2/5 relative overflow-y-auto rounded-md flex flex-col z-30">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-roboto font-semibold text-text-dark-gray">
            Ajouter un article
          </h1>
          <button onClick={() => setShowAddToppingModel(false)}>
            <MdOutlineClose size={32} />
          </button>
        </div>
        <div className="h-6 text-center">
          {error && (
            <p className="text-warning-red text-xs font-roboto font-semibold">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-1  mt-4 ">
          <label
            htmlFor="categorie"
            className="text-text-light-gray font-roboto font-semibold"
          >
            Taille
          </label>

          <DropDown
            value={customization}
            setter={setCustomization}
            list={toppings}
            placeholder={"Selectionner une personnalisation"}
          />
        </div>

        <div className="w-full flex justify-center">
          <button
            className="bg-pr w-2/3  rounded-md p-2 mt-8 font-roboto font-semibold "
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
