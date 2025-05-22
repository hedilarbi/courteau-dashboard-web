"use client";
import ToppingsScreen from "@/components/ToppingsScreen";
import Spinner from "@/components/spinner/Spinner";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import { getRestaurantToppings } from "@/services/RestaurantServices";
import { getToppings } from "@/services/ToppingsServices";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restaurant, role } = useSelector(selectStaffData);
  const [refresh, setRefresh] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (role === "admin") {
        const response = await getToppings();
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } else {
        const response = await getRestaurantToppings(restaurant);
        if (response.status) {
          setData(response.data.toppings);
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
  }, [refresh]);
  return (
    <div className="w-full h-full p-4  flex flex-col relative">
      <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
        Personnalisations
      </h1>
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <ToppingsScreen
          data={data}
          role={role}
          restaurant={restaurant}
          setRefresh={setRefresh}
        />
      )}
    </div>
  );
};

export default Page;
