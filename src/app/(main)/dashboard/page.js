"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getDashboardAnalytics } from "@/services/statsServices";
import { getRestaurantList } from "@/services/OrdersServices";
import { useSelector } from "react-redux";
import { selectStaffData } from "@/redux/slices/StaffSlice";
import Spinner from "@/components/spinner/Spinner";
import StaffCard from "@/components/StaffCard";
import ToastNotification from "@/components/ToastNotification";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#F7A600", "#0F172A", "#16A34A", "#0284C7"];
const GRAPH_OPTIONS = [
  { value: "revenue_over_time", label: "Total revenu" },
  { value: "orders_over_time", label: "Nombre de commandes par jour" },
  { value: "orders_by_hour", label: "Commandes par heure" },
  { value: "orders_by_weekday", label: "Commandes par jour (semaine)" },
  { value: "orders_by_platform", label: "Type de plateforme" },
  { value: "promo_usage", label: "Utilise promo ou non" },
  { value: "delivery_vs_pickup", label: "Livraison vs ramassage" },
  { value: "payment_breakdown", label: "Comptoir vs En ligne" },
  { value: "usage_referral", label: "Usage du parrainage" },
  { value: "top_products", label: "Produits preferes" },
];

const formatMoney = (value) =>
  `${new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} $`;

const toInputDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const toInputMonth = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}`;
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const toMonthStartDate = (monthValue) => {
  const [yearRaw, monthRaw] = String(monthValue || "").split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }
  return `${year}-${String(month).padStart(2, "0")}-01`;
};

const toMonthEndDate = (monthValue) => {
  const [yearRaw, monthRaw] = String(monthValue || "").split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
};

const normalizeDateRange = (fromValue, toValue) => {
  const fallback = toInputDate(new Date());
  const rawFrom = String(fromValue || "").trim();
  const rawTo = String(toValue || "").trim();

  const safeFrom = rawFrom || rawTo || fallback;
  const safeTo = rawTo || rawFrom || fallback;
  if (new Date(safeFrom).getTime() <= new Date(safeTo).getTime()) {
    return { from: safeFrom, to: safeTo };
  }
  return { from: safeTo, to: safeFrom };
};

const AnalyticsChart = ({ selectedGraph, charts }) => {
  const revenueByDay = charts?.revenueByDay || [];
  const revenueByRestaurant = charts?.revenueByRestaurant || [];
  const ordersByHour = charts?.ordersByHour || [];
  const ordersByWeekday = charts?.ordersByWeekday || [];
  const ordersByPlatform = (charts?.ordersByPlatform || []).filter(
    (item) => item.value > 0,
  );
  const promoUsage = (charts?.promoUsage || []).filter(
    (item) => item.value > 0,
  );
  const deliveryVsPickup = (charts?.deliveryVsPickup || []).filter(
    (item) => item.value > 0,
  );
  const paymentBreakdown = (charts?.paymentBreakdown || []).filter(
    (item) => item.value > 0,
  );
  const topProducts = charts?.topProducts || [];

  const renderNoData = () => (
    <div className="h-[420px] flex items-center justify-center text-sm text-text-light-gray">
      Aucune donnee pour ce filtre.
    </div>
  );
  const revenueLineDot = revenueByDay.length <= 1 ? { r: 5 } : false;

  if (selectedGraph === "revenue_over_time") {
    if (revenueByDay.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(value) => `${value}$`} />
            <Tooltip formatter={(value) => formatMoney(value)} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#F7A600"
              strokeWidth={3}
              dot={revenueLineDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "orders_over_time") {
    if (revenueByDay.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="orders"
              name="Commandes"
              stroke="#0F172A"
              strokeWidth={3}
              dot={revenueLineDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "revenue_by_restaurant") {
    if (revenueByRestaurant.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueByRestaurant}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="restaurantName" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(value) => `${value}$`} />
            <Tooltip formatter={(value) => formatMoney(value)} />
            <Bar dataKey="revenue" fill="#F7A600" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "orders_by_hour") {
    if (ordersByHour.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ordersByHour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="orders"
              name="Commandes"
              fill="#0F172A"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "orders_by_weekday") {
    if (ordersByWeekday.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ordersByWeekday}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="orders"
              name="Commandes"
              fill="#16A34A"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "orders_by_platform") {
    if (ordersByPlatform.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ordersByPlatform}
              dataKey="value"
              nameKey="label"
              outerRadius={135}
              label
            >
              {ordersByPlatform.map((entry, index) => (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "promo_usage") {
    if (promoUsage.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={promoUsage}
              dataKey="value"
              nameKey="label"
              outerRadius={135}
              label
            >
              {promoUsage.map((entry, index) => (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "delivery_vs_pickup") {
    if (deliveryVsPickup.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deliveryVsPickup}
              dataKey="value"
              nameKey="label"
              outerRadius={135}
              label
            >
              {deliveryVsPickup.map((entry, index) => (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "payment_breakdown") {
    if (paymentBreakdown.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentBreakdown}
              dataKey="value"
              nameKey="label"
              outerRadius={135}
              label={(entry) => `${entry.label}: ${formatMoney(entry.value)}`}
            >
              {paymentBreakdown.map((entry, index) => (
                <Cell
                  key={`${entry.label}-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "usage_referral") {
    if (revenueByDay.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="referralOrders"
              name="Commandes parrainées"
              fill="#16A34A"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (selectedGraph === "top_products") {
    if (topProducts.length === 0) return renderNoData();
    return (
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={210}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#F7A600" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return renderNoData();
};

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [restaurantList, setRestaurantList] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [dateMode, setDateMode] = useState("day");
  const [fromDate, setFromDate] = useState(toInputDate(new Date()));
  const [toDate, setToDate] = useState(toInputDate(new Date()));
  const [fromMonth, setFromMonth] = useState(toInputMonth(new Date()));
  const [toMonth, setToMonth] = useState(toInputMonth(new Date()));
  const [selectedGraph, setSelectedGraph] = useState("revenue_over_time");
  const [selectedOrderType, setSelectedOrderType] = useState("all");
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const { restaurant, role, name } = useSelector(selectStaffData);

  const showToast = (type, message) => {
    setToastData({ show: true, type, message });
    setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 2800);
  };

  const fetchRestaurants = async () => {
    if (role !== "admin") return;
    try {
      const res = await getRestaurantList();
      if (res.status) {
        const normalizedRestaurants = (res.data || []).filter((restaurantItem) =>
          Boolean(restaurantItem?.value || restaurantItem?._id),
        );
        setRestaurantList(normalizedRestaurants);
      }
    } catch (err) {
      // no-op
    }
  };

  const loadAnalytics = async (overrides = {}) => {
    setIsDataFetching(true);
    const restaurantId =
      overrides.restaurantId !== undefined
        ? overrides.restaurantId
        : role === "admin"
          ? selectedRestaurant
          : restaurant;

    const nextDateMode = overrides.dateMode || dateMode;
    const nextFromDate = overrides.fromDate ?? fromDate;
    const nextToDate = overrides.toDate ?? toDate;
    const nextFromMonth = overrides.fromMonth ?? fromMonth;
    const nextToMonth = overrides.toMonth ?? toMonth;
    const nextOrderType = overrides.orderType ?? selectedOrderType;

    const rawFrom =
      nextDateMode === "month" ? toMonthStartDate(nextFromMonth) : nextFromDate;
    const rawTo =
      nextDateMode === "month" ? toMonthEndDate(nextToMonth) : nextToDate;
    const { from, to } = normalizeDateRange(rawFrom, rawTo);

    const params = {
      preset: "custom",
      from,
      to,
      restaurantId: restaurantId || "",
      orderType: nextOrderType,
    };

    const response = await getDashboardAnalytics(params);
    if (!response.status) {
      setError(response.message);
      showToast("error", response.message || "Erreur de chargement.");
      setIsDataFetching(false);
      setIsLoading(false);
      return;
    }

    setAnalyticsData(response.data || null);
    setError(null);
    setIsDataFetching(false);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
    loadAnalytics({
      restaurantId: role === "admin" ? "" : restaurant,
      dateMode: "day",
      fromDate: toInputDate(new Date()),
      toDate: toInputDate(new Date()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = analyticsData?.summary || {};
  const usersCount = analyticsData?.usersCount || 0;
  const charts = analyticsData?.charts || {};

  const selectedGraphLabel = useMemo(
    () =>
      GRAPH_OPTIONS.find((option) => option.value === selectedGraph)?.label ||
      "Graphique",
    [selectedGraph],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 bg-[#f5f7fb] h-screen  overflow-y-auto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className="max-w-[1600px] mx-auto">
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

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white shadow-default rounded-xl mt-4 p-4 flex flex-col gap-3 border border-gray-100">
          <div className="flex flex-wrap items-end gap-3">
            {role === "admin" && (
              <div className="min-w-[240px]">
                <label className="text-xs text-text-light-gray">
                  Restaurant
                </label>
                <select
                  className="block mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
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
              </div>
            )}

            <div className="min-w-[280px]">
              <label className="text-xs text-text-light-gray">
                Type de graphe
              </label>
              <select
                className="block mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                value={selectedGraph}
                onChange={(e) => setSelectedGraph(e.target.value)}
              >
                {GRAPH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px]">
              <label className="text-xs text-text-light-gray">
                Type de commande
              </label>
              <select
                className="block mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                value={selectedOrderType}
                onChange={(e) => {
                  const nextOrderType = e.target.value;
                  setSelectedOrderType(nextOrderType);
                  loadAnalytics({ orderType: nextOrderType });
                }}
              >
                <option value="all">Toutes les commandes</option>
                <option value="delivery">Livraison</option>
                <option value="pickup">Ramassage</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[170px]">
              <label className="text-xs text-text-light-gray">Mode date</label>
              <select
                className="block mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                value={dateMode}
                onChange={(e) => setDateMode(e.target.value)}
              >
                <option value="day">Jour</option>
                <option value="month">Mois</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-text-light-gray">De</label>
              <input
                type={dateMode === "month" ? "month" : "date"}
                value={dateMode === "month" ? fromMonth : fromDate}
                onChange={(e) =>
                  dateMode === "month"
                    ? setFromMonth(e.target.value)
                    : setFromDate(e.target.value)
                }
                className="block mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
              />
            </div>

            <div>
              <label className="text-xs text-text-light-gray">A</label>
              <input
                type={dateMode === "month" ? "month" : "date"}
                value={dateMode === "month" ? toMonth : toDate}
                onChange={(e) =>
                  dateMode === "month"
                    ? setToMonth(e.target.value)
                    : setToDate(e.target.value)
                }
                className="block mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
              />
            </div>

            <button
              className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95"
              onClick={() => loadAnalytics()}
            >
              Appliquer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mt-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs uppercase tracking-wide text-text-light-gray">
              Total revenu
            </p>
            <p className="text-xl font-semibold text-text-dark-gray mt-1">
              {formatMoney(summary.totalRevenue)}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs uppercase tracking-wide text-text-light-gray">
              Total vente
            </p>
            <p className="text-xl font-semibold text-text-dark-gray mt-1">
              {formatMoney(summary.totalNetSales)}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs uppercase tracking-wide text-text-light-gray">
              Total frais de livraison
            </p>
            <p className="text-xl font-semibold text-text-dark-gray mt-1">
              {formatMoney(summary.totalDeliveryFee)}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs uppercase tracking-wide text-text-light-gray">
              Nombre de commandes
            </p>
            <p className="text-xl font-semibold text-text-dark-gray mt-1">
              {summary.totalOrders || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs uppercase tracking-wide text-text-light-gray">
              Utilisateurs
            </p>
            <p className="text-xl font-semibold text-text-dark-gray mt-1">
              {usersCount}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl shadow-default border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-dark-gray">
              {selectedGraphLabel}
            </h2>
            {isDataFetching && (
              <span className="text-xs text-text-light-gray">
                Chargement...
              </span>
            )}
          </div>
          {isDataFetching ? (
            <div className="h-[420px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <AnalyticsChart selectedGraph={selectedGraph} charts={charts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
