"use client";
import React, { useState } from "react";
import OrderGeneralInfo from "./OrderGeneralInfo";
import OrderDetailsItemsList from "./OrderDetailsItemsList";
import OrderDetailsOffersList from "./OrderDetailsOffersList";
import { OrderStatus } from "@/constants";

const OrderDetails = ({ order }) => {
  const [updateMode, setUpdateMode] = useState(false);
  const [data, setData] = useState(order);
  const statusOptions = [
    { label: OrderStatus.READY, value: OrderStatus.READY },
    { label: OrderStatus.DONE, value: OrderStatus.DONE },
    { label: OrderStatus.IN_DELIVERY, value: OrderStatus.IN_DELIVERY },
    { label: OrderStatus.CANCELED, value: OrderStatus.CANCELED },
  ];

  return (
    <div className="flex-1 w-full font-roboto ">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-roboto font-semibold ">
          Informations generale
        </h2>
        {updateMode ? (
          <button
            className="bg-gray-400 text-white font-roboto font-semibold rounded-md py-2 px-6"
            onClick={() => setUpdateMode(false)}
          >
            Annuler
          </button>
        ) : (
          <button
            className="bg-pr font-roboto font-semibold rounded-md py-2 px-6"
            onClick={() => setUpdateMode(true)}
          >
            Modifier
          </button>
        )}
      </div>
      <OrderGeneralInfo
        data={data}
        updateMode={updateMode}
        statusOptions={statusOptions}
        setData={setData}
        setUpdateMode={setUpdateMode}
      />
      <h2 className="text-2xl font-roboto font-semibold mt-8">Instructions</h2>
      <div className=" bg-white shadow-default rounded-md mt-4 font-roboto  p-4">
        <p className={!data.instructions && "text-center font-semibold"}>
          {data.instructions
            ? data.instructions
            : "Aucune Insctruction fournie"}
        </p>
      </div>
      <h2 className="text-2xl font-roboto font-semibold mt-8">Articles</h2>
      <OrderDetailsItemsList items={data.orderItems} />
      <h2 className="text-2xl font-roboto font-semibold mt-8">Offres</h2>
      <OrderDetailsOffersList offers={data.offers} />
    </div>
  );
};

export default OrderDetails;
