"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import Link from "next/link";
import CreateToppingModel from "./modals/CreateToppingModel";
import { deleteToppingService } from "@/services/ToppingsServices";
import UpdateToppingModal from "./modals/UpdateToppingModal";
import ToggleButton from "./toggleButton/ToggleButton";
import { updateRestaurantToppingAvailability } from "@/services/RestaurantServices";

const ToppingsScreen = ({ data, role, restaurant, setRefresh }) => {
  const [toppings, setToppings] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedTopping, setSelectedTopping] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateToppingModal, setShowCreateToppingModal] = useState(false);
  const [showUpdateToppingModal, setShowUpdateToppingModal] = useState(false);

  const deleteTopping = async () => {
    setIsLoading(true);
    try {
      const response = await deleteToppingService(selectedTopping);
      if (response.status) {
        setShowSuccessModel(true);
        setRefresh((prev) => prev + 1);
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
      const response = await updateRestaurantToppingAvailability(
        restaurant,
        id
      );
      if (response.status) {
        setToppings((prev) =>
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
      console.log(error);
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
          message={
            "Etes-vous sur de vouloir supprimer cette personnalisation ?"
          }
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteTopping}
        />
      )}
      {showUpdateToppingModal && (
        <UpdateToppingModal
          setShowUpdateToppingModal={setShowUpdateToppingModal}
          topping={selectedTopping}
          setToppings={setToppings}
          setRefresh={setRefresh}
        />
      )}
      {showCreateToppingModal && (
        <CreateToppingModel
          setShowCreateToppingModal={setShowCreateToppingModal}
          setToppings={setToppings}
        />
      )}
      {role === "admin" ? (
        <div className="mt-4 flex w-full justify-between">
          <button
            className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold py-3 "
            onClick={() => setShowCreateToppingModal(true)}
          >
            <FaPlus />
            Ajouter
          </button>
          <Link
            href="/personnalisations/categories"
            className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold py-3"
          >
            Categories
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex w-full justify-between">
          <SearchBar />
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6 ">
        {data.length > 0 ? (
          <ul>
            {toppings.map((topping, index) => (
              <li
                key={topping._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-50 flex items-center justify-between px-5 py-4"
                    : "bg-white flex items-center justify-between px-5 py-4"
                }
              >
                <Image
                  src={role === "admin" ? topping.image : topping.topping.image}
                  width={100}
                  height={100}
                  alt="perso"
                />
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {role === "admin" ? topping.name : topping.topping.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/6 ">
                  {role === "admin"
                    ? topping.price.toFixed(2)
                    : topping.topping.price.toFixed(2)}{" "}
                  $
                </p>
                <p className="text-text-dark-gray font-roboto font-normal w-1/5 ">
                  {role === "admin"
                    ? topping.category.name
                    : topping.topping.category.name}
                </p>
                {role !== "admin" && (
                  <ToggleButton
                    isToggled={topping.availability}
                    setIsToggled={() => updateAvailability(topping._id)}
                  />
                )}
                {role === "admin" && (
                  <button
                    className="text-primary-blue"
                    onClick={() => {
                      setSelectedTopping(topping);
                      setShowUpdateToppingModal(true);
                    }}
                  >
                    <FaPen size={24} color="" />
                  </button>
                )}
                {role === "admin" && (
                  <button
                    className="text-warning-red"
                    onClick={() => {
                      setSelectedTopping(topping._id);
                      setShowDeleteWarningModal(true);
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
              Aucune Personnalisations
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default ToppingsScreen;
