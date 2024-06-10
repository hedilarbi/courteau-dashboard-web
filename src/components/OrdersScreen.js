"use client";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import SearchBar from "./SearchBar";
import Link from "next/link";

const OrdersScreen = ({ data, role }) => {
  const [orders, setOrders] = useState(data);

  const [filter, setFilter] = useState("tout");

  const filterOrders = (filter) => {
    if (filter === "tout") {
      setOrders(data);
    } else {
      const filteredOrders = data.filter((order) => order.status === filter);
      setOrders(filteredOrders);
    }
    setFilter(filter);
  };

  return (
    <>
      <div className="mt-4 flex w-full">
        <SearchBar />
        <button
          className={
            filter === "tout"
              ? "bg-pr rounded-md px-4 py-2 ml-4  font-roboto font-medium"
              : "bg-white rounded-md px-4 py-2 ml-4  font-roboto font-medium border border-black"
          }
          onClick={() => filterOrders("tout")}
        >
          Tout
        </button>
        <button
          className={
            filter === "En cours"
              ? "bg-pr rounded-md px-4 py-2 ml-4  font-roboto font-medium"
              : "bg-white rounded-md px-4 py-2 ml-4  font-roboto font-medium border border-black"
          }
          onClick={() => filterOrders("En cours")}
        >
          En cours
        </button>
        <button
          className={
            filter === "En Livraison"
              ? "bg-pr rounded-md px-4 py-2 ml-4  font-roboto font-medium"
              : "bg-white rounded-md px-4 py-2 ml-4  font-roboto font-medium border border-black"
          }
          onClick={() => filterOrders("En Livraison")}
        >
          En livraison
        </button>
        <button
          className={
            filter === "Fini"
              ? "bg-pr rounded-md px-4 py-2 ml-4  font-roboto font-medium"
              : "bg-white rounded-md px-4 py-2 ml-4  font-roboto font-medium border border-black"
          }
          onClick={() => filterOrders("Fini")}
        >
          Termine
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {data.length > 0 ? (
          <ul>
            {orders.map((order, index) => (
              <li
                key={order._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/3 truncate">
                  {order.address}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {order.status}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {order.code}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6 ">
                  {order.type}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {order.total_price.toFixed(2)} $
                </p>
                <button className="text-primary-blue">
                  <Link
                    href={
                      role === "admin"
                        ? `/commandes/${order._id}`
                        : `/commandes/${order._id}`
                    }
                  >
                    <FaEye size={28} color="" />
                  </Link>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucune commande
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersScreen;
