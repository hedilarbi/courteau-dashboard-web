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
    <div className="bg-[#f5f5f5] h-screen overflow-y-auto ">
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

      <div className="flex-1 p-5">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bebas-neue text-4xl">Commandes</h1>

          <div className="flex flex-row items-center mt-3">
            <div className="bg-white flex flex-row w-[300px] items-center pb-1 pt-1 pl-1 border border-gray-300 rounded">
              <FaMagnifyingGlass />
              <input
                className="font-lato-regular text-lg ml-1 flex-1 outline-none"
                placeholder="Chercher par code"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <button
              className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-black"
              onClick={fetchData}
            >
              Rechercher
            </button>
          </div>
        </div>

        <button
          className="flex flex-row bg-[#F7A600] px-3 py-2 rounded justify-between items-center w-[140px] mt-3.5"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          <span className="font-lato-bold text-lg">Filtres</span>
          {showFilters ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        <div
          className={`mt-5 flex flex-row items-center gap-10 ${
            showFilters ? "flex" : "hidden"
          }`}
        >
          <button
            className={`px-5 py-2.5 rounded border ${
              filter === "" ? "bg-[#F7A600]" : "bg-white"
            }`}
            onClick={() => setFilter("")}
          >
            <span className="font-lato-bold text-lg">Tout</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded border ${
              filter === OrderStatus.READY ? "bg-[#F7A600]" : "bg-white"
            }`}
            onClick={() => setFilter(OrderStatus.READY)}
          >
            <span className="font-lato-bold text-lg">{OrderStatus.READY}</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded border ${
              filter === OrderStatus.ON_GOING ? "bg-[#F7A600]" : "bg-white"
            }`}
            onClick={() => setFilter(OrderStatus.ON_GOING)}
          >
            <span className="font-lato-bold text-lg">
              {OrderStatus.ON_GOING}
            </span>
          </button>
          <button
            className={`px-5 py-2.5 rounded border ${
              filter === OrderStatus.IN_DELIVERY ? "bg-[#F7A600]" : "bg-white"
            }`}
            onClick={() => setFilter(OrderStatus.IN_DELIVERY)}
          >
            <span className="font-lato-bold text-lg">
              {OrderStatus.IN_DELIVERY}
            </span>
          </button>
          <button
            className={`px-5 py-2.5 rounded border ${
              filter === OrderStatus.DONE ? "bg-[#F7A600]" : "bg-white"
            }`}
            onClick={() => setFilter(OrderStatus.DONE)}
          >
            <span className="font-lato-bold text-lg">{OrderStatus.DONE}</span>
          </button>
        </div>

        <div className={`mt-5 ${showFilters ? "block" : "hidden"}`}>
          <select
            className="h-10 w-[350px] border-2 border-[#F7A600] px-1.5 py-1 bg-[#F7A600] text-lg font-lato-regular"
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

        <div className="flex-1">
          {orders.length > 0 ? (
            <div className="w-full mt-4 border border-black overflow-y-auto h-[calc(100vh-250px)] ">
              {orders.map((order, index) => (
                <div
                  key={order._id}
                  className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                    index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                  }`}
                >
                  <span
                    className={`font-lato-regular text-lg w-[10%] ${setOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-lato-regular text-lg w-[15%]">
                    {order.code}
                  </span>
                  <span className="font-lato-regular text-lg w-[10%]">
                    {order.type === "delivery" ? "Livraison" : "Emporter"}
                  </span>
                  <span className="font-lato-regular text-lg w-[10%]">
                    {order.total_price.toFixed(2)} $
                  </span>
                  <span className="font-lato-regular text-lg flex-1">
                    {dateToDDMMYYYYHHMM(order.createdAt)}
                  </span>
                  <button
                    className="flex justify-center items-center"
                    onClick={() => router.push(`/commandes/${order._id}`)}
                  >
                    <HiMiniPencil color="#2AB2DB" size={24} />
                  </button>
                  <button
                    className="flex justify-center items-center"
                    onClick={() => handleShowDeleteWarning(order._id)}
                  >
                    <FaTrash color="#F31A1A" size={24} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white flex-1 mt-5 rounded-xl flex justify-center items-center h-[calc(100vh-250px)]">
              <h2 className="font-lato-bold text-2xl">Aucune Commande</h2>
            </div>
          )}
        </div>

        <div className="flex flex-row justify-center">
          <span className="font-lato-regular text-lg">
            {"Page " + page + (pages > 0 ? "/" + pages : "")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-3 py-2 rounded ${
                page <= 1 ? "bg-gray-500" : "bg-[#F7A600]"
              }`}
              disabled={page <= 1}
            >
              <span className="text-white">Précédent</span>
            </button>
          </div>

          {pages > 0 && (
            <div className="flex flex-row items-center">
              <input
                className="font-lato-regular text-lg w-24 border border-gray-300 rounded px-1.5 py-1"
                placeholder="Page"
                onChange={(e) => setNavigaTo(e.target.value)}
                value={navigaTo}
                type="number"
              />
              <button
                className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-black"
                onClick={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                Rechercher
              </button>
            </div>
          )}

          <div>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className={`px-3 py-2 rounded ${
                page >= pages ? "bg-gray-500" : "bg-[#F7A600]"
              }`}
              disabled={page >= pages}
            >
              <span className="text-white">Suivant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersScreen;
