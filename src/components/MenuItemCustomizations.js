import React, { useState } from "react";
import AddToppingModal from "./modals/AddToppingModal";
import { MdOutlineClose } from "react-icons/md";
const MenuItemCustomizations = ({
  customizations,
  updateMode,
  newCustomizations,
  setNewCustomizations,
  toppings,
}) => {
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);

  const deleteTopping = (index) => {
    const newList = [...newCustomizations];
    newList.splice(index, 1);
    setNewCustomizations(newList);
  };
  return (
    <>
      {showAddToppingModel && (
        <AddToppingModal
          setShowAddToppingModel={setShowAddToppingModel}
          customizations={newCustomizations}
          setCustomizations={setNewCustomizations}
          toppings={toppings}
        />
      )}
      {updateMode ? (
        <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto  p-4 flex-wrap gap-3">
          {newCustomizations.map((customization, index) => {
            return (
              <div
                key={index}
                className="flex   text-text-dark-gray border-pr gap-2 border-2 rounded-md px-2 py-1 "
              >
                <p className="font-semibold">{customization.label}</p>
                <button
                  className="text-warning-red"
                  onClick={() => deleteTopping(index)}
                >
                  <MdOutlineClose size={24} />
                </button>
              </div>
            );
          })}
          <button
            className="bg-pr rounded-md font-roboto py-1 px-10 font-semibold"
            onClick={() => setShowAddToppingModel(true)}
          >
            Ajouter
          </button>
        </div>
      ) : (
        <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto  p-4 flex-wrap gap-3">
          {customizations.map((customization, index) => {
            return (
              <div
                key={index}
                className="flex  text-text-dark-gray border-pr  border-2 rounded-md px-2 py-1 "
              >
                <p className="font-semibold">{customization.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MenuItemCustomizations;
