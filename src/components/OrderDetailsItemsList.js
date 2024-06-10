import React from "react";

const OrderDetailsItemsList = ({ items }) => {
  return (
    <div className="bg-white shadow-default rounded-md mt-4 font-roboto justify-between ">
      {items.length > 0 ? (
        items.map((item, index) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? "bg-pr bg-opacity-70 flex items-center space-x-4 px-4 py-4"
                : "bg-white flex items-center space-x-4  px-4 py-4"
            }
          >
            <p className="w-1/3 font-semibold">{item.item.name}</p>
            <p className="w-1/5">{item.size}</p>
            <div className="flex-1">
              {item.customizations.map((customization, index) => (
                <p key={index}>{customization?.name}</p>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div> No items found</div>
      )}
    </div>
  );
};

export default OrderDetailsItemsList;
