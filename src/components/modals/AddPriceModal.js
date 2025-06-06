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
      <div className="w-1/3 bg-white p-4   overflow-y-auto rounded-md  z-30">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-roboto font-semibold text-text-dark-gray">
            Ajouter un article
          </h1>
          <button onClick={() => setShowAddPriceModel(false)}>
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
        <div className="flex gap-2  mt-4 items-center">
          <label
            htmlFor="categorie"
            className="text-text-light-gray font-roboto font-semibold"
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
        <div className="flex gap-2  mt-4 items-center">
          <label
            htmlFor="categorie"
            className="text-text-light-gray font-roboto font-semibold"
          >
            Prix
          </label>

          <input
            type="number"
            className="w-1/2 border border-black rounded-md p-1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="w-full flex justify-center">
          <button
            className="bg-pr w-2/3  rounded-md p-2 mt-8 font-roboto font-semibold "
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
