"use client";
import React, { useEffect, useState } from "react";

import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import {
  getAllRestaurantsSettings,
  updateSettings,
} from "@/services/RestaurantServices";

const SettingsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [timePickerData, setTimePickerData] = useState(null);
  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const fetchData = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await getAllRestaurantsSettings();
      if (response.status) {
        setRestaurants(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const saveChanges = async (index) => {
    try {
      const restaurant = restaurants[index];
      const settings = restaurant.settings;
      let errorMessage = "";
      // Validation functions
      const validateTime = (time) => {
        if (!time) return false;
        const [hours, minutes] = time.split(":").map(Number);
        return (
          !isNaN(hours) &&
          !isNaN(minutes) &&
          hours >= 0 &&
          hours < 24 &&
          minutes >= 0 &&
          minutes < 60
        );
      };

      const validateDeliveryFee = (fee) => {
        const num = parseFloat(fee);
        return !isNaN(num) && num >= 0;
      };

      const validateDeliveryRange = (range) => {
        const num = parseFloat(range);
        return !isNaN(num) && num >= 0;
      };

      // Validate all settings
      const isValid = Object.entries(settings.emploie_du_temps || {}).every(
        ([_, { open, close }]) => validateTime(open) && validateTime(close)
      );

      if (!isValid) {
        errorMessage = "Format d'heure invalide";
      }

      if (!validateDeliveryFee(settings.delivery_fee)) {
        errorMessage = "Frais de livraison invalide";
        return;
      }

      if (
        settings.delivery_range &&
        !validateDeliveryRange(settings.delivery_range)
      ) {
        errorMessage = "Rayon de livraison invalide";
        return;
      }

      const courierTip = getCourierTipConfig(settings);
      const courierTipValue = Number(courierTip.with_customer_tip.value);
      const courierTipFixed = Number(courierTip.without_customer_tip_amount);
      const courierTipMinOrder = Number(courierTip.min_order_amount);
      if (
        !Number.isFinite(courierTipValue) ||
        courierTipValue < 0 ||
        (courierTip.with_customer_tip.mode === "percent" && courierTipValue > 100) ||
        !Number.isFinite(courierTipFixed) ||
        courierTipFixed < 0 ||
        !Number.isFinite(courierTipMinOrder) ||
        courierTipMinOrder < 0
      ) {
        errorMessage = "Pourboire livreur Uber invalide";
      }
      if (errorMessage) {
        setToastData({
          show: true,
          type: "error",
          message: errorMessage,
        });
        return;
      }

      setIsLoading(true);
      const response = await updateSettings(restaurant._id, {
        ...settings,
        uber_courier_tip: getCourierTipConfig(settings),
      });
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Paramètres mis à jour avec succès",
        });
        setRestaurants((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                  ...r,
                  settings: {
                    ...r.settings,
                    open: settings.open,
                    delivery: settings.delivery,
                    delivery_fee: settings.delivery_fee,
                    delivery_range: settings.delivery_range,
                  },
                }
              : r
          )
        );
      } else {
        setToastData({
          show: true,
          type: "error",
          message: response.message,
        });
      }
    } catch (error) {
      console.error(error);
      setToastData({
        show: true,
        type: "error",
        message: "Une erreur s'est produite",
      });
    } finally {
      setIsLoading(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  // Pourboire du livreur Uber Direct : valeurs par défaut si le restaurant n'est pas configuré.
  const getCourierTipConfig = (settings) => ({
    with_customer_tip: {
      mode: settings?.uber_courier_tip?.with_customer_tip?.mode || "fixed",
      value: settings?.uber_courier_tip?.with_customer_tip?.value ?? 0,
    },
    without_customer_tip_amount:
      settings?.uber_courier_tip?.without_customer_tip_amount ?? 0,
    min_order_amount: settings?.uber_courier_tip?.min_order_amount ?? 0,
  });

  const handleCourierTipChange = (index, field, value) => {
    setRestaurants((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const current = getCourierTipConfig(r.settings);
        const next =
          field === "without_customer_tip_amount" || field === "min_order_amount"
            ? { ...current, [field]: value }
            : {
                ...current,
                with_customer_tip: { ...current.with_customer_tip, [field]: value },
              };
        return { ...r, settings: { ...r.settings, uber_courier_tip: next } };
      })
    );
  };

  const handleTimeChange = (day, type, index, value) => {
    setRestaurants((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              settings: {
                ...r.settings,
                emploie_du_temps: {
                  ...r.settings.emploie_du_temps,
                  [day]: {
                    ...r.settings.emploie_du_temps[day],
                    [type]: value,
                  },
                },
              },
            }
          : r
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    <div className="bg-[#f5f7fb]  max-h-screen overflow-y-auto relative font-roboto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className=" mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Paramètres</h1>
            <p className="text-sm opacity-90 mt-1">
              Horaires, livraison et frais par restaurant.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-default border border-gray-100 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-dark-gray">
                  {restaurant.name}
                </h2>
                <button
                  className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95 transition"
                  onClick={() => saveChanges(index)}
                >
                  Sauvegarder
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm text-text-light-gray">Ouvert</p>
                    <p className="text-sm font-semibold text-text-dark-gray">
                      {restaurant.settings?.open ? "Oui" : "Non"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={restaurant?.settings?.open}
                      onChange={() =>
                        setRestaurants((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  settings: {
                                    ...r.settings,
                                    open: !r.settings.open,
                                  },
                                }
                              : r
                          )
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pr"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm text-text-light-gray">Livraison</p>
                    <p className="text-sm font-semibold text-text-dark-gray">
                      {restaurant.settings?.delivery ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={restaurant.settings?.delivery}
                      onChange={() =>
                        setRestaurants((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  settings: {
                                    ...r.settings,
                                    delivery: !r.settings.delivery,
                                  },
                                }
                              : r
                          )
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pr"></div>
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-light-gray">
                    Frais de livraison
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                      value={restaurant?.settings?.delivery_fee}
                      onChange={(e) =>
                        setRestaurants((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  settings: {
                                    ...r.settings,
                                    delivery_fee: e.target.value,
                                  },
                                }
                              : r
                          )
                        )
                      }
                    />
                    <span className="text-sm font-semibold text-text-dark-gray">
                      $
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-text-light-gray">
                    Rayon de livraison
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                      value={restaurant.settings?.delivery_range || ""}
                      onChange={(e) =>
                        setRestaurants((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  settings: {
                                    ...r.settings,
                                    delivery_range: e.target.value,
                                  },
                                }
                              : r
                          )
                        )
                      }
                    />
                    <span className="text-sm font-semibold text-text-dark-gray">
                      km
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-semibold text-text-dark-gray uppercase tracking-wide">
                  Pourboire livreur Uber Direct
                </h3>
                <p className="text-xs text-text-light-gray mt-1">
                  Envoyé au livreur Uber à la création de la livraison. Si le
                  montant dépasse le pourboire du client, le restaurant paie la
                  différence. Aucun pourboire si la commande est sous le seuil.
                </p>
                {(() => {
                  const courierTip = getCourierTipConfig(restaurant.settings);
                  const isPercent = courierTip.with_customer_tip.mode === "percent";
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-text-light-gray">
                          Le client laisse un pourboire (1 $ ou plus)
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-pr"
                            value={courierTip.with_customer_tip.mode}
                            onChange={(e) =>
                              handleCourierTipChange(index, "mode", e.target.value)
                            }
                          >
                            <option value="fixed">Montant fixe</option>
                            <option value="percent">% du pourboire du client</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            max={isPercent ? 100 : undefined}
                            step="0.01"
                            className="w-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                            value={courierTip.with_customer_tip.value}
                            onChange={(e) =>
                              handleCourierTipChange(index, "value", e.target.value)
                            }
                          />
                          <span className="text-sm font-semibold text-text-dark-gray">
                            {isPercent ? "%" : "$"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm text-text-light-gray">
                          Seuil de commande : pas de pourboire si le sous-total
                          (après rabais) est inférieur à
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                            value={courierTip.min_order_amount}
                            onChange={(e) =>
                              handleCourierTipChange(
                                index,
                                "min_order_amount",
                                e.target.value
                              )
                            }
                          />
                          <span className="text-sm font-semibold text-text-dark-gray">
                            $
                          </span>
                          <span className="text-xs text-text-light-gray">
                            (0 = aucun seuil)
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm text-text-light-gray">
                          Le client ne laisse pas de pourboire (moins de 1 $)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                            value={courierTip.without_customer_tip_amount}
                            onChange={(e) =>
                              handleCourierTipChange(
                                index,
                                "without_customer_tip_amount",
                                e.target.value
                              )
                            }
                          />
                          <span className="text-sm font-semibold text-text-dark-gray">
                            $
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-semibold text-text-dark-gray uppercase tracking-wide">
                  Heures d&apos;ouverture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {Object.keys(restaurant.settings?.emploie_du_temps || {}).map(
                    (day) => (
                      <div
                        key={day}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
                      >
                        <span className="text-sm font-semibold capitalize text-text-dark-gray">
                          {day}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-pr"
                            value={
                              restaurant.settings.emploie_du_temps[day]?.open ||
                              ""
                            }
                            onChange={(e) =>
                              handleTimeChange(
                                day,
                                "open",
                                index,
                                e.target.value
                              )
                            }
                          />
                          <span className="text-sm text-text-light-gray">
                            -
                          </span>
                          <input
                            type="time"
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-pr"
                            value={
                              restaurant.settings.emploie_du_temps[day]
                                ?.close || ""
                            }
                            onChange={(e) =>
                              handleTimeChange(
                                day,
                                "close",
                                index,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
