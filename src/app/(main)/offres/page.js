"use client";
import OffersScreen from "@/components/OffersScreen";
import Spinner from "@/components/spinner/Spinner";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import { getOffers } from "@/services/OffersServices";
import { getRestaurantOffers } from "@/services/RestaurantServices";

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
        const response = await getOffers();
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } else {
        const response = await getRestaurantOffers(restaurant);
        if (response.status) {
          setData(response.data.offers);
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
    <div className="w-full h-full p-4  flex flex-col relative max-h-screen overflow-y-auto">
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <OffersScreen data={data} role={role} restaurant={restaurant} />
      )}
    </div>
  );
};

export default Page;
