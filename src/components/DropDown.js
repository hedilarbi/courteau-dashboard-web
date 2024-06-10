import React, { useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import DropdownListElement from "./DropDownListElement";

const DropDown = ({ value, setter, list, placeholder }) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const containerRef = useRef(null);
  return (
    <div className="w-full " ref={containerRef}>
      <button
        className="bg-pr  text-black flex w-full justify-between items-center p-2 text-xs font-roboto font-medium rounded-md"
        onClick={() => setIsDropDownOpen(!isDropDownOpen)}
      >
        {value ? value.label : placeholder}
        {isDropDownOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isDropDownOpen && (
        <div
          className=" absolute   bg-white border border-black h-28 overflow-y-auto"
          style={{ width: containerRef.current.offsetWidth }}
        >
          <ul className="">
            {list.map((item, index) => {
              return (
                <DropdownListElement
                  value={item}
                  setter={setter}
                  setIsDropDownOpen={setIsDropDownOpen}
                  key={index}
                />
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDown;
