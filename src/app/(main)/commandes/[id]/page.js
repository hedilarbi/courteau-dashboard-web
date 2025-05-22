"use client";

import { FaStar } from "react-icons/fa6";

import { OrderStatus } from "../../../../constants";

import useGetOrder from "@/hooks/useGetOrder";
import Spinner from "@/components/spinner/Spinner";
import React from "react";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import GoBackButton from "@/components/GoBackButton";

const OrderScreen = ({ params }) => {
  const { id } = params;
  const {
    order,
    isLoading,
    setIsLoading,
    setOrder,
    error,
    setRefresh,
    tvq,
    tps,
  } = useGetOrder(id);

  const setOrderStatusColor = (status) => {
    switch (status) {
      case OrderStatus.READY:
        return "text-[#2AB2DB]";
      case OrderStatus.DONE:
        return "text-[#2AB2DB]";
      case OrderStatus.IN_DELIVERY:
        return "text-[#2AB2DB]";
      case OrderStatus.CANCELED:
        return "text-[#FF0707]";
      default:
        return "text-black";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#f5f5f5] h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen overflow-y-auto">
        <h1 className="font-lato-bold text-2xl text-red-500">
          Une erreur s'est produite
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
    <div className="flex-1 bg-[#f5f5f5] h-screen overflow-y-auto">
      <div className="flex gap-4 items-center  p-4">
        <GoBackButton />
        <h2 className="text-2xl font-roboto font-semibold ">
          Commande {order.code}
        </h2>
      </div>

      <div className="flex-1 pb-10">
        <div className="flex-1 p-4">
          {/* Instructions Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">Instructions</h2>
            <div className="bg-white rounded-xl p-4 mt-2.5">
              <p className="font-lato-regular text-lg text-center">
                {order.instructions ? order.instructions : "Aucune"}
              </p>
            </div>
          </div>

          {/* Articles Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">Articles</h2>
            {order.orderItems?.length > 0 ? (
              <div className="mt-5 bg-white overflow-auto">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                      index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                    }`}
                  >
                    <span className="font-lato-regular text-lg w-1/5 truncate">
                      {item.item.name}
                    </span>
                    <span className="font-lato-regular text-lg w-[15%] truncate">
                      {item.comment || ""}
                    </span>
                    <span className="font-lato-regular text-lg w-[10%]">
                      {item.size}
                    </span>
                    <span className="font-lato-regular text-lg flex-1">
                      {item.customizations?.map((custo) => custo.name + "/")}
                    </span>
                    <span className="font-lato-regular text-lg w-[15%]">
                      {item.price.toFixed(2)} $
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl py-2.5 flex justify-center items-center mt-5">
                <p className="font-lato-bold text-xl">Vide</p>
              </div>
            )}
          </div>

          {/* Offers Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">Offres</h2>
            {order.offers?.length > 0 ? (
              <div className="mt-5 bg-white overflow-auto">
                {order.offers?.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                      index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                    }`}
                  >
                    <span className="font-lato-regular text-lg truncate">
                      {item.offer?.name}
                    </span>
                    <div>
                      {item.items?.map((offerItem, index) => (
                        <div className="flex flex-row" key={index}>
                          <span className="font-lato-regular text-lg truncate">
                            {offerItem.item.name}
                          </span>
                          <span>(</span>
                          {offerItem.customizations?.map((custo, i) => (
                            <span className="font-lato-regular text-lg" key={i}>
                              {custo.name},{" "}
                            </span>
                          ))}
                          <span>)</span>
                        </div>
                      ))}
                    </div>
                    <span className="font-lato-regular text-lg truncate">
                      {item.offer?.price.toFixed(2)} $
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl py-2.5 flex justify-center items-center mt-5">
                <p className="font-lato-bold text-xl">Vide</p>
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">Récompense</h2>
            {order.rewards?.length > 0 ? (
              <div className="mt-5 bg-white overflow-auto">
                {order.rewards?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                      index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                    }`}
                  >
                    <span className="font-lato-regular text-lg truncate">
                      {item.item.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl py-2.5 flex justify-center items-center mt-5">
                <p className="font-lato-bold text-xl">Vide</p>
              </div>
            )}
          </div>

          {/* General Information Section */}
          <div>
            <h2 className="font-lato-bold text-2xl my-2.5">
              Informations générale
            </h2>
            <div className="bg-white rounded-xl p-5 mt-2.5">
              <div className="flex flex-row justify-between">
                <div className="w-1/2">
                  <div className="flex flex-row items-center">
                    <span className="font-lato-bold text-lg">Etat:</span>

                    <div className="flex flex-row items-center ml-2.5">
                      <span
                        className={`font-lato-regular text-lg ml-2.5 flex-1 ${setOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Code:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.code}
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Type</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.type === "delivery" ? "Livraison" : "Emporter"}
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Crée le:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {dateToDDMMYYYYHHMM(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">
                      Nombre d'article:
                    </span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.orderItems?.length +
                        order.offers?.length +
                        order.rewards?.length}{" "}
                      article(s)
                    </span>
                  </div>
                </div>

                <div className="w-1/2">
                  <div className="flex flex-row items-center">
                    <span className="font-lato-bold text-lg">Totale:</span>

                    <div className="flex flex-row items-center ml-2.5">
                      <span className="font-lato-regular text-lg ml-2.5 flex-1">
                        {parseFloat(order.total_price).toFixed(2)} $
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Sous-totale:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.sub_total.toFixed(2)} $
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex flex-row items-center mt-2.5">
                      <span className="font-lato-bold text-lg">
                        Sous-totale apres remise:
                      </span>
                      <span className="font-lato-regular text-lg ml-2.5">
                        {order.sub_total_after_discount?.toFixed(2)} $ (-{" "}
                        {order.discount} %)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">TVQ:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {tvq.toFixed(2)} $
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">TPS:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {tps.toFixed(2)} $
                    </span>
                  </div>

                  {order.type === "delivery" && (
                    <div className="flex flex-row items-center mt-2.5">
                      <span className="font-lato-bold text-lg">
                        Frais de livraison:
                      </span>
                      <span className="font-lato-regular text-lg ml-2.5">
                        {order.delivery_fee.toFixed(2)} $
                      </span>
                    </div>
                  )}

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Pourboire:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.tip?.toFixed(2)} $
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">
              Informations Client
            </h2>
            <div className="bg-white rounded-xl p-5 mt-2.5">
              <div className="flex flex-row justify-between">
                <div className="w-1/2">
                  <div className="flex flex-row items-center">
                    <span className="font-lato-bold text-lg">
                      Nom & prénom:
                    </span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.user?.name}
                    </span>
                  </div>

                  <div className="flex flex-row items-center mt-2.5">
                    <span className="font-lato-bold text-lg">Téléphone:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order?.user?.phone_number}
                    </span>
                  </div>
                </div>

                <div className="w-1/2">
                  <div className="flex flex-row items-center">
                    <span className="font-lato-bold text-lg">E-mail:</span>
                    <span className="font-lato-regular text-lg ml-2.5">
                      {order.user?.email}
                    </span>
                  </div>

                  <div className="flex flex-row mt-2.5">
                    <span className="font-lato-bold text-lg">Adresse:</span>
                    <span className="font-lato-regular text-lg ml-2.5 w-[70%] truncate">
                      {order.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div>
            <h2 className="font-lato-bold text-2xl mt-5">Review</h2>
            <div className="bg-white rounded-xl py-2.5 flex justify-center items-center mt-5">
              {order.review?.status ? (
                <div className="flex flex-row items-center w-full px-3">
                  <div className="flex flex-row items-center w-1/3">
                    <span className="font-lato-bold text-2xl mr-3">Note:</span>
                    <span className="font-lato-bold text-2xl mr-3">
                      {order.review.rating}
                    </span>

                    <FaStar color="#facc15" />
                  </div>
                  <div className="flex flex-row items-center">
                    <span className="font-lato-bold text-2xl mr-3">
                      Commentaire:
                    </span>
                    <span className="font-lato-regular text-2xl">
                      {order.review.comment}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="font-lato-bold text-xl">Aucune review</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
