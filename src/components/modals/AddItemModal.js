import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import DropDown from "../DropDown";
import { MdOutlineClose } from "react-icons/md";
const AddItemModal = ({ setShowAddItemModal, itemsNames, setItems }) => {
  const [item, setItem] = useState({});
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);

  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    if (item) {
      const itemSelected = itemsNames.find((i) => i.value === item.value);

      if (itemSelected) {
        const list = [];
        itemSelected.prices.map((price) =>
          list.push({ value: price._id, label: price.size })
        );

        setSizes(list);
      }
    }
  }, [item]);

  const addItem = () => {
    if (!item.value || !size || !quantity) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setError(null);

    setItems((prev) => [
      ...prev,
      {
        item: {
          _id: item.value,
          label: item.label,
        },
        size: size.label,
        quantity: quantity,
      },
    ]);
    setShowAddItemModal(false);
  };

  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-xl bg-white p-6 overflow-y-auto rounded-lg shadow-lg z-30 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter un article
            </h1>
            <p className="text-sm text-text-light-gray">
              Sélectionnez l&apos;article, sa taille et la quantité.
            </p>
          </div>
          <button onClick={() => setShowAddItemModal(false)}>
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
              htmlFor="article"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Article
            </label>
            <DropDown
              value={item}
              setter={setItem}
              list={itemsNames}
              placeholder={"Selectionner un article"}
            />
          </div>

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
              htmlFor="quantity"
              className="text-text-dark-gray font-roboto font-semibold"
            >
              Quantité
            </label>

            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 1"
            />
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            className="bg-pr text-white rounded-md px-6 py-2.5 mt-2 font-roboto font-semibold shadow-sm hover:brightness-95"
            onClick={addItem}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddItemModal;
