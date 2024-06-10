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

const UpdateStaffModal = ({ setShowUpdateStaffModal, setStaffs, staff }) => {
  const inputImageRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurant, setRestaurant] = useState({
    value: staff.restaurant?._id,
    label: staff.restaurant?.name,
  });
  const [name, setName] = useState(staff.name);
  const [username, setUsername] = useState(staff.username);

  const [role, setRole] = useState({ value: staff.role, label: staff.role });
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
        setShowUpdateStaffModal(false);
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

  const updateStaff = async () => {
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

    setError(null);
    setAddingIsLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);

    formData.append("role", role.value);
    formData.append("restaurant", restaurant.value);
    if (image) {
      formData.append("file", image);
    }
    try {
      const response = await fetch(`${API_URL}/staffs/update/${staff._id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setStaffs((prev) =>
        prev.map((top) => (top._id === data._id ? data : top))
      );
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
        <div className="w-2/3 bg-white p-4 h-3/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="w-2/3 bg-white p-4  overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Modifier un employee
            </h1>
            <button onClick={() => setShowUpdateStaffModal(false)}>
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
          <div className="mt-4 flex-1 w-full ">
            <div className="flex  w-full  ">
              <div onClick={handleImageClick}>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  ref={inputImageRef}
                />
                {staff?.image ? (
                  <Image
                    src={imagePreview || staff?.image}
                    alt="preview"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="h-40 w-40 bg-gray-400 flex  items-center justify-center rounded-md">
                    <MdAddAPhoto size={44} />
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col gap-6 flex-1  w-full">
                <div className=" flex gap-2 items-center ">
                  <label
                    htmlFor="name"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md flex-1 py-1 px-2 "
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label
                    htmlFor="username"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Nom d&apos;utilisateur
                  </label>

                  <input
                    type="text"
                    className="border border-gray-300 rounded-md py-1 flex-1 px-2 "
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                  />
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-between items-center">
              <div className="flex w-2/5 items-center gap-4">
                <label
                  htmlFor="role"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Restaurant
                </label>
                <DropDown
                  value={restaurant}
                  setter={setRestaurant}
                  list={restaurants}
                  placeholder={"Selectionner un restaurant"}
                />
              </div>
              <div className="flex w-2/5 items-center gap-4">
                <label
                  htmlFor="role"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Role
                </label>
                <DropDown
                  value={role}
                  setter={setRole}
                  list={roles}
                  placeholder={"Selectionner un role"}
                />
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-end mt-8    "
            onClick={updateStaff}
          >
            <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
              Modifier
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default UpdateStaffModal;
