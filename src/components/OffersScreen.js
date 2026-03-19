"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { FaCircleChevronDown, FaCircleChevronUp } from "react-icons/fa6";
import Image from "next/image";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import CreateOfferModal from "./modals/CreateOfferModal";
import UpdateOfferModal from "./modals/UpdateOfferModal";
import { deleteOfferService, offersTri } from "@/services/OffersServices";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import SpinnerModal from "./modals/SpinnerModal";
import ToggleButton from "./toggleButton/ToggleButton";
import { updateRestaurantOfferAvailability } from "@/services/RestaurantServices";
import { dateToDDMMMYYYY } from "@/utils/dateFormatters";
import { HiMiniPencil } from "react-icons/hi2";

const sortOffersByOrder = (list = []) =>
  [...list].sort((a, b) => {
    const orderA = Number(a?.order);
    const orderB = Number(b?.order);
    const hasOrderA = Number.isFinite(orderA);
    const hasOrderB = Number.isFinite(orderB);

    if (hasOrderA && hasOrderB && orderA !== orderB) return orderA - orderB;
    if (hasOrderA && !hasOrderB) return -1;
    if (!hasOrderA && hasOrderB) return 1;

    return String(a?._id || "").localeCompare(String(b?._id || ""));
  });

const OffersScreen = ({ data, role, restaurant }) => {
  const initialOffers = role === "admin" ? sortOffersByOrder(data || []) : data || [];
  const [offers, setOffers] = useState(initialOffers);
  const [offersList, setOffersList] = useState(initialOffers);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [showUpdateOfferModal, setShowUpdateOfferModal] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const nextOffers =
      role === "admin" ? sortOffersByOrder(data || []) : data || [];
    setOffers(nextOffers);
    setOffersList(nextOffers);
    setTriMode(false);
  }, [data, role]);

  const deleteOffer = async () => {
    setIsLoading(true);
    try {
      const response = await deleteOfferService(selectedOffer);
      if (response.status) {
        setOffers((prev) => prev.filter((item) => item._id !== selectedOffer));
        setOffersList((prev) =>
          prev.filter((item) => item._id !== selectedOffer),
        );
        setShowSuccessModel(true);
      } else {
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    } finally {
      setIsLoading(false);
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
              : item,
          ),
        );
        setOffersList((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, availability: !item.availability }
              : item,
          ),
        );
        setShowSuccessModel(true);
      } else {
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTri = (from, to) => {
    if (from < 0 || to < 0 || from >= offers.length || to >= offers.length) {
      return;
    }

    const offersCopy = [...offers];
    const fromItem = offersCopy[from];
    offersCopy[from] = offersCopy[to];
    offersCopy[to] = fromItem;

    const withOrders = offersCopy.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setOffers(withOrders);
  };

  const openTriMode = () => {
    const sorted = sortOffersByOrder(offers);
    setOffers(sorted);
    setOffersList(sorted);
    setTriMode(true);
  };

  const discardTri = () => {
    setOffers(offersList);
    setTriMode(false);
  };

  const saveTri = async () => {
    if (role !== "admin") return;

    setIsTriLoading(true);
    try {
      const list = offers.map((item, index) => ({
        id: item._id,
        order: index + 1,
      }));

      const response = await offersTri(list);
      if (response.status) {
        const normalized = offers.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
        setOffers(normalized);
        setOffersList(normalized);
        setTriMode(false);
        setShowSuccessModel(true);
      } else {
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la sauvegarde de l'ordre");
      setShowFailModel(true);
    } finally {
      setIsTriLoading(false);
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

  const adminHeaderGrid = triMode
    ? "grid-cols-[120px,1.4fr,1fr,0.8fr,0.8fr,0.8fr]"
    : "grid-cols-[120px,1.4fr,1fr,0.8fr,0.8fr]";

  const nonAdminHeaderGrid =
    "grid-cols-[120px,1.4fr,1fr,0.8fr,0.8fr,0.8fr]";

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
      {(isLoading || isTriLoading) && <SpinnerModal />}

      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-semibold">Vos offres</h2>
              <p className="text-sm opacity-90">
                Gérez les promotions et disponibilités.
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                {offers.length} offre(s)
              </span>
              {role === "admin" &&
                (triMode ? (
                  <>
                    <button
                      className="inline-flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                      onClick={saveTri}
                    >
                      Sauvegarder l&apos;ordre
                    </button>
                    <button
                      className="inline-flex bg-white/10 border border-white/30 items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-white hover:bg-white/15 transition"
                      onClick={discardTri}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    className="inline-flex bg-white/10 border border-white/30 items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-white hover:bg-white/15 transition"
                    onClick={openTriMode}
                  >
                    Modifier l&apos;ordre
                  </button>
                ))}
              <button
                className="inline-flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                onClick={() => setShowCreateOfferModal(true)}
              >
                <FaPlus />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div
                className={`grid ${
                  role === "admin" ? adminHeaderGrid : nonAdminHeaderGrid
                } bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3`}
              >
                <span>Image</span>
                <span>Nom</span>
                <span>Expiration</span>
                <span>Prix</span>
                {role !== "admin" && <span>Disponibilité</span>}
                <span className="text-right">Actions</span>
                {role === "admin" && triMode && (
                  <span className="text-right">Ordre</span>
                )}
              </div>
              {offers.length > 0 ? (
                <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
                  {offers.map((offer, index) => (
                    <div
                      key={offer._id}
                      className={`grid ${
                        role === "admin" ? adminHeaderGrid : nonAdminHeaderGrid
                      } items-center px-4 py-3 text-sm`}
                    >
                      <div className="h-16 w-20 relative overflow-hidden rounded-md">
                        <Image
                          src={
                            role === "admin" ? offer.image : offer.offer.image
                          }
                          alt="offer"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="font-semibold text-text-dark-gray truncate">
                        {role === "admin" ? offer.name : offer.offer.name}
                      </p>
                      <p className="text-text-dark-gray">
                        {role === "admin"
                          ? dateToDDMMMYYYY(offer.expireAt)
                          : dateToDDMMMYYYY(offer.offer.expireAt)}
                      </p>
                      <p className="font-semibold text-pr">
                        {role === "admin"
                          ? offer.price.toFixed(2)
                          : offer.offer.price.toFixed(2)}{" "}
                        $
                      </p>
                      {role !== "admin" && (
                        <div className="flex items-center">
                          <ToggleButton
                            isToggled={offer.availability}
                            setIsToggled={() => updateAvailability(offer._id)}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-3">
                        {role === "admin" ? (
                          <>
                            <button
                              className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                              onClick={() => {
                                setSelectedOffer(offer);
                                setShowUpdateOfferModal(true);
                              }}
                            >
                              <HiMiniPencil size={18} />
                            </button>
                            <button
                              className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                              onClick={() => {
                                setShowDeleteWarningModal(true);
                                setSelectedOffer(offer._id);
                              }}
                            >
                              <FaTrash size={20} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-text-light-gray">-</span>
                        )}
                      </div>
                      {role === "admin" && triMode && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => handleTri(index, index - 1)}
                            disabled={index === 0}
                            aria-label="Monter"
                          >
                            <FaCircleChevronUp />
                          </button>
                          <button
                            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => handleTri(index, index + 1)}
                            disabled={index === offers.length - 1}
                            aria-label="Descendre"
                          >
                            <FaCircleChevronDown />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucune offre disponible pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OffersScreen;
