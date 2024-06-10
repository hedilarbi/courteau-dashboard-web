import React from "react";

const ErrorMessageModal = ({ error }) => {
  return (
    <div className="absolute top-14 left-0 w-full flex justify-center z-10">
      <div className="bg-warning-red text-white  py-3 rounded-md w-1/4 text-center font-roboto text-lg">
        {error}
      </div>
    </div>
  );
};

export default ErrorMessageModal;
