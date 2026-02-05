import React from "react";
import ModalWrapper from "./ModalWrapper";
import { RiErrorWarningFill } from "react-icons/ri";
const DeleteWarningModal = ({ message, setShowDeleteWarningModal, action }) => {
  const actionButtonText = message.includes(
    "Etes-vous sûr de vouloir activer cet utilisateur"
  )
    ? "Activer"
    : message.includes("Etes-vous sûr de vouloir desactiver cet utilisateur")
    ? "Desactiver"
    : message.includes("Etes-vous sûr de vouloir supprimer cet utilisateur")
    ? "Supprimer"
    : "Confirmer";
  return (
    <ModalWrapper zindex={10}>
      <div className="bg-white w-full max-w-lg rounded-lg flex flex-col items-center p-6 shadow-lg">
        <div className="bg-light-warning-red flex justify-center items-center text-warning-red rounded-full p-3 shadow-inner">
          <RiErrorWarningFill size={48} />
        </div>

        <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray mt-4">
          Attention !
        </h1>
        <p className="text-base font-roboto font-medium text-text-light-gray mt-3 text-center px-2">
          {message}
        </p>
        <div className="w-full flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button
            className="bg-gray-200 text-text-dark-gray rounded-md py-2.5 px-6 font-roboto font-semibold hover:bg-gray-300"
            onClick={() => setShowDeleteWarningModal(false)}
          >
            Annuler
          </button>
          <button
            className="text-white bg-warning-red rounded-md py-2.5 px-6 font-roboto font-semibold shadow-sm hover:brightness-95"
            onClick={action}
          >
            {actionButtonText}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DeleteWarningModal;
