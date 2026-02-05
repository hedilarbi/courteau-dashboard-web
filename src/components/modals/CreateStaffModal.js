import { Roles } from "@/constants";
import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";
import Spinner from "../spinner/Spinner";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import Image from "next/image";
import DropDown from "../DropDown";
import { getRestaurants } from "@/services/RestaurantServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateStaffModal = ({ setShowCreateStaffModal, setStaffs }) => {
  const inputImageRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const roles = [
    { value: Roles.CASHIER, label: Roles.CASHIER },
    { value: Roles.MANAGER, label: Roles.MANAGER },
    { value: Roles.LIVREUR, label: Roles.LIVREUR },
  ];
  const fetchData = async () => {
    try {
      const response = await getRestaurants();
      if (response.status) {
        let list = [];
        response?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setRestaurants(list);
      }
    } catch (error) {}
    setIsLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleImageClick = () => {
    inputImageRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateStaffModal(false);
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

  const createStaff = async () => {
    if (name.length < 1) {
      setError("Nom de l'employee manquant");

      return;
    }
    if (!restaurant) {
      setError("Selectionner un restaurant");
      return;
    }
    if (!role) {
      setError("Selectionner un role");
      return;
    }
    if (username.length < 1) {
      setError("Nom d'utilisateur manquant");
      return;
    }
    if (password.length < 1) {
      setError("Mot de passe manquant");
      return;
    }
    setError(null);
    setAddingIsLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("role", role.value);
    formData.append("restaurant", restaurant.value);
    if (image) {
      formData.append("file", image);
    }
    try {
      const response = await fetch(`${API_URL}/staffs/create`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setStaffs((prev) => [data, ...prev]);
      setShowSuccessModel(true);
    } catch (err) {
      console.log(err);
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    } finally {
      setAddingIsLoading(false);
    }
  };
  return (
    <ModalWrapper zindex={10}>
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      {isLoading ? (
        <div className="w-full max-w-3xl bg-white p-6 h-[70vh] overflow-y-auto rounded-xl flex items-center justify-center shadow-lg">
          <Spinner />
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-white p-6 overflow-y-auto rounded-xl flex flex-col shadow-lg gap-4 max-h-[80vh]">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
                Ajouter un employé
              </h1>
              <p className="text-sm text-text-light-gray">
                Renseignez les informations et attribuez un restaurant.
              </p>
            </div>
            <button onClick={() => setShowCreateStaffModal(false)}>
              <MdOutlineClose size={28} />
            </button>
          </div>
          {error && (
            <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-1/3">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                ref={inputImageRef}
              />
              <div
                className="relative h-40 w-full rounded-md border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer bg-gray-50"
                onClick={handleImageClick}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-text-light-gray">
                    <MdAddAPhoto size={32} />
                    <span className="text-xs mt-2">Importer une image</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-light-gray">Nom</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-pr"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-light-gray">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-pr"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-light-gray">Mot de passe</label>
                <input
                  type="password"
                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-pr"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-light-gray">Restaurant</label>
                <DropDown
                  value={restaurant}
                  setter={setRestaurant}
                  list={restaurants}
                  placeholder={"Selectionner un restaurant"}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-text-light-gray">Rôle</label>
                <DropDown
                  value={role}
                  setter={setRole}
                  list={roles}
                  placeholder={"Selectionner un role"}
                />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-end">
            <button
              className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-8 text-white shadow-sm hover:brightness-95"
              onClick={createStaff}
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateStaffModal;
