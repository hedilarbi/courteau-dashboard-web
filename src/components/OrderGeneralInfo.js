import React, { useEffect, useState } from "react";
import DropDown from "./DropDown";
import SuccessModal from "./modals/SuccessModal";
import FailModal from "./modals/FailModal";
import { updateStatusAndPrice } from "@/services/OrdersServices";

const OrderGeneralInfo = ({
  data,
  updateMode,
  statusOptions,
  setData,
  setUpdateMode,
}) => {
  const [newStatus, setNewStatus] = useState({
    label: data.status,
    value: data.status,
  });
  const [newPrice, setNewPrice] = useState(data.total_price.toFixed(2));
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const saveUpdates = async () => {
    const price = Number(newPrice);
    if (price <= 0 || isNaN(price)) {
      setError("Le prix doit etre superieur a 0");
      setShowFailModel(true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await updateStatusAndPrice(
        data._id,
        newStatus.value,
        price
      );
      setIsLoading(false);
      if (response.status) {
        setData({ ...data, status: newStatus.value, total_price: price });
        setShowSuccessModel(true);
      } else {
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setIsLoading(false);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setUpdateMode(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModel]);
  useEffect(() => {
    if (showFailModel) {
      const timer = setTimeout(() => {
        setShowFailModel(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showFailModel]);
  return (
    <>
      {isLoading && <SuccessModal />}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      <div className=" bg-white shadow-default rounded-md mt-4 font-roboto  p-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="flex space-x-2 items-center">
              <p className="font-semibold">Etat:</p>
              {updateMode ? (
                <DropDown
                  value={newStatus}
                  setter={setNewStatus}
                  list={statusOptions}
                />
              ) : (
                <p>{data.status}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Livreur:</p>
              <p>{data.delivery_by?.name || "Non assigne"}</p>
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Code:</p>
              <p>{data.code}</p>
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Type:</p>
              <p>{data.type}</p>
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Date:</p>
              <p>{data.createdAt.toString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex space-x-2 items-center">
              <p className="font-semibold">Totale:</p>
              {updateMode ? (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="ml-2 border-pr border rounded-md px-1 w-20"
                  />
                  <span>$</span>
                </div>
              ) : (
                <p>{data.total_price.toFixed(2)} $</p>
              )}
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Sous totale:</p>
              <p>{data.sub_totale}</p>
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Nombre d&apos;article:</p>
              <p>
                {data.orderItems.length +
                  data.offers.length +
                  data.rewards.length}
              </p>
            </div>
            <div className="flex space-x-2">
              <p className="font-semibold">Adresse:</p>
              <p>{data.address}</p>
            </div>
          </div>
        </div>
        {updateMode && (
          <div className="flex justify-end mt-4">
            <button
              className="bg-pr font-roboto font-semibold rounded-md py-2 px-6"
              onClick={saveUpdates}
            >
              Sauvegarder
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderGeneralInfo;
