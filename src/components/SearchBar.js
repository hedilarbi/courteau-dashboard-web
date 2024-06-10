import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
const SearchBar = () => {
  return (
    <div className="w-1/4 flex items-center border border-black rounded-md pl-2 text-text-dark-gray">
      <FaMagnifyingGlass />
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 focus:outline-none bg-transparent border-none font-roboto font-normal "
      />
    </div>
  );
};

export default SearchBar;
