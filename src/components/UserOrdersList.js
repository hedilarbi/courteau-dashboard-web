import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import React from "react";

const UserOrdersList = ({ orders }) => {
  return (
    <div className="bg-white shadow-default rounded-md mt-4 font-roboto justify-between max-h-[calc(100vh-300px)] overflow-y-auto ">
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? "bg-pr bg-opacity-70 flex items-center space-x-4 px-4 py-4"
                : "bg-white flex items-center space-x-4  px-4 py-4"
            }
          >
            <p className="w-1/3">{dateToDDMMYYYYHHMM(order.createdAt)}</p>
            <p className="w-1/5">{order.status}</p>
            <p className="w-1/5">{order.type}</p>
            <p className="w-1/5">{order.total_price.toFixed(2)} $</p>
            <p className="w-1/5">
              {order.orderItems.length +
                order.offers.length +
                order.rewards.length}{" "}
              item (s)
            </p>
          </div>
        ))
      ) : (
        <div className="text-center py-2 "> No items found</div>
      )}
    </div>
  );
};

export default UserOrdersList;
