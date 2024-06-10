import React from "react";
import ModalWrapper from "./ModalWrapper";
import Spinner from "../spinner/Spinner";

const SpinnerModal = () => {
  return (
    <ModalWrapper zindex={30}>
      <Spinner />
    </ModalWrapper>
  );
};

export default SpinnerModal;
