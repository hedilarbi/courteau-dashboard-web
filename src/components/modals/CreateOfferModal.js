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
    formData.append("expireAt", expireDate.toISOString());
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
      console.log(data);
      setOffers((prev) => [data.data, ...prev]);
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
        <div className="w-[90vw] max-w-3xl bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl flex items-center justify-center shadow-lg">
          <Spinner />
        </div>
      ) : (
        <div className="w-[90vw] max-w-3xl bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col gap-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-light-gray">
                Offres
              </p>
              <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
                Ajouter une offre
              </h1>
              <p className="text-sm text-text-light-gray">
                Téléchargez une image, renseignez les infos et sélectionnez les
                articles inclus.
              </p>
            </div>
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              onClick={() => setShowCreateOfferModal(false)}
            >
              <MdOutlineClose size={20} />
            </button>
          </div>

          {error && (
            <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-4">
            <div
              onClick={handleImageClick}
              className="relative group cursor-pointer"
            >
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                ref={inputImageRef}
              />
              <div className="h-40 w-full md:w-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-text-light-gray gap-2">
                    <MdAddAPhoto size={28} />
                    <p className="text-xs text-center px-2">
                      Cliquez pour ajouter une image
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-text-dark-gray"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  className="border border-gray-300 rounded-md w-full py-2 px-3 text-sm focus:outline-none focus:border-pr"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Menu Duo"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="price"
                  className="text-sm font-semibold text-text-dark-gray"
                >
                  Prix
                </label>
                <input
                  type="number"
                  id="price"
                  className="border border-gray-300 rounded-md w-full py-2 px-3 text-sm focus:outline-none focus:border-pr"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  min={0}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-text-dark-gray">
                  Date d&apos;expiration
                </label>
                <DatePicker
                  selected={expireDate}
                  onChange={(date) => setExpireDate(date)}
                  className="border border-gray-300 rounded-md w-full py-2 px-3 text-sm focus:outline-none focus:border-pr"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                Articles
              </h2>
              <button
                className="inline-flex items-center justify-center bg-pr text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-95 transition"
                onClick={() => setShowAddItemModal(true)}
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.length ? (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 flex items-center gap-2 text-sm"
                  >
                    <span className="font-semibold text-text-dark-gray">
                      {item.item.label}
                    </span>
                    <span className="text-text-light-gray">({item.size})</span>
                    <span className="font-semibold text-text-dark-gray">
                      x{item.quantity}
                    </span>
                    <button
                      className="text-warning-red hover:text-red-700"
                      onClick={() => deleteItem(index)}
                    >
                      <MdOutlineClose size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-light-gray">
                  Ajoutez un ou plusieurs articles à l&apos;offre.
                </p>
              )}
            </div>
          </div>

          <div className="w-full flex justify-end pt-2">
            <button
              className="bg-pr text-white rounded-md py-2.5 px-8 font-roboto font-semibold shadow-sm hover:brightness-95 transition"
              onClick={createItem}
            >
              Créer l&apos;offre
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateOfferModal;
