"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import Image from "next/image";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import CreateOfferModal from "./modals/CreateOfferModal";
import UpdateOfferModal from "./modals/UpdateOfferModal";
import { deleteOfferService } from "@/services/OffersServices";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import SpinnerModal from "./modals/SpinnerModal";
import ToggleButton from "./toggleButton/ToggleButton";
import { updateRestaurantOfferAvailability } from "@/services/RestaurantServices";
import { dateToDDMMMYYYY } from "@/utils/dateFormatters";

const OffersScreen = ({ data, role, restaurant }) => {
  const [offers, setOffers] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showUpdateOfferModal, setShowUpdateOfferModal] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteOffer = async () => {
    setIsLoading(true);
    try {
      const response = await deleteOfferService(selectedOffer);
      if (response.status) {
        setOffers((prev) => prev.filter((item) => item._id !== selectedOffer));
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

  const updateAvailability = async (id) => {
    setIsLoading(true);
    try {
      const response = await updateRestaurantOfferAvailability(restaurant, id);
      if (response.status) {
        setOffers((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, availability: !item.availability }
              : item
          )
        );
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
        setShowDeleteWarningModal(false);
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
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={"Etes-vous sur de vouloir supprimer cette offre ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteOffer}
        />
      )}
      {showUpdateOfferModal && (
        <UpdateOfferModal
          setShowUpdateOfferModal={setShowUpdateOfferModal}
          offer={selectedOffer}
          setOffers={setOffers}
        />
      )}
      {showCreateOfferModal && (
        <CreateOfferModal
          setShowCreateOfferModal={setShowCreateOfferModal}
          setOffers={setOffers}
        />
      )}
      {showSuccessModel && <SuccessModal />}

      {showFailModel && <FailModal error={error} />}
      {isLoading && <SpinnerModal />}

      <div className="mt-4 flex w-full justify-between">
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold py-3"
          onClick={() => setShowCreateOfferModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {offers.length > 0 ? (
          <ul>
            {offers.map((offer, index) => (
              <li
                key={offer._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <Image
                  src={role === "admin" ? offer.image : offer.offer.image}
                  alt="offer"
                  width={144}
                  height={144}
                  className="w-36 h-36 object-cover "
                />
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {role === "admin" ? offer.name : offer.offer.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/4">
                  {role === "admin"
                    ? dateToDDMMMYYYY(offer.expireAt)
                    : dateToDDMMMYYYY(offer.offer.expireAt)}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6 ">
                  {role === "admin"
                    ? offer.price.toFixed(2)
                    : offer.offer.price.toFixed(2)}
                  $
                </p>
                {role !== "admin" && (
                  <ToggleButton
                    isToggled={offer.availability}
                    setIsToggled={() => updateAvailability(offer._id)}
                  />
                )}
                {role === "admin" && (
                  <button
                    className="text-primary-blue"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setShowUpdateOfferModal(true);
                    }}
                  >
                    <FaPen size={24} color="" />
                  </button>
                )}
                {role === "admin" && (
                  <button
                    className="text-warning-red"
                    onClick={() => {
                      setShowDeleteWarningModal(true);
                      setSelectedOffer(offer._id);
                    }}
                  >
                    <FaTrash size={26} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucune Offres
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default OffersScreen;
