import React, { useState } from "react";
import AddToppingModal from "./modals/AddToppingModal";
import { MdOutlineClose } from "react-icons/md";
import DropDown from "./DropDown";
const MenuItemCustomizations = ({
  customizations = [],
  customizationGroup,
  updateMode,
  newCustomizations,
  setNewCustomizations,
  toppings,
  toppingGroups = [],
  selectedToppingGroups = [],
  toppingGroupToAdd,
  onSelectGroup,
  onRemoveGroup,
}) => {
  const [showAddToppingModel, setShowAddToppingModel] = useState(false);
  const hasSelectedGroup = selectedToppingGroups.length > 0;
  const customizationGroups = Array.isArray(customizationGroup)
    ? customizationGroup
    : customizationGroup
      ? [customizationGroup]
      : [];

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
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <DropDown
              value={toppingGroupToAdd}
              setter={onSelectGroup}
              list={toppingGroups.filter(
                (group) =>
                  !selectedToppingGroups.some(
                    (selectedGroup) => selectedGroup.value === group.value
                  )
              )}
              placeholder={"Selectionner un groupe de personnalisation"}
            />
            {selectedToppingGroups.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selectedToppingGroups.map((group) => (
                  <div
                    key={group.value}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-text-dark-gray rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <p className="font-semibold text-sm">{group.label}</p>
                    <button
                      className="text-warning-red hover:text-red-700"
                      onClick={() => onRemoveGroup?.(group.value)}
                    >
                      <MdOutlineClose size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!hasSelectedGroup ? (
            <>
              {newCustomizations.length ? (
                <div className="flex flex-wrap gap-3">
                  {newCustomizations.map((customization, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-text-dark-gray rounded-full px-3 py-1.5 shadow-sm"
                      >
                        <p className="font-semibold text-sm">
                          {customization.label}
                        </p>
                        <button
                          className="text-warning-red hover:text-red-700"
                          onClick={() => deleteTopping(index)}
                        >
                          <MdOutlineClose size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-light-gray">
                  Aucune personnalisation pour le moment.
                </p>
              )}
              <button
                className="inline-flex items-center justify-center border border-pr text-pr rounded-md font-semibold px-4 py-2 hover:bg-pr hover:text-white transition w-fit"
                onClick={() => setShowAddToppingModel(true)}
              >
                Ajouter une personnalisation
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {customizationGroups.length > 0 && (
            <div className="flex items-center text-text-dark-gray bg-gray-50 border border-gray-200 rounded-md px-3 py-2 shadow-sm">
              <p className="font-semibold text-sm">
                Groupes de personnalisation :{" "}
                <span className="font-bold">
                  {customizationGroups.map((group) => group.name).join(", ")}
                </span>
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {customizations.length ? (
              customizations.map((customization, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center text-text-dark-gray bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm"
                  >
                    <p className="font-semibold text-sm">
                      {customization.name}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-light-gray">
                Aucune personnalisation renseignée.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCustomizations;
