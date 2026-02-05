import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { setKey, fromAddress } from "react-geocode";
import { createRestaurantService } from "@/services/RestaurantServices";

setKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
const CreateRestaurantModal = ({
  setShowCreateRestaurantModal,
  setRestaurants,
}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({});

  const [error, setError] = useState(null);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);

  const createRestaurant = async () => {
    try {
      setAddingIsLoading(true);

      const coordsResponse = await fromAddress(address.label);

      const { lat, lng } = coordsResponse.results[0].geometry.location;

      const response = await createRestaurantService(
        name,
        address.label,
        {
          latitude: lat,
          longitude: lng,
        },
        phoneNumber
      );
      if (response.status) {
        setRestaurants((prev) => [...prev, response.data]);
        setAddingIsLoading(false);
        setShowSuccessModel(true);
      } else {
        setAddingIsLoading(false);
        setError(response.message);
        setShowFailModel(true);
      }
    } catch (error) {
      setAddingIsLoading(false);
      setError("Une erreur s'est produite");
      console.log(error);
      setShowFailModel(true);
    }
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateRestaurantModal(false);
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
    <ModalWrapper zindex={10}>
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      <div className="bg-white p-6 w-full max-w-3xl overflow-y-auto rounded-xl flex flex-col gap-4 max-h-[80vh] shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter un restaurant
            </h1>
            <p className="text-sm text-text-light-gray">
              Renseignez l’adresse, le nom et le téléphone.
            </p>
          </div>
          <button onClick={() => setShowCreateRestaurantModal(false)}>
            <MdOutlineClose size={28} />
          </button>
        </div>
        {error && (
          <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="space-y-4 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-light-gray">Adresse</label>
            <div className="flex-1 border border-gray-300 rounded-md px-1 py-1">
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                apiOptions={{ language: "fr" }}
                selectProps={{
                  value: address,
                  onChange: setAddress,
                  placeholder: "Rechercher une adresse",
                  styles: {
                    control: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                    }),
                  },
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-light-gray">Nom</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md flex-1 py-2 px-3 focus:outline-none focus:border-pr"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Nom du restaurant"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text-light-gray">
                Numéro de téléphone
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-md flex-1 py-2 px-3 focus:outline-none focus:border-pr"
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}
                placeholder="Ex: 06..."
              />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-8 text-white shadow-sm hover:brightness-95"
            onClick={createRestaurant}
          >
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateRestaurantModal;
