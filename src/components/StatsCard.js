import React from "react";

import { FaUserGroup } from "react-icons/fa6";
// Map icon names to FontAwesome icons
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaMoneyBillWave } from "react-icons/fa6";
const StatsCard = ({ title, stat, icon }) => {
  return (
    <div className="bg-white p-5 w-1/4 flex justify-between items-center shadow-md rounded-md">
      <div className="info-container">
        <p className={`text-text-dark-gray font-bold text-base`}>{title}</p>
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
