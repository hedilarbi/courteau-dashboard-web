"use client";
import React, { useEffect, useState } from "react";

import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import {
  getRestaurantsSettings,
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
      const response = await getRestaurantsSettings();
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
      if (errorMessage) {
        setToastData({
          show: true,
          type: "error",
          message: errorMessage,
        });
        return;
      }

      setIsLoading(true);
      const response = await updateSettings(restaurant._id, settings);
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
    <div className="bg-[#f5f5f5]  h-screen overflow-y-auto relative">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className="p-5">
        <h1 className="font-bebas-neue text-4xl">Paramètre</h1>

        {restaurants.map((restaurant, index) => (
          <div
            key={index}
            className={`border-b-2 border-black pb-5 ${
              index === restaurants.length - 1 ? "border-b-0" : ""
            }`}
          >
            <h2 className="font-lato-bold text-2xl mt-5">{restaurant.name}</h2>

            <div className="flex items-center mt-5">
              <span className="font-lato-bold text-xl">Ouvert:</span>
              <label className="relative inline-flex items-center cursor-pointer ml-5">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7A600]"></div>
              </label>
            </div>

            <div className="flex items-center mt-5">
              <span className="font-lato-bold text-xl">Livraison:</span>
              <label className="relative inline-flex items-center cursor-pointer ml-5">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7A600]"></div>
              </label>
            </div>

            <div className="flex items-center mt-5">
              <span className="font-lato-bold text-xl">
                Frais de livraison:
              </span>
              <input
                type="number"
                className="w-12 ml-5 p-1 bg-white rounded font-lato-regular text-lg"
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
              <span className="font-lato-bold text-xl ml-2">$</span>
            </div>

            <div className="flex items-center mt-5">
              <span className="font-lato-bold text-xl">
                Rayon de livraison:
              </span>
              <input
                type="number"
                className="w-12 ml-5 p-1 bg-white rounded font-lato-regular text-lg"
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
              <span className="font-lato-bold text-xl ml-2">km</span>
            </div>

            <div className="mt-5">
              <h3 className="font-lato-bold text-xl">
                Heure d&apos;ouverture:
              </h3>
              {Object.keys(restaurant.settings?.emploie_du_temps || {}).map(
                (day) => (
                  <div key={day} className="my-2.5">
                    <span className="font-lato-regular text-lg capitalize">
                      {day}:
                    </span>
                    <div className="flex items-center mt-2.5">
                      <input
                        type="time"
                        className="bg-white rounded p-1 font-lato-regular text-lg mr-2.5"
                        value={
                          restaurant.settings.emploie_du_temps[day]?.open || ""
                        }
                        onChange={(e) =>
                          handleTimeChange(day, "open", index, e.target.value)
                        }
                      />
                      <span className="font-lato-regular text-lg">-</span>
                      <input
                        type="time"
                        className="bg-white rounded p-1 font-lato-regular text-lg ml-2.5"
                        value={
                          restaurant.settings.emploie_du_temps[day]?.close || ""
                        }
                        onChange={(e) =>
                          handleTimeChange(day, "close", index, e.target.value)
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end mt-5">
              <button
                className="bg-[#F7A600] px-5 py-2.5 rounded font-lato-bold text-lg"
                onClick={() => saveChanges(index)}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsScreen;
