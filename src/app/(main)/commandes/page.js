"use client";
import OrdersScreen from "@/components/OrdersScreen";
import Spinner from "@/components/spinner/Spinner";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import { getOrders } from "@/services/OrdersServices";
import { getRestaurantOrders } from "@/services/RestaurantServices";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restaurant, role } = useSelector(selectStaffData);

  const fetchData = async () => {
    try {
      if (role === "admin") {
        const response = await getOrders();
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } else {
        const response = await getRestaurantOrders(restaurant);
        if (response.status) {
          const orders = response.data.orders.reverse();
          setData(orders);
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
        Commandes
      </h1>
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <OrdersScreen data={data} role={role} />
      )}
    </div>
  );
};

export default Page;
