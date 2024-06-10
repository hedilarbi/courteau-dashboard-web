import React from "react";
import { FaUsers, FaMoneyBillWave, FaFileInvoice } from "react-icons/fa";
const StatContainer = ({ usersCount, ordersCount, revenue, role }) => {
  return (
    <div className="flex space-x-4 mt-4 w-2/3 justify-between ">
      {role === "admin" && (
        <div className="flex bg-white border-pr  shadow-default items-center justify-between py-2 px-4 w-1/3">
          <div className="font-roboto font-semibold">
            <p className="text-text-dark-gray">Utilisateurs</p>
            <p className="text-text-light-gray mt-2">{usersCount}</p>
          </div>
          <FaUsers size={34} color="#F7A600" />
        </div>
      )}
      <div className="flex bg-white border-pr  shadow-default items-center justify-between py-2 px-4 w-1/3">
        <div className="font-roboto font-semibold">
          <p className="text-text-dark-gray">Commandes</p>
          <p className="text-text-light-gray mt-2">{ordersCount}</p>
        </div>
        <FaFileInvoice size={34} color="#F7A600" />
      </div>
      <div className="flex bg-white border-pr  shadow-default items-center justify-between py-2 px-4 w-1/3">
        <div className="font-roboto font-semibold">
          <p className="text-text-dark-gray">Revenue</p>
          <p className="text-text-light-gray mt-2">{revenue} $</p>
        </div>
        <FaMoneyBillWave size={34} color="#F7A600" />
      </div>
    </div>
  );
};

export default StatContainer;
