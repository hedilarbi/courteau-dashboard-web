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
    const updatedPrices = [...newPrices];
    updatedPrices.splice(index, 1);
    setNewPrices(updatedPrices);
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
        <div className="space-y-4">
          {newPrices.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {newPrices.map((price, index) => {
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-dark-gray">
                        {price.size}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={price.price}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                          onChange={(e) =>
                            handleupdatePrice(index, e.target.value)
                          }
                          min={0}
                          step="0.01"
                        />
                        <span className="text-sm text-text-light-gray">$</span>
                      </div>
                    </div>
                    <button
                      className="text-warning-red hover:text-red-700"
                      onClick={() => deletePrice(index)}
                      aria-label="Supprimer ce prix"
                    >
                      <MdOutlineClose size={22} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-light-gray">
              Aucun prix pour le moment. Ajoutez un tarif pour chaque taille.
            </p>
          )}
          <button
            className="inline-flex items-center justify-center border border-pr text-pr rounded-md font-semibold px-4 py-2 hover:bg-pr hover:text-white transition w-fit"
            onClick={() => setShowAddPriceModel(true)}
          >
            Ajouter un prix
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prices?.length ? (
            prices.map((price, index) => {
              const formattedPrice = Number(price.price) || 0;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-light-gray">
                      Taille
                    </p>
                    <p className="text-base font-semibold text-text-dark-gray">
                      {price.size}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-pr">
                    {formattedPrice.toFixed(2)} $
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-text-light-gray">
              Aucun prix renseigné pour cet article.
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default MenuItemPrices;
