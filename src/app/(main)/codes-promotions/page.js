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
    <div className="bg-[#f5f5f5] h-screen overflow-y-auto ">
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
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
            Codes Promotions
          </h1>
          <button
            className="bg-[#F7A600] px-6 py-3 rounded text-black font-roboto font-semibold"
            onClick={() => setShowCreateModal(true)}
          >
            Ajouter un code
          </button>
        </div>
        <div className="flex-1">
          {promoCodes.length > 0 ? (
            <div className="w-full mt-4 border border-black overflow-y-auto h-[calc(100vh-250px)] ">
              <div className="flex flex-row gap-12 items-center justify-between py-3 px-2.5 bg-[#F7A600]">
                <span className="font-lato-bold text-base w-[15%]">Code</span>
                <span className="font-lato-bold text-base w-[10%] ">Type</span>
                <span className="font-lato-bold text-base w-[10%] ">
                  Valeur
                </span>
                <span className="font-lato-bold text-base w-[10%]">
                  Utilisation
                </span>
                <span className="font-lato-bold text-base w-[15%] ">
                  Usage par utilisateur
                </span>
                <span className="font-lato-bold text-base flex-1">
                  Date de fin
                </span>
                <span className="font-lato-bold text-base">Actions</span>
              </div>

              {promoCodes.map((promoCode, index) => (
                <div
                  key={promoCode._id}
                  className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                    index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                  }`}
                >
                  <span className={`font-lato-regular text-base w-[15%] `}>
                    {promoCode.code}
                  </span>
                  <span className={`font-lato-regular text-base w-[10%] `}>
                    {promoCode.type === "percent"
                      ? "Pourcentage"
                      : promoCode.type === "amount"
                      ? "Montant"
                      : "Article gratuit"}
                  </span>
                  <span className="font-lato-regular text-base w-[10%] ">
                    {promoCode.type === "percent"
                      ? promoCode.percent + "%"
                      : promoCode.type === "amount"
                      ? promoCode.amount + "$"
                      : promoCode.freeItem.name}
                  </span>
                  <span className="font-lato-regular text-base w-[10%] ">
                    {promoCode.totalUsage} fois
                  </span>
                  <span className="font-lato-regular text-base w-[15%] ">
                    {promoCode.usagePerUser
                      ? ` ${promoCode.usagePerUser}`
                      : "Illimité"}
                  </span>

                  <span className="font-lato-regular text-base flex-1">
                    {dateToDDMMYYYYHHMM(promoCode.endDate)}
                  </span>

                  <button
                    className="flex justify-center items-center"
                    onClick={() => handleShowDeleteWarning(promoCode)}
                  >
                    <FaTrash color="#F31A1A" size={24} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white flex-1 mt-5 rounded-xl flex justify-center items-center h-[calc(100vh-250px)]">
              <h2 className="font-lato-bold text-2xl">
                Aucun code promotionnel
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCodes;
