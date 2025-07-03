import React, { useState } from "react";
import AddPriceModal from "./modals/AddPriceModal";
import { MdOutlineClose } from "react-icons/md";
const MenuItemPrices = ({
  prices,
  updateMode,
  sizes,
  setNewPrices,
  newPrices,
}) => {
  const [showAddPriceModel, setShowAddPriceModel] = useState(false);

  const deletePrice = (index) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setNewPrices(newPrices);
  };

  const handleupdatePrice = (index, value) => {
    const updatedPrices = [...newPrices];
    updatedPrices[index].price = parseFloat(value);
    if (isNaN(updatedPrices[index].price)) {
      updatedPrices[index].price = 0;
    }
    setNewPrices(updatedPrices);
  };

  return (
    <>
      {showAddPriceModel && (
        <AddPriceModal
          setShowAddPriceModel={setShowAddPriceModel}
          sizes={sizes}
          prices={newPrices}
          setPrices={setNewPrices}
        />
      )}
      {updateMode ? (
        <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto  p-4 gap-4 flex-wrap">
          {newPrices.map((price, index) => {
            return (
              <div
                key={index}
                className="border border-pr rounded-md py-1 px-2 flex items-center gap-2 font-roboto"
              >
                <p className="font-bold">{price.size} :</p>

                <input
                  type="number"
                  name=""
                  id=""
                  value={price.price}
                  className="w-16 text-center border border-pr rounded-md"
                  onChange={() => handleupdatePrice(index, event.target.value)}
                />
                <p>$</p>
                <button
                  className="text-warning-red"
                  onClick={() => deletePrice(index)}
                >
                  <MdOutlineClose size={24} />
                </button>
              </div>
            );
          })}
          <button
            className="bg-pr rounded-md font-roboto py-1 px-10 font-semibold"
            onClick={() => setShowAddPriceModel(true)}
          >
            Ajouter
          </button>
        </div>
      ) : (
        <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto p-4 gap-4 flex-wrap">
          {prices.map((price, index) => {
            return (
              <div
                key={index}
                className="border-2 border-pr rounded-md py-1 px-2 flex items-center gap-2 font-roboto"
              >
                <p className="font-bold">{price.size} :</p>
                <p>{price.price.toFixed(2)} $</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MenuItemPrices;
