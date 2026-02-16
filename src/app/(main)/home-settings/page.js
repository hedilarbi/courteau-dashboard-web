"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getHomeSettings,
  updateHomeSetting,
} from "@/services/HomeSettingsServices";
import { getItemsNames } from "@/services/MenuItemServices";
import { getOffers } from "@/services/OffersServices";
import { getPromoCodes } from "@/services/PromoCodesServices";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import DropDown from "@/components/DropDown";
import { MdAddAPhoto } from "react-icons/md";
import CreateHomeSettingModal from "@/components/modals/CreateHomeSettingModal";
import HomeSettingsPreview from "@/components/HomeSettingsPreview";

const EMPTY_MENU_ITEM_OPTION = { value: "", label: "Aucun article" };
const EMPTY_OFFER_OPTION = { value: "", label: "Aucune offre" };
const EMPTY_PROMO_CODE_OPTION = { value: "", label: "Aucun code promo" };

const buildSelectedOption = (value, options, emptyOption) => {
  if (!value) {
    return emptyOption;
  }

  const id = typeof value === "object" ? value._id : value;
  const optionFromList = options.find((option) => option.value === id);
  if (optionFromList) {
    return optionFromList;
  }

  const fallbackLabel =
    typeof value === "object"
      ? value.name || value.code || value.title || "Valeur liée"
      : "Valeur liée";

  return {
    value: id,
    label: fallbackLabel,
    type: typeof value === "object" ? value.type : undefined,
    percent: typeof value === "object" ? value.percent : undefined,
    amount: typeof value === "object" ? value.amount : undefined,
    freeItemName:
      typeof value === "object" ? value?.freeItem?.name || "" : undefined,
  };
};

