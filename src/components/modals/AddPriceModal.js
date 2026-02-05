import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import DropDown from "../DropDown";
import { MdOutlineClose } from "react-icons/md";
const AddPriceModal = ({ sizes, prices, setPrices, setShowAddPriceModel }) => {
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);

  const addPrice = () => {
    setError(null);
    if (prices.find((p) => p.size === size)) {
      setError("La taille existe déjà");
      return;
    }
    if (price === 0 || price === "") {
      setError("Le prix ne peut pas être nul");
      return;
    }

    if (prices.find((p) => p.size === size.value)) {
      setError("La taille existe déjà");
      return;
    }
    setPrices([...prices, { size: size.value, price }]);
    setPrice(0);
    setSize(null);
    setShowAddPriceModel(false);
  };

  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-md bg-white p-6 overflow-y-auto rounded-lg shadow-lg z-30 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter un prix
            </h1>
            <p className="text-sm text-text-light-gray">
              Associez une taille et un prix pour cet article.
            </p>
          </div>
          <button onClick={() => setShowAddPriceModel(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>
        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="size"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Taille
            </label>

            <DropDown
              value={size}
              setter={setSize}
              list={sizes}
              placeholder={"Selectionner une taille"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="price"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Prix
            </label>

            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 12.50"
            />
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="bg-pr text-white rounded-md px-6 py-2.5 mt-2 font-roboto font-semibold shadow-sm hover:brightness-95"
            onClick={addPrice}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddPriceModal;
