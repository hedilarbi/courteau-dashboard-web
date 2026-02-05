import { dateToDDMMMYYYY } from "@/utils/dateFormatters";
import React from "react";

const UserGeneralInfo = ({ data }) => {
  return (
    <div className="bg-white shadow-default rounded-xl mt-4 font-roboto p-5 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-text-light-gray">
            Identité
          </div>
          <div className="space-y-2 text-sm text-text-dark-gray">
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">Nom & prénom</span>
              <span className="font-semibold">{data.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">E-mail</span>
              <span className="font-semibold truncate max-w-[200px] text-right">
                {data.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">Téléphone</span>
              <span className="font-semibold">{data.phone_number}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-text-light-gray">
            Statut
          </div>
          <div className="space-y-2 text-sm text-text-dark-gray">
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">Créé le</span>
              <span className="font-semibold">
                {dateToDDMMMYYYY(data.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">Points de fidélité</span>
              <span className="font-semibold">{data.fidelity_points}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-light-gray">Nombre de commandes</span>
              <span className="font-semibold">{data.orders.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGeneralInfo;
