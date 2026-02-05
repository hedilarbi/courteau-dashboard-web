"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import DeleteWarningModal from "./modals/DeleteWarningModal";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import SpinnerModal from "./modals/SpinnerModal";
import { deleteStaffMember } from "@/services/staffServices";
import UpdateStaffModal from "./modals/UpdateStaffModal";
import CreateStaffModal from "./modals/CreateStaffModal";

const EmplyeesScreen = ({ data }) => {
  const [staffs, setStaffs] = useState(data);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showUpdateStaffModal, setShowUpdateStaffModal] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteStaff = async () => {
    setIsLoading(true);
    try {
      const response = await deleteStaffMember(selectedStaff);
      if (response.status) {
        setStaffs((prev) => prev.filter((item) => item._id !== selectedStaff));
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
          message={"Etes-vous sur de vouloir supprimer cet employe ?"}
          setShowDeleteWarningModal={setShowDeleteWarningModal}
          action={deleteStaff}
        />
      )}
      {showUpdateStaffModal && (
        <UpdateStaffModal
          setShowUpdateStaffModal={setShowUpdateStaffModal}
          staff={selectedStaff}
          setStaffs={setStaffs}
        />
      )}
      {showCreateStaffModal && (
        <CreateStaffModal
          setShowCreateStaffModal={setShowCreateStaffModal}
          setStaffs={setStaffs}
        />
      )}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {isLoading && <SpinnerModal />}
      <div className="mt-4 flex flex-col gap-4 w-full">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">Employés</h2>
              <p className="text-sm opacity-90">
                Recherchez, modifiez ou ajoutez un membre du staff.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                {staffs.length} employé(s)
              </span>
              <button
                className="flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
                onClick={() => setShowCreateStaffModal(true)}
              >
                <FaPlus />
                Ajouter
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-default rounded-xl border border-gray-100 overflow-hidden">
          {staffs.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[1.4fr,1fr,0.8fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                  <span>Nom</span>
                  <span>Rôle</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="h-[calc(100vh-220px)] overflow-y-auto divide-y divide-gray-100">
                  {staffs.map((staff) => (
                    <div
                      key={staff._id}
                      className="grid grid-cols-[1.4fr,1fr,0.8fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                    >
                      <p className="font-semibold text-text-dark-gray truncate">
                        {staff.name}
                      </p>
                      <p className="text-text-dark-gray capitalize">
                        {staff.role}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowUpdateStaffModal(true);
                          }}
                        >
                          <FaPen size={16} />
                        </button>
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => {
                            setSelectedStaff(staff._id);
                            setShowDeleteWarningModal(true);
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
              Aucun employé trouvé.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmplyeesScreen;
