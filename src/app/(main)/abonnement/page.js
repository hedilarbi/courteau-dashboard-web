"use client";

import React, { useEffect, useState } from "react";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import {
  getSubscriptionConfig,
  updateSubscriptionConfig,
} from "@/services/SubscriptionServices";

const SubscriptionSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("11.99");
  const [currency, setCurrency] = useState("cad");
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [error, setError] = useState("");

  const fetchConfig = async () => {
    setIsLoading(true);
    setError("");
    const response = await getSubscriptionConfig();
    if (!response.status) {
      setError(response.message || "Erreur lors du chargement.");
      setIsLoading(false);
      return;
    }

    const nextPrice = Number(response.data?.monthlyPrice ?? 11.99);
    setMonthlyPrice(nextPrice.toFixed(2));
    setCurrency(String(response.data?.currency || "cad").toUpperCase());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    const parsedPrice = Number(monthlyPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setToastData({
        show: true,
        type: "error",
        message: "Le prix doit être un nombre supérieur à 0.",
      });
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
      return;
    }

    setIsSaving(true);
    const response = await updateSubscriptionConfig(parsedPrice);
    if (!response.status) {
      setToastData({
        show: true,
        type: "error",
        message: response.message || "Erreur de mise à jour.",
      });
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
      setIsSaving(false);
      return;
    }

    const updatedPrice = Number(response.data?.monthlyPrice ?? parsedPrice);
    setMonthlyPrice(updatedPrice.toFixed(2));
    setCurrency(String(response.data?.currency || "cad").toUpperCase());
    setToastData({
      show: true,
      type: "success",
      message: "Prix abonnement mis à jour avec succès.",
    });
    setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 3000);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={fetchConfig}
            className="mt-3 bg-pr text-white px-4 py-2 rounded-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] max-h-screen overflow-y-auto p-5">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className="max-w-2xl">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-semibold">Abonnement</h1>
          <p className="text-sm opacity-90 mt-1">
            Modifiez le prix mensuel affiché et utilisé pour l&apos;abonnement client.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-default p-5 mt-4">
          <label className="text-sm text-text-light-gray">Prix mensuel</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-40 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
            />
            <span className="text-sm font-semibold text-text-dark-gray">
              {currency}
            </span>
          </div>
          <p className="text-xs text-text-light-gray mt-2">
            Avantages appliqués côté client: -20% commande, 0 livraison, 1 article
            gratuit/mois.
          </p>

          <button
            onClick={saveConfig}
            disabled={isSaving}
            className={
              isSaving
                ? "mt-4 bg-gray-300 text-white px-5 py-2 rounded-md font-semibold"
                : "mt-4 bg-pr text-white px-5 py-2 rounded-md font-semibold shadow-sm hover:brightness-95 transition"
            }
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettingsPage;