const Page = () => {
  const inputImageRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [homeSetting, setHomeSetting] = useState(null);

  const [menuItemOptions, setMenuItemOptions] = useState([
    EMPTY_MENU_ITEM_OPTION,
  ]);
  const [offerOptions, setOfferOptions] = useState([EMPTY_OFFER_OPTION]);
  const [promoCodeOptions, setPromoCodeOptions] = useState([
    EMPTY_PROMO_CODE_OPTION,
  ]);

  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [codePromoTitle, setCodePromoTitle] = useState("");
  const [menuItem, setMenuItem] = useState(EMPTY_MENU_ITEM_OPTION);
  const [offer, setOffer] = useState(EMPTY_OFFER_OPTION);
  const [promoCode, setPromoCode] = useState(EMPTY_PROMO_CODE_OPTION);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [toastData, setToastData] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToastData({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToastData((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const syncFormWithHomeSetting = (
    setting,
    nextMenuItemOptions = menuItemOptions,
    nextOfferOptions = offerOptions,
    nextPromoCodeOptions = promoCodeOptions,
  ) => {
    setTitle(setting?.title || "");
    setSubTitle(setting?.subTitle || "");
    setCodePromoTitle(setting?.codePromoTitle || "");
    setMenuItem(
      buildSelectedOption(
        setting?.menuItemId,
        nextMenuItemOptions,
        EMPTY_MENU_ITEM_OPTION,
      ),
    );
    setOffer(
      buildSelectedOption(
        setting?.offerId,
        nextOfferOptions,
        EMPTY_OFFER_OPTION,
      ),
    );
    setPromoCode(
      buildSelectedOption(
        setting?.codePromoId,
        nextPromoCodeOptions,
        EMPTY_PROMO_CODE_OPTION,
      ),
    );
    setImage(null);
    setImagePreview(setting?.image || null);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [
        homeSettingResponse,
        itemsResponse,
        offersResponse,
        promoResponse,
      ] = await Promise.all([
        getHomeSettings(),
        getItemsNames(),
        getOffers(),
        getPromoCodes(),
      ]);

      if (!homeSettingResponse.status) {
        throw new Error(homeSettingResponse.message);
      }
      if (!itemsResponse.status) {
        throw new Error(itemsResponse.message);
      }
      if (!offersResponse.status) {
        throw new Error(offersResponse.message);
      }
      if (!promoResponse.status) {
        throw new Error(promoResponse.message);
      }

      const nextMenuItemOptions = [
        EMPTY_MENU_ITEM_OPTION,
        ...(itemsResponse.data || []).map((item) => ({
          value: item._id,
          label: item.name,
        })),
      ];

      const nextOfferOptions = [
        EMPTY_OFFER_OPTION,
        ...(offersResponse.data || []).map((item) => ({
          value: item._id,
          label: item.name,
        })),
      ];

      const nextPromoCodeOptions = [
        EMPTY_PROMO_CODE_OPTION,
        ...(promoResponse.data || []).map((item) => ({
          value: item._id,
          label: item.code,
          type: item.type,
          percent: item.percent,
          amount: item.amount,
          freeItemName: item?.freeItem?.name || "",
        })),
      ];

      setMenuItemOptions(nextMenuItemOptions);
      setOfferOptions(nextOfferOptions);
      setPromoCodeOptions(nextPromoCodeOptions);

      if (homeSettingResponse.data) {
        setHomeSetting(homeSettingResponse.data);
        syncFormWithHomeSetting(
          homeSettingResponse.data,
          nextMenuItemOptions,
          nextOfferOptions,
          nextPromoCodeOptions,
        );
      } else {
        setHomeSetting(null);
        setTitle("");
        setSubTitle("");
        setCodePromoTitle("");
        setMenuItem(EMPTY_MENU_ITEM_OPTION);
        setOffer(EMPTY_OFFER_OPTION);
        setPromoCode(EMPTY_PROMO_CODE_OPTION);
        setImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    inputImageRef.current?.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMenuItemChange = (nextMenuItem) => {
    setMenuItem(nextMenuItem);
    if (nextMenuItem?.value) {
      setOffer(EMPTY_OFFER_OPTION);
    }
  };

  const handleOfferChange = (nextOffer) => {
    setOffer(nextOffer);
    if (nextOffer?.value) {
      setMenuItem(EMPTY_MENU_ITEM_OPTION);
    }
  };

  const handleUpdate = async () => {
    if (!homeSetting) {
      return;
    }

    if (!title.trim() || !subTitle.trim()) {
      showToast("error", "Le titre et le sous-titre sont obligatoires.");
      return;
    }

    if (promoCode?.value && !codePromoTitle.trim()) {
      showToast("error", "Le titre du code promo est obligatoire.");
      return;
    }

    setIsSaving(true);
    const response = await updateHomeSetting(homeSetting._id, {
      title: title.trim(),
      subTitle: subTitle.trim(),
      codePromoTitle: codePromoTitle.trim(),
      file: image,
      menuItemId: menuItem?.value || null,
      offerId: offer?.value || null,
      codePromoId: promoCode?.value || null,
    });

    if (response.status) {
      setHomeSetting(response.data);
      syncFormWithHomeSetting(response.data);
      showToast("success", "Configuration d'accueil mise à jour.");
    } else {
      showToast(
        "error",
        response.message ||
          "Une erreur s'est produite lors de la mise à jour de la configuration.",
      );
    }
    setIsSaving(false);
  };

  const handleCreated = (createdHomeSetting) => {
    setHomeSetting(createdHomeSetting);
    syncFormWithHomeSetting(createdHomeSetting);
    showToast("success", "Configuration d'accueil créée avec succès.");
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="font-lato-bold text-2xl text-red-500">
          Une erreur s&apos;est produite
        </h1>
        <button
          className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-white"
          onClick={() => setRefresh((prev) => prev + 1)}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      {showCreateModal && (
        <CreateHomeSettingModal
          setShowCreateModal={setShowCreateModal}
          menuItemOptions={menuItemOptions}
          offerOptions={offerOptions}
          promoCodeOptions={promoCodeOptions}
          onCreated={handleCreated}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-semibold">Réglages de l&apos;accueil</h1>
          <p className="text-sm opacity-90 mt-1">
            Gérez le contenu principal affiché sur la page d&apos;accueil.
          </p>
        </div>

        {!homeSetting ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-default p-8 text-center">
            <p className="text-text-light-gray">
              Aucune configuration n&apos;est encore définie.
            </p>
            <button
              className="mt-4 bg-pr text-white px-5 py-2 rounded-md font-semibold hover:brightness-95 transition"
              onClick={() => setShowCreateModal(true)}
            >
              Créer
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-default p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
              <div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex flex-col gap-2 max-w-[360px]">
                    <p className="text-sm font-semibold text-text-dark-gray">
                      Image
                    </p>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="h-56 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center text-text-light-gray"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Home setting"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex flex-col items-center text-xs gap-2 px-3 text-center">
                          <MdAddAPhoto size={28} />
                          Ajouter une image
                        </span>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={inputImageRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-text-dark-gray">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-text-dark-gray">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={subTitle}
                        onChange={(event) => setSubTitle(event.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-text-dark-gray">
                        Titre du code promo
                      </label>
                      <input
                        type="text"
                        value={codePromoTitle}
                        onChange={(event) =>
                          setCodePromoTitle(event.target.value)
                        }
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-text-dark-gray">
                          Article (redirection)
                        </label>
                        <div className="mt-1">
                          <DropDown
                            value={menuItem}
                            setter={handleMenuItemChange}
                            list={menuItemOptions}
                            placeholder="Sélectionner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-text-dark-gray">
                          Offre (redirection)
                        </label>
                        <div className="mt-1">
                          <DropDown
                            value={offer}
                            setter={handleOfferChange}
                            list={offerOptions}
                            placeholder="Sélectionner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-text-dark-gray">
                          Code promo lié
                        </label>
                        <div className="mt-1">
                          <DropDown
                            value={promoCode}
                            setter={setPromoCode}
                            list={promoCodeOptions}
                            placeholder="Sélectionner"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-text-light-gray">
                      Ces champs servent uniquement a la redirection du bouton
                      &nbsp;&quot;Commander maintenant&quot;.
                    </p>

                    <div className="flex justify-end">
                      <button
                        className="bg-pr text-white px-6 py-2 rounded-md font-semibold hover:brightness-95 transition"
                        onClick={handleUpdate}
                        disabled={isSaving}
                      >
                        {isSaving ? "Modification..." : "Modifier"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-6">
                <p className="text-sm font-semibold text-text-dark-gray mb-2">
                  Prévisualisation exacte de l&apos;accueil mobile
                </p>
                <HomeSettingsPreview
                  title={title}
                  subTitle={subTitle}
                  codePromoTitle={codePromoTitle}
                  imagePreview={imagePreview}
                  promoCode={promoCode}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
