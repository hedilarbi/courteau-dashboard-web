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
import { HiMiniPencil } from "react-icons/hi2";

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
        <div className="mt-4 flex w-full flex-col gap-3">
          <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold">Personnalisations</p>
              <p className="text-sm opacity-90">
                Gérez vos options et catégories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                {toppings.length} personnalisation(s)
              </span>
              <button
                className="flex bg-pr items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                onClick={() => setShowCreateToppingModal(true)}
              >
                <FaPlus />
                Ajouter
              </button>
              <Link
                href="/personnalisations/categories"
                className="flex bg-black border border-white/25 items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-white hover:bg-white/15 transition"
              >
                Categories
              </Link>
              <Link
                href="/personnalisations/groupes-de-personnalisations"
                className="flex bg-black items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-white shadow-sm hover:brightness-95 transition"
              >
                Gérer les groupes
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex w-full justify-between">
          <SearchBar />
        </div>
      )}

      <div className="flex-1 mt-6 bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div
              className={
                role === "admin"
                  ? "grid grid-cols-[120px,1.4fr,0.8fr,1fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3"
                  : "grid grid-cols-[120px,1.4fr,0.8fr,1fr,0.8fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3"
              }
            >
              <span>Image</span>
              <span>Nom</span>
              <span>Prix</span>
              <span>Catégorie</span>
              {role !== "admin" && <span>Disponibilité</span>}
              <span className="text-right">Actions</span>
            </div>
            {toppings.length > 0 ? (
              <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                {toppings.map((topping) => (
                  <div
                    key={topping._id}
                    className={
                      role === "admin"
                        ? "grid grid-cols-[120px,1.4fr,0.8fr,1fr,0.6fr] items-center px-4 py-3 text-sm"
                        : "grid grid-cols-[120px,1.4fr,0.8fr,1fr,0.8fr,0.6fr] items-center px-4 py-3 text-sm"
                    }
                  >
                    <div className="h-16 w-20 relative overflow-hidden rounded-md">
                      <Image
                        src={
                          role === "admin"
                            ? topping.image
                            : topping.topping.image
                        }
                        alt="perso"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-semibold text-text-dark-gray truncate">
                      {role === "admin" ? topping.name : topping.topping.name}
                    </p>
                    <p className="font-semibold text-pr">
                      {role === "admin"
                        ? topping.price.toFixed(2)
                        : topping.topping.price.toFixed(2)}{" "}
                      $
                    </p>
                    <p className="text-text-light-gray">
                      {role === "admin"
                        ? topping.category.name
                        : topping.topping.category.name}
                    </p>
                    {role !== "admin" && (
                      <div className="flex items-center">
                        <ToggleButton
                          isToggled={topping.availability}
                          setIsToggled={() => updateAvailability(topping._id)}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-3">
                      {role === "admin" && (
                        <>
                          <button
                            className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                            onClick={() => {
                              setSelectedTopping(topping);
                              setShowUpdateToppingModal(true);
                            }}
                          >
                            <HiMiniPencil size={18} />
                          </button>
                          <button
                            className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                            onClick={() => {
                              setSelectedTopping(topping._id);
                              setShowDeleteWarningModal(true);
                            }}
                          >
                            <FaTrash size={16} />
                          </button>
                        </>
                      )}
                      {role !== "admin" && (
                        <span className="text-xs text-text-light-gray">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-text-light-gray text-sm">
                Aucune personnalisation disponible.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ToppingsScreen;
