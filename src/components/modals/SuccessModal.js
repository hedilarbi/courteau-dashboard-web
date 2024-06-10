import React from "react";
import ModalWrapper from "./ModalWrapper";
import { SiTicktick } from "react-icons/si";
const SuccessModal = () => {
  return (
    <ModalWrapper zindex={30}>
      <div className="bg-pr z-50 p-8 rounded-md">
        <SiTicktick size={52} />
      </div>
    </ModalWrapper>
  );
};

export default SuccessModal;
