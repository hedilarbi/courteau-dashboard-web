"use client";
import React, { useEffect, useState } from "react";
import { getInitialStats, getRestaurantStats } from "@/services/statsServices";

import { useSelector } from "react-redux";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import Spinner from "@/components/spinner/Spinner";
import StaffCard from "@/components/StaffCard";
import StatsContainer from "@/components/StatsContainer";
import StatsCard from "@/components/StatsCard";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { restaurant, role, name } = useSelector(selectStaffData);
  const [restaurantsStats, setRestaurantsStats] = useState([]);
  const [usersCount, setUsersCount] = useState(null);
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [dateFilterType, setDateFilterType] = useState("date");
  const [isDataFetching, setIsDataFetching] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getInitialStats(date, null, null);
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatsAtDate = async () => {
    setIsDataFetching(true);
    try {
      const response = await getInitialStats(date, null, null);
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats);
      } else {
        Alert.alert(response.message);
      }
    } catch (error) {
      Alert.alert("Problème de connexion");
    } finally {
      setIsDataFetching(false);
    }
  };

  const fetchStatsAtInterval = async () => {
    setIsDataFetching(true);
    try {
      const response = await getInitialStats(null, from, to);
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats);
      } else {
        Alert.alert(response.message);
      }
    } catch (error) {
      Alert.alert("Problème de connexion");
    } finally {
      setIsDataFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1">
      <div className="flex-1 overflow-y-auto pb-5 max-h-[calc(100vh-48px)]">
        <div className="flex space-between items-center">
          <h1 className="text-4xl">Accueil</h1>
          <div className="flex gap-6">
            <StaffCard name={name} />
          </div>
        </div>
        {/* <HomeFilter /> */}
        <StatsContainer usersCount={usersCount} role={role} />

        <div className="mt-5">
          <h2 className="text-5xl">Statistiques</h2>
          <div className="flex space-x-4 item mt-4">
            <button onClick={() => setDateFilterType("date")}>
              <span
                className={`${
                  dateFilterType === "date"
                    ? "bg-pr text-black"
                    : "bg-white border border-black rounded-md"
                } px-4 py-2 rounded-md`}
              >
                Date
              </span>
            </button>
            <button onClick={() => setDateFilterType("interval")}>
              <span
                className={`${
                  dateFilterType === "interval"
                    ? "bg-pr text-black"
                    : "bg-white border border-black rounded-md"
                } px-4 py-2 rounded-md`}
              >
                Intervalle
              </span>
            </button>
          </div>
          {dateFilterType === "date" && (
            <div className="mt-4">
              <h3 className="mt-2 text-lg">Sélectionner une date</h3>
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="mt-2 border border-black rounded-md px-2 py-1"
              />
              <button
                onClick={fetchStatsAtDate}
                className="bg-pr rounded-md ml-2 py-1 px-4"
              >
                Valider
              </button>
            </div>
          )}
          {dateFilterType === "interval" && (
            <div className="mt-4 ">
              <h3 className="mt-2 text-lg">Sélectionner un intervalle</h3>
              <input
                type="date"
                value={from.toISOString().split("T")[0]}
                onChange={(e) => setFrom(new Date(e.target.value))}
                className="mt-2 border border-black rounded-md px-2 py-1"
              />
              <input
                type="date"
                value={to.toISOString().split("T")[0]}
                onChange={(e) => setTo(new Date(e.target.value))}
                className="mt-2 border border-black rounded-md px-2 py-1 ml-2"
              />
              <button
                onClick={fetchStatsAtInterval}
                className="bg-pr rounded-md ml-2 py-1 px-4 ml-2"
              >
                Valider
              </button>
            </div>
          )}
          {isDataFetching && (
            <div className="flex justify-center items-center h-screen">
              <Spinner />
            </div>
          )}
          {!isDataFetching &&
            restaurantsStats.map((restaurant, index) => (
              <div key={index} className="mt-5">
                <h3 className="text-2xl">{restaurant.restaurantName}</h3>
                <div className="flex gap-5 mt-4">
                  <StatsCard
                    title="Commande"
                    stat={restaurant.ordersCount}
                    icon="file-invoice-dollar"
                  />
                  <StatsCard
                    title="Revenues"
                    stat={restaurant.revenue + " $"}
                    icon="money-bill-wave"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
