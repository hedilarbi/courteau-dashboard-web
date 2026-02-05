import React from "react";

import { FaUserGroup } from "react-icons/fa6";
// Map icon names to FontAwesome icons
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa6";
const StatsCard = ({ title, stat, icon }) => {
  return (
    <div className="bg-white px-4 py-5 flex items-center justify-between shadow-md rounded-md min-w-[150px] flex-shrink-0">
      <div className="info-container">
        <p className="text-text-dark-gray font-bold text-base">{title}</p>
        <p className="font-bold text-base mt-2.5">{stat}</p>
      </div>
      <div>
        {icon === "file-invoice-dollar" && (
          <FaFileInvoiceDollar color="#F7A600" />
        )}
        {icon === "money-bill-wave" && <FaMoneyBillWave color="#F7A600" />}
        {icon === "user-group" && <FaUserGroup color="#F7A600" />}
      </div>
    </div>
  );
};

export default StatsCard;
