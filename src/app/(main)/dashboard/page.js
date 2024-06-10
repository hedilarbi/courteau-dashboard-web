"use client";
import React, { useEffect, useState } from "react";
import { getInitialStats, getRestaurantStats } from "@/services/statsServices";
import StatContainer from "@/components/StatContainer";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import Spinner from "@/components/spinner/Spinner";

const Page = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restaurant, role } = useSelector(selectStaffData);

  const fetchData = async () => {
    try {
      if (role === "admin") {
        const response = await getInitialStats();
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } else {
        const response = await getRestaurantStats(restaurant);
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-full p-4 bg flex flex-col">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Dashboard
      </h1>
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          <StatContainer
            revenue={data.revenue}
            usersCount={data.usersCount || 0}
            ordersCount={data.ordersCount}
            role={role}
          />

          <h2 className="text-lg font-roboto font-semibold text-text-dark-gray mt-4 ">
            Commandes en attente
          </h2>
          <div className="bg-white shadow-default flex-1 overflow-y-auto mt-4 w-2/3">
            <ul className=" ">
              {data.onGoingOrders.map((order, index) => (
                <Link key={order._id} href={`/commandes/${order._id}`}>
                  <li
                    className={
                      index % 2 === 0
                        ? "bg-pr bg-opacity-70 flex items-center justify-between px-3 py-3"
                        : "bg-white flex items-center justify-between px-3 py-3"
                    }
                  >
                    <p className="text-text-dark-gray font-roboto font-normal w-1/3 truncate">
                      {order.address}
                    </p>
                    <p className="text-text-dark-gray font-roboto font-normal">
                      {order.code}
                    </p>
                    <p className="text-text-dark-gray font-roboto font-normal ">
                      {order.type}
                    </p>
                    <p className="text-text-dark-gray font-roboto font-normal">
                      {order.total_price.toFixed(2)} $
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
