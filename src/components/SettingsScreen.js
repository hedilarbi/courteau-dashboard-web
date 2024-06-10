"use client";
import React, { useEffect, useRef, useState } from "react";
import ToggleButton from "./toggleButton/ToggleButton";
import { validatehours, validatemins } from "@/utils/timeValidators";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { updateSettingsService } from "@/services/SettingsServices";

const SettingsScreen = ({ data }) => {
  const [openToggled, setOpenToggled] = useState(data.settings[0].open);
  const [deliveryToggled, setDeliveryToggled] = useState(
    data.settings[0].delivery
  );
  const [deliveryFee, setDeliveryFee] = useState(data.settings[0].delivery_fee);
  const [openTime, setOpenTime] = useState(data.settings[0].working_hours.open);
  const [closeTime, setCloseTime] = useState(
    data.settings[0].working_hours.close
  );
  const [error, setError] = useState(null);
  const openTimeHoursRef = useRef(null);
  const openTimeMinutesRef = useRef(null);
  const closeTimeHoursRef = useRef(null);
  const closeTimeMinutesRef = useRef(null);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenTimeHoursChange = (e) => {
    const { value } = e.target;
    if (value.length > 2) {
      openTimeMinutesRef.current.focus();
    } else {
      setOpenTime({ ...openTime, hours: e.target.value });
    }
  };
  const handleOpenTimeMinutesChange = (e) => {
    const { value } = e.target;
    if (value.length > 2) {
      return;
    } else {
      setOpenTime({ ...openTime, minutes: e.target.value });
    }
  };
  const handleCloseTimeHoursChange = (e) => {
    const { value } = e.target;
    if (value.length > 2) {
      closeTimeMinutesRef.current.focus();
    } else {
      setCloseTime({ ...closeTime, hours: e.target.value });
    }
  };
  const handleCloseTimeMinutesChange = (e) => {
    const { value } = e.target;
    if (value.length > 2) {
      return;
    } else {
      setCloseTime({ ...closeTime, minutes: e.target.value });
    }
  };

  const updateSettings = async () => {
    const isOpenHoursValid = validatehours(openTime.hours);
    const isOpenMinutesValid = validatemins(openTime.minutes);
    const isCloseHoursValid = validatehours(closeTime.hours);
    const isCloseMinutesValid = validatemins(closeTime.minutes);

    if (!isOpenHoursValid || !isOpenMinutesValid) {
      setError("Veuillez entrer une heure d'ouverture valide");
      setShowFailModel(true);
      return;
    }
    if (!isCloseHoursValid || !isCloseMinutesValid) {
      setError("Veuillez entrer une heure de fermeture valide");
      setShowFailModel(true);
      return;
    }
    if (openTime.hours > closeTime.hours) {
      setError(
        "L'heure d'ouverture ne peut pas être supérieure à l'heure de fermeture"
      );
      setShowFailModel(true);
      return;
    }
    const delivery_fee = Number(deliveryFee);
    if (!delivery_fee || delivery_fee < 0) {
      setError("Veuillez entrer un frais de livraison valide");
      setShowFailModel(true);
      return;
    }
    setError(null);
    setIsLoading(true);
    const settings = {
      working_hours: {
        open: {
          hours: openTime.hours,
          minutes: openTime.minutes,
        },
        close: {
          hours: closeTime.hours,
          minutes: closeTime.minutes,
        },
      },
      open: openToggled,
      delivery: deliveryToggled,
      delivery_fee: deliveryFee,
      _id: data.settings[0]._id,
      addresses: [],
    };
    try {
      const response = await updateSettingsService(settings);
      if (response.status) {
        setIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setIsLoading(false);
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => {
        setShowFailModel(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModel]);
  return (
    <>
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className="flex-1 mt-4 font-roboto w-full ">
        <div className=" flex items-center gap-8  ">
          <h2 className="text-lg text-text-dark-gray font-medium ">
            Heure D&apos;ouverture
          </h2>
          <div className="flex gap-8 w-1/2  ">
            <div className=" flex gap-2 items-center ">
              <label htmlFor="" className="text-text-light-gray font-medium">
                Ouverture
              </label>
              <div className="border border-pr rounded-md p-1 flex items-center gap-2 ">
                <input
                  type="text"
                  value={openTime.hours}
                  className=" outline-none w-6"
                  onChange={(e) => {
                    handleOpenTimeHoursChange(e);
                  }}
                  ref={openTimeHoursRef}
                />
                :
                <input
                  type="text"
                  value={openTime.minutes}
                  className="w-6 outline-none"
                  onChange={(e) => handleOpenTimeMinutesChange(e)}
                  ref={openTimeMinutesRef}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center w-16">
              <label htmlFor="" className="text-text-light-gray font-medium ">
                Fermeture:
              </label>
              <div className="border border-pr rounded-md p-1 flex items-center gap-2">
                <input
                  type="text"
                  value={closeTime.hours}
                  className=" w-6 outline-none"
                  onChange={(e) => handleCloseTimeHoursChange(e)}
                  ref={closeTimeHoursRef}
                />
                :
                <input
                  type="text"
                  value={closeTime.minutes}
                  className="w-6 outline-none"
                  onChange={(e) => handleCloseTimeMinutesChange(e)}
                  ref={closeTimeMinutesRef}
                />
              </div>
            </div>
          </div>
        </div>
        <div className=" flex items-center mt-6 gap-8">
          <h2 className="text-lg text-text-dark-gray font-medium ">Ouvert:</h2>

          <ToggleButton isToggled={openToggled} setIsToggled={setOpenToggled} />
        </div>
        <div className=" flex items-center mt-6 gap-8">
          <h2 className="text-lg text-text-dark-gray font-medium ">
            Livraison:
          </h2>

          <ToggleButton
            isToggled={deliveryToggled}
            setIsToggled={setDeliveryToggled}
          />
        </div>
        <div className=" flex items-center mt-6 gap-8">
          <h2 className="text-lg text-text-dark-gray font-medium ">
            Frais de livraison:
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="border-pr border-2 font-roboto text-base py-1 px-2 w-12 rounded-md"
              onChange={(e) => setDeliveryFee(e.target.value)}
              value={deliveryFee}
            />
            <span>$</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-pr py-2 px-8 font-semibold rounded-md"
          onClick={updateSettings}
        >
          Sauvegarder
        </button>
      </div>
    </>
  );
};

export default SettingsScreen;
