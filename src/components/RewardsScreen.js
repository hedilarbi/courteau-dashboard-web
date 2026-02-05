"use client";
import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import { deleteRewardService } from "@/services/RewardServices";
import SpinnerModal from "./modals/SpinnerModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import CreateRewardModal from "./modals/CreateRewardModal";
const RewardsScreen = ({ data }) => {
  const [rewards, setRewards] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteReward = async () => {
    setIsLoading(true);
    try {
      const response = await deleteRewardService(selectedReward);
      if (response.status) {
        setRewards((prev) =>
          prev.filter((item) => item._id !== selectedReward)
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
          action={deleteReward}
        />
      )}
      {showCreateRewardModal && (
        <CreateRewardModal
          setShowCreateRewardModal={setShowCreateRewardModal}
          setRewards={setRewards}
        />
      )}
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">Récompenses</h2>
              <p className="text-sm opacity-90">
                Associez des articles aux points fidélité.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                {rewards.length} récompense(s)
              </span>
              <button
                className="inline-flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                onClick={() => setShowCreateRewardModal(true)}
              >
                <FaPlus />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-default rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.6fr,0.8fr,0.6fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Article</span>
                <span>Points</span>
                <span className="text-right">Actions</span>
              </div>
              {rewards.length > 0 ? (
                <div className="max-h-[55vh] overflow-y-auto divide-y divide-gray-100">
                  {rewards.map((reward) => (
                    <div
                      key={reward._id}
                      className="grid grid-cols-[1.6fr,0.8fr,0.6fr] items-center px-4 py-3 text-sm"
                    >
                      <p className="text-text-dark-gray font-semibold truncate">
                        {reward.item?.name}
                      </p>
                      <p className="font-semibold text-pr">{reward.points}</p>
                      <div className="flex items-center justify-end">
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setShowDeleteWarningModal(true);
                            setSelectedReward(reward._id);
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucune récompense configurée.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RewardsScreen;
