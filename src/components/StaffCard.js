import React from "react";
import { FaUser } from "react-icons/fa6";
const StaffCard = ({ name }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "30px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        padding: "10px 20px",
        backgroundColor: "white",
      }}
    >
      <div>
        <FaUser color="#F7A600" />
      </div>
      <div>
        <p className="text-xl">Bonjour</p>
        <p className="text-text-light-gray font-roboto mt-1">{name}</p>
      </div>
    </div>
  );
};

export default StaffCard;
