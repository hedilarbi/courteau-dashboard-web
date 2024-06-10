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
      <div className="mt-4 flex w-full justify-between">
        <SearchBar />
        <button
          className="flex bg-pr items-center w-1/5 justify-center gap-3 rounded-md font-roboto font-bold "
          onClick={() => setShowCreateStaffModal(true)}
        >
          <FaPlus />
          Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-white shadow-default mt-6">
        {data.length > 0 ? (
          <ul>
            {staffs.map((staff, index) => (
              <li
                key={staff._id}
                className={
                  index % 2 === 0
                    ? "bg-pr bg-opacity-70 flex items-center justify-between px-5 py-4 space-x-12"
                    : "bg-white flex items-center justify-between px-5 py-4 space-x-12"
                }
              >
                <p className="text-text-dark-gray font-roboto font-normal w-1/6">
                  {staff.name}
                </p>
                <p className="text-text-dark-gray font-roboto font-normal flex-1">
                  {staff.role}
                </p>

                <button
                  className="text-primary-blue"
                  onClick={() => {
                    setSelectedStaff(staff);
                    setShowUpdateStaffModal(true);
                  }}
                >
                  <FaPen size={20} color="" />
                </button>
                <button
                  className="text-warning-red"
                  onClick={() => {
                    setSelectedStaff(staff._id);
                    setShowDeleteWarningModal(true);
                  }}
                >
                  <FaTrash size={22} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-col flex justify-center items-center w-full h-full ">
            <h1 className="text-xl font-roboto font-semibold text-text-dark-gray ">
              Aucun employé trouvé
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default EmplyeesScreen;
