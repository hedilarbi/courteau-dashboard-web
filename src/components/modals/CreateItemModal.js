import React, { useEffect, useRef, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Image from "next/image";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import DropDown from "../DropDown";
import Spinner from "../spinner/Spinner";
import { getCategories } from "@/services/MenuItemServices";
import { getSizesGroups } from "@/services/sizesGroupeServices";
import { getToppingGroups } from "@/services/ToppingGroupsServices";

import SuccessModal from "./SuccessModal";
import FailModal from "./FailModal";
import SpinnerModal from "./SpinnerModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateItemModal = ({ setShowCreateItemModal, setMenuItems }) => {
  const inputImageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [toppingGroups, setToppingGroups] = useState([]);
  const [selectedToppingGroup, setSelectedToppingGroup] = useState(null);
  const [sizeGroups, setSizeGroups] = useState([]);
  const [selectedSizeGroup, setSelectedSizeGroup] = useState(null);
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsloading] = useState(true);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [error, setError] = useState(null);
  const [addingIsLoading, setAddingIsLoading] = useState(false);
  const [showSuccessModel, setShowSuccessModel] = useState(false);
  const [showFailModel, setShowFailModel] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = async () => {
    try {
      const [categoriesResponse, toppingGroupsResponse, sizeGroupsResponse] =
        await Promise.all([
          getCategories(),
          getToppingGroups(),
          getSizesGroups(),
        ]);

      if (categoriesResponse?.status) {
        const list = [];
        categoriesResponse?.data.map((item) =>
          list.push({ value: item._id, label: item.name })
        );
        setCategoriesNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }

      if (toppingGroupsResponse?.status) {
        const list =
          toppingGroupsResponse?.data?.map((group) => ({
            value: group._id,
            label: group.name,
          })) || [];
        setToppingGroups(list);
      } else {
        console.error(
          "Topping groups data not found:",
          toppingGroupsResponse?.message
        );
      }
      if (sizeGroupsResponse?.status) {
        const options =
          sizeGroupsResponse.data?.map((group) => ({
            value: group._id,
            label: group.name,
            sizes: group.sizes || [],
          })) || [];
        setSizeGroups(options);
      } else {
        console.error(
          "Size groups data not found:",
          sizeGroupsResponse?.message
        );
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

  const handleSelectToppingGroup = (group) => {
    setError(null);
    setSelectedToppingGroup(group);
  };

  const createItem = async () => {
    setError(null);
    if (!image) {
      setError("Image de l'article manquante");

      return;
    }

    if (name.length < 1) {
      setError("Nom de l'article manquant");

      return;
    }
    if (!selectedSizeGroup) {
      setError("Selectionner un groupe de tailles");

      return;
    }
    if (prices.length < 1) {
      setError("Ajouter au moin un prix ");

      return;
    }
    if (prices.some((p) => p.price === "" || Number(p.price) <= 0)) {
      setError("Ajouter un prix valide pour chaque taille");

      return;
    }
    if (description.length < 1) {
      setError("Description de l'article manquante");

      return;
    }
    if (!category) {
      setError("Selectionner une categorie");

      return;
    }
    if (!selectedToppingGroup) {
      setError("Selectionner un groupe de personnalisation");

      return;
    }

    const formattedPrices = prices.map((price) => ({
      size: price.size,
      price: Number(price.price),
    }));

    const formData = new FormData();

    formData.append("file", image);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category.value);
    formData.append("customizationGroup", selectedToppingGroup.value);
    formData.append("prices", JSON.stringify(formattedPrices));

    setAddingIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/menuItems/create`, {
        method: "POST",

        body: formData,
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();

      setMenuItems((prev) => [data, ...prev]);

      setShowSuccessModel(true);
    } catch (err) {
      setError("Une erreur s'est produite");
      setShowFailModel(true);
    } finally {
      setAddingIsLoading(false);
    }
  };

  const handleSelectSizeGroup = (group) => {
    setError(null);
    setSelectedSizeGroup(group);
    const mappedPrices = (group?.sizes || []).map((size) => {
      const existing = prices.find((p) => p.size === size.name);
      return { size: size.name, price: existing?.price || "" };
    });
    setPrices(mappedPrices);
  };

  const handlePriceChange = (index, value) => {
    setError(null);
    setPrices((prev) =>
      prev.map((price, i) => (i === index ? { ...price, price: value } : price))
    );
  };
  useEffect(() => {
    if (showSuccessModel) {
      const timer = setTimeout(() => {
        setShowSuccessModel(false);
        setShowCreateItemModal(false);
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

      {isLoading ? (
        <div className="w-[90vw] bg-white p-6 max-h-[85vh] overflow-y-auto rounded-lg flex items-center justify-center shadow-lg">
          <Spinner />
        </div>
      ) : (
        <div className="w-[90vw]  bg-white p-6 max-h-[95vh]  rounded-lg flex flex-col shadow-lg gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-roboto font-semibold text-text-dark-gray">
                Ajouter un article
              </h1>
              <p className="text-sm text-text-light-gray">
                Ajoutez l&apos;image, les infos, puis associez prix et un groupe
                de personnalisation.
              </p>
            </div>
            <button onClick={() => setShowCreateItemModal(false)}>
              <MdOutlineClose size={28} />
            </button>
          </div>

          {error && (
            <div className="border border-warning-red bg-warning-red bg-opacity-10 text-warning-red text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 h-[calc(95vh-200px)] overflow-y-auto ">
            <div className="lg:w-1/2 flex flex-col gap-4 pr-1 min-h-0">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="image"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Image
                </label>
                <div
                  className="flex items-center gap-3 border border-dashed border-gray-300 rounded-md p-3 hover:border-pr cursor-pointer"
                  onClick={handleImageClick}
                >
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
                      width={120}
                      height={120}
                      className="object-cover w-32 h-32 rounded-md"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-md flex justify-center items-center">
                      <MdAddAPhoto size={28} className="text-text-light-gray" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-text-dark-gray font-roboto font-semibold">
                      Cliquez pour importer
                    </p>
                    <p className="text-xs text-text-light-gray">JPG ou PNG</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  className="border border-gray-300 rounded-md w-full py-2 px-3 focus:outline-none focus:border-pr"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pizza Margherita"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="border border-gray-300 rounded-md w-full py-2 px-3 focus:outline-none focus:border-pr"
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez brièvement l'article."
                />
              </div>
            </div>

            <div className="lg:w-1/2 flex flex-col gap-4 pl-0 lg:pl-1 min-h-0 z-10">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="categorie"
                  className="text-text-dark-gray font-roboto font-semibold"
                >
                  Catégorie
                </label>

                <DropDown
                  value={category}
                  setter={setCategory}
                  list={categoriesNames}
                  placeholder={"Selectionner une categorie"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                  Prix
                </h2>
                <DropDown
                  value={selectedSizeGroup}
                  setter={handleSelectSizeGroup}
                  list={sizeGroups}
                  placeholder={"Selectionner un groupe de tailles"}
                />
                {selectedSizeGroup && (
                  <div className="mt-2 flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                    {prices.map((price, index) => (
                      <div
                        key={`${selectedSizeGroup.value}-${price.size}`}
                        className="flex items-center gap-3"
                      >
                        <span className="min-w-[120px] text-sm font-roboto font-semibold text-text-dark-gray">
                          {price.size}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={price.price}
                          onChange={(e) =>
                            handlePriceChange(index, e.target.value)
                          }
                          placeholder="Prix"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-roboto font-semibold text-text-dark-gray">
                  Personnalisations
                </h2>
                <DropDown
                  value={selectedToppingGroup}
                  setter={handleSelectToppingGroup}
                  list={toppingGroups}
                  placeholder={"Selectionner un groupe de personnalisation"}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end pt-3 border-t border-gray-100">
            <button
              className="bg-pr rounded-md py-2.5 font-roboto font-semibold px-8 text-white shadow-sm hover:brightness-95"
              onClick={createItem}
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};

export default CreateItemModal;
