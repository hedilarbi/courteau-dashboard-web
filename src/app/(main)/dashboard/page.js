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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", flex: 1 }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "20px",
          maxHeight: "calc(100vh - 48px)", // Adjust height to fit within the viewport
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "40px" }}>Accueil</h1>
          <div style={{ display: "flex", gap: "24px" }}>
            <StaffCard name={name} />
          </div>
        </div>
        {/* <HomeFilter /> */}
        <StatsContainer usersCount={usersCount} role={role} />

        <div style={{ marginTop: "20px" }}>
          <h2 style={{ fontSize: "30px" }}>Statistiques</h2>
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
              <h3 style={{ fontSize: "16px" }} className="mt-2">
                Sélectionner une date
              </h3>
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
              <h3 style={{ fontSize: "16px" }} className="mt-2">
                Sélectionner un intervalle
              </h3>
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <Spinner />
            </div>
          )}
          {!isDataFetching &&
            restaurantsStats.map((restaurant, index) => (
              <div key={index} style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "20px" }}>
                  {restaurant.restaurantName}
                </h3>
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "15px" }}
                >
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
