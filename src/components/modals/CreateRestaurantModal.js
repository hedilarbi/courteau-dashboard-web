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

      <div className=" bg-white p-4 w-4/5  overflow-y-auto rounded-md flex flex-col h-2/3 ">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
            Ajouter un restaurant
          </h1>
          <button onClick={() => setShowCreateRestaurantModal(false)}>
            <MdOutlineClose size={32} />
          </button>
        </div>
        <div className="h-6 text-center my-2">
          {error && (
            <p className="text-warning-red text-sm font-roboto font-semibold">
              {error}
            </p>
          )}
        </div>
        <div className="mt-4   flex-1 ">
          <div className="flex w-4/5  ">
            <div className="ml-4 flex flex-col justify-between flex-1 w-full">
              <div className="flex gap-2 items-center ">
                <label
                  htmlFor="description"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Adresse
                </label>
                <div className="flex-1">
                  <GooglePlacesAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    className="border border-gray-300 rounded-md  w-full py-1 px-2 "
                    apiOptions={{ language: "fr" }}
                    selectProps={{
                      address,
                      onChange: setAddress,
                    }}
                  />
                </div>
              </div>
              <div className=" flex gap-2 items-center w-full mt-4">
                <label
                  htmlFor="name"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  className="border border-gray-300 rounded-md flex-1 py-1 px-2 "
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>
              <div className="flex gap-2 items-center mt-4">
                <label
                  htmlFor="description"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Numero de telephone
                </label>
                <input
                  type="text"
                  id="name"
                  className="border border-gray-300 rounded-md flex-1 py-1 px-2 "
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="w-full flex justify-end mt-8    "
          onClick={createRestaurant}
        >
          <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
            Ajouter
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateRestaurantModal;
