"use client";
import CreatePromoCodeModal from "@/components/modals/CreatePromoCodeModal";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import { deletePromoCode, getPromoCodes } from "@/services/PromoCodesServices";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { HiMiniPencil } from "react-icons/hi2";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
const PromoCodes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoCode, setPromoCode] = useState(null);
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [toastData, setToastData] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate fetching data
      const response = await getPromoCodes();
      if (response.status) {
        // Handle successful data retrieval
        console.log(response.data);
        setPromoCodes(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch promo codes");
      }
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleShowDeleteWarning = (promoCode) => {
    setPromoCode(promoCode);
    setDeleteWarningModelState(true);
  };
  const handleDeletePromoCode = async () => {
    try {
      const response = await deletePromoCode(promoCode._id);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Code promotion supprimé avec succès",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message: "Erreur lors de la suppression du code promotion",
        });
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message: "Erreur lors de la suppression du code promotion",
      });
    } finally {
      setDeleteWarningModelState(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
    <div className="bg-[#f5f7fb] min-h-screen overflow-y-auto font-roboto">
      {deleteWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setDeleteWarningModelState}
          message={`Etes-vous sûr de vouloir supprimer ce code promotion ?`}
          action={handleDeletePromoCode}
        />
      )}
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {showCreateModal && (
        <CreatePromoCodeModal
          setShowCreateModal={setShowCreateModal}
          setRefresh={setRefresh}
        />
      )}
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Codes Promotions</h1>
              <p className="text-sm opacity-90 mt-1">
                Gérez vos codes, usages et valeurs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                  {promoCodes.length} code(s)
                </span>
              </div>
              <button
                className="bg-white text-[#111827] px-4 py-2 rounded-md shadow-sm font-semibold hover:brightness-95 transition"
                onClick={() => setShowCreateModal(true)}
              >
                Ajouter un code
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden">
          {promoCodes.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[1020px]">
                <div className="grid grid-cols-[1fr,1fr,0.8fr,0.8fr,0.8fr,1fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                  <span>Code</span>
                  <span>Type</span>
                  <span>Valeur</span>
                  <span>Utilisation</span>
                  <span>Usage / utilisateur</span>
                  <span>Date de fin</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="h-[calc(100vh-220px)] overflow-y-auto divide-y divide-gray-100">
                  {promoCodes.map((promoCode) => (
                    <div
                      key={promoCode._id}
                      className="grid grid-cols-[1fr,1fr,0.8fr,0.8fr,0.8fr,1fr,0.6fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-text-dark-gray truncate">
                        {promoCode.code}
                      </span>
                      <span className="text-text-dark-gray">
                        {promoCode.type === "percent"
                          ? "Pourcentage"
                          : promoCode.type === "amount"
                          ? "Montant"
                          : "Article gratuit"}
                      </span>
                      <span className="font-semibold text-pr">
                        {promoCode.type === "percent"
                          ? `${promoCode.percent}%`
                          : promoCode.type === "amount"
                          ? `${promoCode.amount}$`
                          : promoCode.freeItem.name}
                      </span>
                      <span className="text-text-dark-gray">
                        {promoCode.totalUsage} fois
                      </span>
                      <span className="text-text-dark-gray">
                        {promoCode.usagePerUser
                          ? promoCode.usagePerUser
                          : "Illimité"}
                      </span>
                      <span className="text-text-light-gray">
                        {dateToDDMMYYYYHHMM(promoCode.endDate)}
                      </span>

                      <div className="flex items-center justify-end">
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => handleShowDeleteWarning(promoCode)}
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
              Aucun code promotionnel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCodes;
