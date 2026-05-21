import React from "react";

const ModalWrapper = ({ children, zindex }) => {
  const base = 1000;
  const z = base + (zindex ?? 10);
  return (
    <div
      className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-start md:items-center overflow-y-auto p-4 md:p-6"
      style={{ zIndex: z }}
    >
      {children}
    </div>
  );
};

export default ModalWrapper;
