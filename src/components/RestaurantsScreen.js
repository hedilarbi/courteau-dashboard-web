"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import { deleteRewardService } from "@/services/RewardServices";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import CreateRewardModal from "./modals/CreateRewardModal";
import CreateRestaurantModal from "./modals/CreateRestaurantModal";
import { deleteRestaurantService } from "@/services/RestaurantServices";
const RestaurantsScreen = ({ data }) => {
  const [restaurants, setRestaurants] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showCreaterestaurantModal, setShowCreateRestaurantModal] =
    useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRestaurant = async () => {
    setIsLoading(true);
    try {
      const response = await deleteRestaurantService(selectedRestaurant);
      if (response.status) {
        setRestaurants((prev) =>
          prev.filter((item) => item._id !== selectedRestaurant)
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
      {isLoading && <SpinnerModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {showDeleteWarningModal && (
        <DeleteWarningModal
          message={"Etes-vous sur de vouloir supprimer cette recompense ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteRestaurant}
        />
      )}
      {showCreaterestaurantModal && (
        <CreateRestaurantModal
          setShowCreateRestaurantModal={setShowCreateRestaurantModal}
          setRestaurants={setRestaurants}
        />
      )}
      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold">Restaurants</p>
              <p className="text-sm opacity-90">
                Gérez vos établissements et coordonnées.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                {restaurants.length} restaurant(s)
              </span>
              <button
                className="flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                onClick={() => setShowCreateRestaurantModal(true)}
              >
                <FaPlus />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-default rounded-xl border border-gray-100 overflow-hidden">
          {restaurants.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[1.4fr,1fr,1.6fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                  <span>Nom</span>
                  <span>Téléphone</span>
                  <span>Adresse</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="h-[calc(100vh-220px)] overflow-y-auto divide-y divide-gray-100">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      className="grid grid-cols-[1.4fr,1fr,1.6fr,0.6fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                    >
                      <p className="text-text-dark-gray font-semibold truncate">
                        {restaurant.name}
                      </p>
                      <p className="text-text-dark-gray truncate">
                        {restaurant.phone_number}
                      </p>
                      <p className="text-text-light-gray truncate">
                        {restaurant.address}
                      </p>
                      <div className="flex items-center justify-end">
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setShowDeleteWarningModal(true);
                            setSelectedRestaurant(restaurant._id);
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-text-light-gray text-sm">
              Aucun restaurant trouvé.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RestaurantsScreen;
