import React from "react";
import ModalWrapper from "./ModalWrapper";

const FailModal = ({ error }) => {
  return (
    <ModalWrapper zindex={30}>
      <div className="bg-warning-red text-white z-50 py-6 px-10 font-roboto text-lg text-center rounded-md">
        {error}
      </div>
    </ModalWrapper>
  );
};

export default FailModal;
