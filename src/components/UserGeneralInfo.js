import { dateToDDMMMYYYY } from "@/utils/dateFormatters";
import React from "react";

const UserGeneralInfo = ({ data }) => {
  return (
    <div className="flex bg-white shadow-default rounded-md mt-4 font-roboto justify-between p-4">
      <div className="space-y-2">
        <div className="flex space-x-2">
          <p className="font-semibold">Nom & Prenom:</p>
          <p>{data.name}</p>
        </div>
        <div className="flex space-x-2">
          <p className="font-semibold">E-mail:</p>
          <p>{data.email}</p>
        </div>
        <div className="flex space-x-2">
          <p className="font-semibold">Telephone:</p>
          <p>{data.phone_number}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <p className="font-semibold">Cree le:</p>
          <p>{dateToDDMMMYYYY(data.createdAt)} </p>
        </div>
        <div className="flex space-x-2">
          <p className="font-semibold">Points de fidelite:</p>
          <p>{data.fidelity_points}</p>
        </div>
        <div className="flex space-x-2">
          <p className="font-semibold">Nombre de commande:</p>
          <p>{data.orders.length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserGeneralInfo;
