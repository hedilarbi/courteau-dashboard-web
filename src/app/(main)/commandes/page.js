"use client";
import { useState, useEffect } from "react";

import { FaChevronUp, FaChevronDown, FaTrash } from "react-icons/fa";

import { OrderStatus } from "../../../constants";
import { FaMagnifyingGlass } from "react-icons/fa6";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import ToastNotification from "@/components/ToastNotification";
import { useRouter } from "next/navigation";
import {
  deleteOrder,
  getOrderFiltred,
  getRestaurantList,
} from "@/services/OrdersServices";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import { HiMiniPencil } from "react-icons/hi2";
import Spinner from "@/components/spinner/Spinner";

const OrdersScreen = () => {
  const router = useRouter();
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const setOrderStatusColor = (status) => {
    switch (status) {
      case OrderStatus.READY:
        return "text-[#2AB2DB]";
      case OrderStatus.DONE:
        return "text-[#2AB2DB]";
      case OrderStatus.IN_DELIVERY:
        return "text-[#2AB2DB]";
      case OrderStatus.ON_GOING:
        return "text-[#F3A32B]";
      case OrderStatus.CANCELED:
        return "text-[#FF0707]";
      default:
        return "text-black";
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderId, setOrderId] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState("");
  const [navigaTo, setNavigaTo] = useState("");
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [restaurantList, setRestaurantList] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState({
    label: "Tous les restaurants",
    value: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      if (page < 1) {
        return;
      }
      if (pages !== 0 && page > pages) {
        return;
      }

      const [response, response2] = await Promise.all([
        getOrderFiltred({
          page,
          limit: 20,
          status: filter,
          search,
          restaurant: selectedRestaurant.value,
        }),
        getRestaurantList(),
      ]);

      if (response.status) {
        setOrders(response.data.orders);
        setPages(response.data.pages);
      }
      if (response2.status) {
        let list = [
          {
            label: "Tous les restaurants",
            value: "",
          },
        ];
        response2.data.map((r) =>
          list.push({
            label: r.name,
            value: r._id,
          })
        );
        setRestaurantList(list);
      }
    } catch (e) {
      setError(true);
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const response = await deleteOrder(orderId);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Commande supprimée avec succès",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message: "Erreur lors de la suppression de la commande",
        });
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message: "Erreur lors de la suppression de la commande",
      });
    } finally {
      setDeleteWarningModelState(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh, page, filter, selectedRestaurant]);

  const handleShowDeleteWarning = (id) => {
    setOrderId(id);
    setDeleteWarningModelState(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="font-lato-bold text-2xl text-red-500">
          Une erreur s&apos;est produite
        </h1>
        <button
          className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-white"
          onClick={() => setRefresh((prev) => prev + 1)}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {deleteWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setDeleteWarningModelState}
          message={`Etes-vous sûr de vouloir supprimer cette commande ?`}
          action={handleDeleteOrder}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold">Commandes</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                    {orders.length} commande(s)
                  </span>
                  {selectedRestaurant.label && (
                    <span className="bg-white/15 border border-white/20 text-sm px-3 py-1 rounded-full">
                      {selectedRestaurant.label}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm opacity-90 mt-1">
                Filtrez, recherchez et gérez vos commandes en cours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="bg-white/15 border border-white/25 rounded-md px-3 py-2 flex items-center gap-2 backdrop-blur">
                <FaMagnifyingGlass size={16} />
                <input
                  className="bg-transparent placeholder-white/70 text-sm focus:outline-none w-48"
                  placeholder="Chercher par code"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>
              <button
                className="bg-white text-[#111827] font-semibold rounded-md px-4 py-2 shadow-sm hover:brightness-95 transition"
                onClick={fetchData}
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-md font-semibold ${
              page <= 1
                ? "bg-gray-200 text-text-light-gray cursor-not-allowed"
                : "bg-pr text-white hover:brightness-95"
            }`}
            disabled={page <= 1}
          >
            Précédent
          </button>

          {pages > 0 && (
            <div className="flex items-center gap-2">
              <input
                className="font-lato-regular text-sm w-24 border border-gray-300 rounded px-2 py-2 focus:outline-none focus:border-pr"
                placeholder="Aller à"
                onChange={(e) => setNavigaTo(e.target.value)}
                value={navigaTo}
                type="number"
                min={1}
              />
              <button
                className="bg-white border border-gray-300 text-text-dark-gray px-3 py-2 rounded-md hover:border-pr"
                onClick={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                Aller
              </button>
              <span className="font-lato-regular text-lg text-text-dark-gray">
                {"Page " + page + (pages > 0 ? "/" + pages : "")}
              </span>
            </div>
          )}

          <button
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-md font-semibold ${
              page >= pages
                ? "bg-gray-200 text-text-light-gray cursor-not-allowed"
                : "bg-pr text-white hover:brightness-95"
            }`}
            disabled={page >= pages}
          >
            Suivant
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-default p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <button
              className="inline-flex items-center gap-2 text-sm font-semibold text-pr"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <span>Filtres</span>
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Tout", value: "" },
                    { label: OrderStatus.READY, value: OrderStatus.READY },
                    {
                      label: OrderStatus.ON_GOING,
                      value: OrderStatus.ON_GOING,
                    },
                    {
                      label: OrderStatus.IN_DELIVERY,
                      value: OrderStatus.IN_DELIVERY,
                    },
                    { label: OrderStatus.DONE, value: OrderStatus.DONE },
                  ].map((opt) => (
                    <button
                      key={opt.value || "all"}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        filter === opt.value
                          ? "bg-pr text-white border-pr"
                          : "bg-white text-text-dark-gray border-gray-200"
                      }`}
                      onClick={() => setFilter(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-text-light-gray mb-1">
                    Restaurant
                  </label>
                  <select
                    className="h-10 w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr bg-white"
                    value={selectedRestaurant.value}
                    onChange={(e) => {
                      const selected = restaurantList.find(
                        (r) => r.value === e.target.value
                      );
                      setSelectedRestaurant(
                        selected || { label: "Tous les restaurants", value: "" }
                      );
                    }}
                  >
                    {restaurantList.map((restaurant) => (
                      <option key={restaurant.value} value={restaurant.value}>
                        {restaurant.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-text-light-gray px-4 py-3">
              <span className="col-span-2">Statut</span>
              <span className="col-span-2">Code</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2 ">Total</span>
              <span className="col-span-3">Créée le</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>
            {orders.length > 0 ? (
              <div className="divide-y divide-gray-100 h-[calc(100vh-340px)] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <span
                      className={`col-span-2 text-sm font-semibold ${setOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="col-span-2 text-sm font-medium text-text-dark-gray">
                      {order.code}
                    </span>
                    <span className="col-span-2 text-sm text-text-dark-gray">
                      {order.type === "delivery" ? "Livraison" : "Emporter"}
                    </span>
                    <span className="col-span-2 text-sm  font-semibold text-text-dark-gray ">
                      {order.total_price.toFixed(2)} $
                    </span>
                    <span className="col-span-3 text-sm text-text-light-gray">
                      {dateToDDMMYYYYHHMM(order.createdAt)}
                    </span>
                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                        onClick={() => router.push(`/commandes/${order._id}`)}
                        aria-label="Voir la commande"
                      >
                        <HiMiniPencil size={18} />
                      </button>
                      <button
                        className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                        onClick={() => handleShowDeleteWarning(order._id)}
                        aria-label="Supprimer la commande"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-text-light-gray text-sm">
                Aucune commande trouvée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersScreen;
