import React from "react";

const OrderDetailsOffersList = ({ offers }) => {
  return (
    <div className="bg-white shadow-default rounded-md mt-4 font-roboto justify-between ">
      {offers.length > 0 ? (
        offers.map((offer, index) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? "bg-pr bg-opacity-70 flex items-center space-x-4 px-4 py-4"
                : "bg-white flex items-center space-x-4  px-4 py-4"
            }
          >
            <p className="w-1/3 font-semibold capitalize">
              {offer?.offer?.name}
            </p>

            <div className="flex-1">
              {offer.customizations.map((customization, index) => (
                <p key={index}>{customization?.name}</p>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 font-roboto font-semibold">
          Aucune offre
        </div>
      )}
    </div>
  );
};

export default OrderDetailsOffersList;
