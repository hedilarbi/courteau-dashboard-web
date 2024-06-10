import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Image from "next/image";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import Spinner from "../spinner/Spinner";
import { getItemsNames } from "@/services/MenuItemServices";
import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";
import AddItemModal from "./AddItemModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateOfferModal = ({ setShowCreateOfferModal, setOffers }) => {
  const inputImageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [expireDate, setExpireDate] = useState(new Date());
  const [items, setItems] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [itemsNames, setItemsNames] = useState([]);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getItemsNames();
      if (response?.status) {
        let list = [];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name, prices: item.prices });
        });
        setItemsNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsloading(false);
    }
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

  const deleteItem = (index) => {
    const newItems = items.filter((item, i) => i !== index);
    setItems(newItems);
  };

  const createItem = async () => {
    if (!image) {
      setError("Image de l'offre manquante");

      return;
    }
    if (!name) {
      setError("nom de l'offre manquante");

      return;
    }
    if (expireDate <= new Date()) {
      setError("Date invalide");

      return;
    }
    if (price <= 0) {
      setError("price de l'offre manquant");

      return;
    }
    if (items.length <= 0) {
      setError("L'offre doit contenir au moin un article");

      return;
    }
    setError(null);
    const formData = new FormData();

    formData.append("items", JSON.stringify(items));
    formData.append("customizations", JSON.stringify([]));
    formData.append("name", name);
    formData.append("price", price);
    formData.append("expireAt", expireDate.toLocaleDateString());
    formData.append("file", image);
    setAddingIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/offers/create`, {
        method: "POST",

        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setOffers((prev) => [data, ...prev]);
      setShowSuccessModel(true);
      setAddingIsLoading(false);
    } catch (err) {
      setError("Une erreur s'est produite");

      setAddingIsLoading(false);
    }
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateOfferModal(false);
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
      {showAddItemModal && (
        <AddItemModal
          setShowAddItemModal={setShowAddItemModal}
          setItems={setItems}
          itemsNames={itemsNames}
        />
      )}
      {showSuccessModel && <SuccessModal />}
      {showFailModel && <FailModal error={error} />}
      {addingIsLoading && <SpinnerModal />}

      {isLoading ? (
        <div className="w-2/3 bg-white p-4 h-4/5 overflow-y-auto rounded-md flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="w-2/3 bg-white p-4 h-4/5 overflow-y-auto rounded-md flex flex-col ">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
              Ajouter une offre
            </h1>
            <button onClick={() => setShowCreateOfferModal(false)}>
              <MdOutlineClose size={32} />
            </button>
          </div>
          <div className="h-6 text-center my-4">
            {error && (
              <p className="text-warning-red text-sm font-roboto font-semibold">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4   flex-1 ">
            <div className="flex w-4/5  ">
              <div onClick={handleImageClick}>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  ref={inputImageRef}
                />
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={200}
                    height={200}
                    className="w-40 h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-200 rounded-md flex justify-center items-center">
                    <MdAddAPhoto size={44} />
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col justify-between flex-1">
                <div className=" flex gap-2 items-center ">
                  <label
                    htmlFor="name"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="border border-gray-300 rounded-md w-full py-1 px-2 "
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 ">
                  <label
                    htmlFor="description"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    prix
                  </label>
                  <input
                    type="number"
                    id="name"
                    className="border border-gray-300 rounded-md w-full py-1 px-2 "
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label
                    htmlFor="categorie"
                    className="text-text-dark-gray font-roboto font-semibold"
                  >
                    date d&apos;expiration
                  </label>

                  <DatePicker
                    selected={expireDate}
                    onChange={(date) => setExpireDate(date)}
                    className="border-2 border-pr rounded-md w-full py-1 px-2  "
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-roboto font-semibold text-text-dark-gray">
                Articles
              </h2>
              <div className="flex gap-2 mt-4 flex-wrap">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-pr rounded-md py-1 px-2 flex items-center gap-2 font-roboto"
                  >
                    <p className="font-bold">
                      {item.item.label}
                      <span className="font-medium text-text-light-gray mx-2">
                        ({item.size})
                      </span>
                      x
                    </p>
                    <p> {item.quantity}</p>
                    <button
                      className="text-warning-red"
                      onClick={() => deleteItem(index)}
                    >
                      <MdOutlineClose size={24} />
                    </button>
                  </div>
                ))}
                <button
                  className="bg-pr rounded-md font-roboto py-1 px-10 font-semibold"
                  onClick={() => setShowAddItemModal(true)}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-end mt-8    "
            onClick={createItem}
          >
            <button className="bg-pr  rounded-md py-2 font-roboto font-semibold px-10">
              Ajouter
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateOfferModal;
