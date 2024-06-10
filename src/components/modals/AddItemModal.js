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
      <div className="w-1/3 bg-white p-4   overflow-y-auto rounded-md  z-30">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-roboto font-semibold text-text-dark-gray">
            Ajouter un article
          </h1>
          <button onClick={() => setShowAddItemModal(false)}>
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
            Articles
          </label>

          <DropDown
            value={item}
            setter={setItem}
            list={itemsNames}
            placeholder={"Selectionner un article"}
          />
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
            Quantite
          </label>

          <input
            type="number"
            className="w-1/2 border border-black rounded-md p-1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="w-full flex justify-center">
          <button
            className="bg-pr w-2/3  rounded-md p-2 mt-8 font-roboto font-semibold "
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
