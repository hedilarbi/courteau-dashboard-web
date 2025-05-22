import React from "react";

const ModalWrapper = ({ children, zindex }) => {
  return (
    <div
      className={`fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-${zindex}`}
    >
      {children}
    </div>
  );
};

export default ModalWrapper;
