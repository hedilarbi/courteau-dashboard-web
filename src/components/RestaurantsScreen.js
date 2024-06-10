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
      <div className="mt-4 flex w-full ">
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold  py-2"
          onClick={() => setShowCreateRestaurantModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6 w-full">
        {data.length > 0 ? (
          <ul>
            {restaurants.map((restaurant, index) => (
              <li
                key={restaurant._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4 gap-12"
                    : "bg-white flex items-center justify-between px-5 py-4 gap-12"
                }
              >
                <p className="text-text-dark-gray font-roboto  font-semibold  ">
                  {restaurant.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal ">
                  {restaurant.phone_number}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal  flex-1">
                  {restaurant.address}
                </p>

                <button
                  className="text-warning-red"
                  onClick={() => {
                    setShowDeleteWarningModal(true);
                    setSelectedRestaurant(restaurant._id);
                  }}
                >
                  <FaTrash size={20} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucun restaurant trouvé
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default RestaurantsScreen;
