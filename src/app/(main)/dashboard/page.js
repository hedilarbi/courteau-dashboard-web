"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getInitialStats, getRestaurantStats } from "@/services/statsServices";
import { getRestaurantList } from "@/services/OrdersServices";
import { useSelector } from "react-redux";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import Spinner from "@/components/spinner/Spinner";
import StaffCard from "@/components/StaffCard";
import StatsContainer from "@/components/StatsContainer";
import StatsCard from "@/components/StatsCard";
import ToastNotification from "@/components/ToastNotification";

const RestaurantBarChart = ({
  title,
  data,
  dataKey,
  maxValue,
  gradient,
  valueFormatter,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-default border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-text-dark-gray">{title}</p>
          <span className="text-[11px] text-text-light-gray">
            par restaurant
          </span>
        </div>
        <div className="text-xs text-text-light-gray text-center py-10">
          Aucune donnée.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-default border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text-dark-gray">{title}</p>
        <span className="text-[11px] text-text-light-gray">par restaurant</span>
      </div>
      <div className="flex items-end gap-4 h-56">
        {data.map((item) => {
          const value = Number(item[dataKey] || 0);
          const normalizedHeight = maxValue
            ? Math.round((value / maxValue) * 100)
            : 0;
          const heightPct = value > 0 ? Math.max(normalizedHeight, 6) : 0;
          return (
            <div
              key={`${item.restaurantName}-${dataKey}`}
              className="flex-1 min-w-[72px] flex flex-col items-center"
            >
              <div className="w-full bg-gray-100 h-full rounded-md flex items-end overflow-hidden">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${heightPct}%`,
                    background: gradient,
                  }}
                />
              </div>
              <span className="text-xs font-semibold mt-2 text-text-dark-gray">
                {valueFormatter ? valueFormatter(value) : value}
              </span>
              <p className="text-[11px] text-text-light-gray text-center truncate w-full">
                {item.restaurantName}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [error, setError] = useState(null);
  const { restaurant, role, name } = useSelector(selectStaffData);
  const [restaurantsStats, setRestaurantsStats] = useState([]);
  const [usersCount, setUsersCount] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurantList, setRestaurantList] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("date");
  const [date, setDate] = useState(new Date());
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showToast = (type, message) => {
    setToastData({ show: true, type, message });
    setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 2500);
  };

  const fetchRestaurants = async () => {
    if (role !== "admin") return;
    try {
      const res = await getRestaurantList();
      if (res.status) {
        setRestaurantList([{ label: "Tous", value: "" }, ...res.data]);
      }
    } catch (err) {
      // ignore for now
    }
  };

  const loadStats = async (opts = {}) => {
    const { targetDate, rangeFrom, rangeTo, restaurantId } = opts;
    setIsDataFetching(true);
    try {
      let response;
      if (restaurantId) {
        response = await getRestaurantStats(restaurantId);
      } else {
        response = await getInitialStats(
          targetDate || null,
          rangeFrom,
          rangeTo
        );
      }
      if (response.status) {
        setUsersCount(response.data.usersCount);
        setRestaurantsStats(response.data.restaurantStats || []);
        setError(null);
      } else {
        setError(response.message);
        showToast("error", response.message);
      }
    } catch (err) {
      setError(err.message);
      showToast("error", err.message);
    } finally {
      setIsLoading(false);
      setIsDataFetching(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    loadStats({
      targetDate: date,
      restaurantId: role === "admin" ? "" : restaurant,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    if (dateFilterType === "date") {
      loadStats({
        targetDate: date,
        restaurantId:
          selectedRestaurant || (role !== "admin" ? restaurant : ""),
      });
    } else {
      loadStats({
        rangeFrom: from,
        rangeTo: to,
        restaurantId:
          selectedRestaurant || (role !== "admin" ? restaurant : ""),
      });
    }
  };

  const maxRevenue = useMemo(
    () =>
      restaurantsStats.reduce(
        (acc, cur) => Math.max(acc, Number(cur.revenue || 0)),
        0
      ),
    [restaurantsStats]
  );
  const maxOrders = useMemo(
    () =>
      restaurantsStats.reduce(
        (acc, cur) => Math.max(acc, Number(cur.ordersCount || 0)),
        0
      ),
    [restaurantsStats]
  );
  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 bg-[#f5f7fb] min-h-screen">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      <div className="flex-1 overflow-y-auto pb-5 max-h-[calc(100vh-48px)]">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-light-gray">
              Vue d&apos;ensemble
            </p>
            <h1 className="text-4xl font-semibold text-text-dark-gray">
              Dashboard
            </h1>
          </div>
          <StaffCard name={name} />
        </div>

        <div className="mt-4">
          <StatsContainer usersCount={usersCount} role={role} />
        </div>

        <div className="bg-white shadow-default rounded-xl mt-4 p-4 flex flex-col gap-3 border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {role === "admin" && (
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <option value="">Tous les restaurants</option>
                {restaurantList.map((r) => (
                  <option key={r.value || r._id} value={r.value || r._id}>
                    {r.label || r.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 rounded-md text-sm font-semibold border ${
                  dateFilterType === "date"
                    ? "bg-pr text-white border-pr"
                    : "bg-white text-text-dark-gray border-gray-200"
                }`}
                onClick={() => setDateFilterType("date")}
              >
                Date
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-semibold border ${
                  dateFilterType === "interval"
                    ? "bg-pr text-white border-pr"
                    : "bg-white text-text-dark-gray border-gray-200"
                }`}
                onClick={() => setDateFilterType("interval")}
              >
                Intervalle
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {dateFilterType === "date" ? (
                <input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                />
              ) : (
                <>
                  <input
                    type="date"
                    value={from.toISOString().split("T")[0]}
                    onChange={(e) => setFrom(new Date(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                  />
                  <input
                    type="date"
                    value={to.toISOString().split("T")[0]}
                    onChange={(e) => setTo(new Date(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pr"
                  />
                </>
              )}
              <button
                className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95"
                onClick={handleApply}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>

        {/* {restaurantsStats.length > 0 && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <RestaurantBarChart
              title="Revenus par restaurant"
              data={restaurantsStats}
              dataKey="revenue"
              maxValue={maxRevenue}
              gradient="linear-gradient(135deg, #f59e0b, #0f172a)"
              valueFormatter={(val) => `${formatCurrency(val)} $`}
            />
            <RestaurantBarChart
              title="Commandes par restaurant"
              data={restaurantsStats}
              dataKey="ordersCount"
              maxValue={maxOrders}
              gradient="linear-gradient(135deg, #34d399, #0ea5e9)"
            />
          </div>
        )} */}

        <div className="mt-6 bg-white rounded-xl shadow-default border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-dark-gray">
              Performance par restaurant
            </h2>
            {isDataFetching && (
              <span className="text-xs text-text-light-gray">
                Chargement...
              </span>
            )}
          </div>
          {isDataFetching ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : restaurantsStats.length > 0 ? (
            <div className="space-y-4">
              {restaurantsStats.map((r) => {
                const revenuePct = maxRevenue
                  ? Math.round((Number(r.revenue || 0) / maxRevenue) * 100)
                  : 0;
                const ordersPct = maxOrders
                  ? Math.round((Number(r.ordersCount || 0) / maxOrders) * 100)
                  : 0;
                return (
                  <div
                    key={r.restaurantName}
                    className="border border-gray-100 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-text-light-gray">
                          Restaurant
                        </p>
                        <p className="text-lg font-semibold text-text-dark-gray">
                          {r.restaurantName}
                        </p>
                      </div>
                      <div className="flex gap-3 flex-wrap justify-end">
                        <StatsCard
                          title="Commandes"
                          stat={r.ordersCount}
                          icon="file-invoice-dollar"
                        />
                        <StatsCard
                          title="Revenus"
                          stat={`${r.revenue} $`}
                          icon="money-bill-wave"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-text-light-gray">
                          <span>Revenus</span>
                          <span>{r.revenue} $</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pr to-[#0f172a]"
                            style={{ width: `${revenuePct}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-text-light-gray">
                          <span>Commandes</span>
                          <span>{r.ordersCount}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-700"
                            style={{ width: `${ordersPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-text-light-gray text-center py-6">
              Aucune donnée pour cette période.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
