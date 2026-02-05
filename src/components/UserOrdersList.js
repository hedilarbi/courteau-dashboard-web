import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import React from "react";

const UserOrdersList = ({ orders }) => {
  return (
    <div className="bg-white shadow-default rounded-xl mt-4 font-roboto border border-gray-100 overflow-hidden">
      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-[1.6fr,1fr,1fr,1fr,1fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
              <span>Date</span>
              <span>Statut</span>
              <span>Type</span>
              <span>Total</span>
              <span>Articles</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-100">
              {orders.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1.6fr,1fr,1fr,1fr,1fr] items-center px-4 py-3 text-sm text-text-dark-gray hover:bg-gray-50 transition"
                >
                  <p>{dateToDDMMYYYYHHMM(order.createdAt)}</p>
                  <p className="font-semibold">{order.status}</p>
                  <p>{order.type}</p>
                  <p className="font-semibold">{order.total_price.toFixed(2)} $</p>
                  <p>
                    {order.orderItems.length +
                      order.offers.length +
                      order.rewards.length}{" "}
                    item(s)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-text-light-gray text-sm">
          Aucune commande pour cet utilisateur.
        </div>
      )}
    </div>
  );
};

export default UserOrdersList;
