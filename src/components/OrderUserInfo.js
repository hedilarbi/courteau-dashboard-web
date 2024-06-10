import React from "react";

const OrderUserInfo = ({ user }) => {
  return (
    <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto justify-between p-4">
      <div className="space-y-2">
        <div className="flex space-x-2">
          <p className="font-semibold">Nom & prenom:</p>
          <p>{user.name}</p>
        </div>
        <div className="flex space-x-2">
          <p className="font-semibold">Numero de telephone:</p>
          <p>{user.phone_number}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <p className="font-semibold">Email:</p>
          <p>{user.email} </p>
        </div>
      </div>
    </div>
  );
};

export default OrderUserInfo;
