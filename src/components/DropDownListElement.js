import React from "react";

const DropdownListElement = ({ value, setter, setIsDropDownOpen }) => {
  const handleChoiceSelect = () => {
    setIsDropDownOpen(false);

    setter(value);
  };
  return (
    <li className=" py-2  border-b font-roboto font-medium text-xs hover:bg-pr hover:text-white">
      <button
        className="h-full w-full text-left pl-1"
        onClick={handleChoiceSelect}
      >
        {value.label}
      </button>
    </li>
  );
};

export default DropdownListElement;
