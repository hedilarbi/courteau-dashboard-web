"use client";

import { FaStar } from "react-icons/fa6";

import { OrderStatus } from "../../../../constants";

import useGetOrder from "@/hooks/useGetOrder";
import Spinner from "@/components/spinner/Spinner";
import React from "react";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import GoBackButton from "@/components/GoBackButton";
import { FaPrint } from "react-icons/fa";
import { Printer, render, Text } from "react-thermal-printer";

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

  const handlePrint = async () => {
    try {
      const data = await render(
        <Printer type="epson">
          <Text>Hello World</Text>
        </Printer>
      );

      const port = await window.navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable?.getWriter();
      if (writer != null) {
        await writer.write(data);
        writer.releaseLock();
      }
    } catch (error) {
      console.error("Error printing:", error);
      alert("Une erreur s'est produite lors de l'impression.");
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
    <div className="flex-1 bg-[#f5f7fb] max-h-screen overflow-y-auto font-roboto">
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-5">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <GoBackButton />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                  Commande
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-semibold">#{order.code}</h2>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                      {order.type === "delivery" ? "Livraison" : "Emporter"}
                    </span>
                    <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                      {order.orderItems?.length +
                        order.offers?.length +
                        order.rewards?.length}{" "}
                      article(s)
                    </span>
                    <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                      Total {parseFloat(order.total_price).toFixed(2)} $
                    </span>
                  </div>
                </div>

                <p className="text-sm opacity-90">
                  Créée le {dateToDDMMYYYYHHMM(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${setOrderStatusColor(
                  order.status
                )} bg-white/15 border border-white/25`}
              >
                {order.status}
              </span>
              <button
                className="bg-white text-[#111827] p-3 rounded-md shadow-sm hover:brightness-95 transition flex items-center gap-2"
                onClick={handlePrint}
              >
                <FaPrint size={18} />
                <span className="text-sm font-semibold">Imprimer</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <section className="bg-white shadow-default rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Articles
                </h3>
                <span className="text-xs text-text-light-gray">
                  {order.orderItems?.length || 0} article(s)
                </span>
              </div>
              {order.orderItems?.length > 0 ? (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-2">
                    <span className="col-span-3">Nom</span>
                    <span className="col-span-3">Commentaire</span>
                    <span className="col-span-2">Taille</span>
                    <span className="col-span-3">Personnalisations</span>
                    <span className="col-span-1 text-right">Prix</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item._id}
                        className="grid grid-cols-12 items-center px-4 py-3 text-sm"
                      >
                        <span className="col-span-3 font-semibold text-text-dark-gray truncate">
                          {item.item.name}
                        </span>
                        <span className="col-span-3 text-text-light-gray truncate">
                          {item.comment || "—"}
                        </span>
                        <span className="col-span-2 text-text-dark-gray">
                          {item.size}
                        </span>
                        <span className="col-span-3 text-text-light-gray">
                          {item.customizations?.length
                            ? item.customizations
                                .map((custo) => custo.name)
                                .join(", ")
                            : "—"}
                        </span>
                        <span className="col-span-1 text-right font-semibold text-text-dark-gray">
                          {item.price.toFixed(2)} $
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-text-light-gray text-center py-4">
                  Aucun article
                </div>
              )}
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Offres
                </h3>
                <span className="text-xs text-text-light-gray">
                  {order.offers?.length || 0} offre(s)
                </span>
              </div>
              {order.offers?.length > 0 ? (
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {order.offers?.map((item) => (
                    <div key={item._id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-text-dark-gray">
                          {item.offer?.name}
                        </p>
                        <p className="text-sm font-semibold text-pr">
                          {item.offer?.price.toFixed(2)} $
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-text-light-gray">
                        {item.items?.map((offerItem, index) => (
                          <span
                            key={index}
                            className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1"
                          >
                            {offerItem.item.name}
                            {offerItem.customizations?.length
                              ? ` (${offerItem.customizations
                                  .map((c) => c.name)
                                  .join(", ")})`
                              : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-text-light-gray text-center py-4">
                  Aucune offre
                </div>
              )}
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Récompense
                </h3>
                <span className="text-xs text-text-light-gray">
                  {order.rewards?.length || 0} récompense(s)
                </span>
              </div>
              {order.rewards?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {order.rewards?.map((item, index) => (
                    <span
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-sm text-text-dark-gray"
                    >
                      {item.item.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-text-light-gray text-center py-4">
                  Aucune récompense
                </div>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Instructions
                </h3>
              </div>
              <p className="text-sm text-text-dark-gray leading-relaxed bg-gray-50 border border-gray-100 rounded-md p-3">
                {order.instructions ? order.instructions : "Aucune instruction"}
              </p>
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Informations générales
                </h3>
              </div>
              <div className="space-y-2 text-sm text-text-dark-gray">
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Code</span>
                  <span className="font-semibold">{order.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Type</span>
                  <span className="font-semibold">
                    {order.type === "delivery" ? "Livraison" : "Emporter"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">
                    Nombre d&apos;article
                  </span>
                  <span className="font-semibold">
                    {order.orderItems?.length +
                      order.offers?.length +
                      order.rewards?.length}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Paiement
                </h3>
              </div>
              <div className="space-y-2 text-sm text-text-dark-gray">
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Sous-total</span>
                  <span className="font-semibold">
                    {order.sub_total.toFixed(2)} $
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-light-gray">Remise</span>
                    <span className="font-semibold">
                      -{order.discount}% (
                      {order.sub_total_after_discount?.toFixed(2)} $)
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">TVQ</span>
                  <span className="font-semibold">{tvq.toFixed(2)} $</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">TPS</span>
                  <span className="font-semibold">{tps.toFixed(2)} $</span>
                </div>
                {order.type === "delivery" && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-light-gray">
                      Frais de livraison
                    </span>
                    <span className="font-semibold">
                      {order.delivery_fee.toFixed(2)} $
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Pourboire</span>
                  <span className="font-semibold">
                    {order.tip?.toFixed(2)} $
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-text-light-gray font-semibold">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-pr">
                    {parseFloat(order.total_price).toFixed(2)} $
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Client
                </h3>
              </div>
              <div className="space-y-2 text-sm text-text-dark-gray">
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Nom & prénom</span>
                  <span className="font-semibold">{order.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">Téléphone</span>
                  <span className="font-semibold">
                    {order?.user?.phone_number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-light-gray">E-mail</span>
                  <span className="font-semibold truncate">
                    {order.user?.email}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-light-gray">Adresse</span>
                  <span className="font-semibold text-sm leading-relaxed">
                    {order.address || "—"}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white shadow-default rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  Review
                </h3>
              </div>
              {order.review?.status ? (
                <div className="flex items-center gap-3 text-text-dark-gray">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-light-gray">Note</span>
                    <span className="text-lg font-semibold">
                      {order.review.rating}
                    </span>
                    <FaStar color="#facc15" />
                  </div>
                  <div className="text-sm text-text-light-gray">|</div>
                  <p className="text-sm">{order.review.comment}</p>
                </div>
              ) : (
                <p className="text-sm text-text-light-gray">
                  Aucune review pour cette commande.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
