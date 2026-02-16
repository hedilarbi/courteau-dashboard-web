import React, { useRef, useState } from "react";
import { MdAddAPhoto, MdOutlineClose } from "react-icons/md";
import ModalWrapper from "./ModalWrapper";
import DropDown from "../DropDown";
import { createHomeSetting } from "@/services/HomeSettingsServices";
import HomeSettingsPreview from "../HomeSettingsPreview";

const CreateHomeSettingModal = ({
  setShowCreateModal,
  menuItemOptions,
  offerOptions,
  promoCodeOptions,
  onCreated,
}) => {
  const inputImageRef = useRef(null);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [codePromoTitle, setCodePromoTitle] = useState("");
  const [menuItem, setMenuItem] = useState(menuItemOptions[0] || null);
  const [offer, setOffer] = useState(offerOptions[0] || null);
  const [promoCode, setPromoCode] = useState(promoCodeOptions[0] || null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setOffer(offerOptions[0] || null);
    }
  };

  const handleOfferChange = (nextOffer) => {
    setOffer(nextOffer);
    if (nextOffer?.value) {
      setMenuItem(menuItemOptions[0] || null);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !subTitle.trim()) {
      setError("Le titre et le sous-titre sont obligatoires.");
      return;
    }

    if (promoCode?.value && !codePromoTitle.trim()) {
      setError("Le titre du code promo est obligatoire.");
      return;
    }

    if (!image) {
      setError("L'image est obligatoire.");
      return;
    }

    setError("");
    setIsLoading(true);
    const response = await createHomeSetting({
      title: title.trim(),
      subTitle: subTitle.trim(),
      codePromoTitle: codePromoTitle.trim(),
      file: image,
      menuItemId: menuItem?.value || null,
      offerId: offer?.value || null,
      codePromoId: promoCode?.value || null,
    });

    if (response.status) {
      onCreated(response.data);
      setShowCreateModal(false);
    } else {
      setError(
        response.message ||
          "Une erreur s'est produite lors de la création de la configuration."
      );
    }

    setIsLoading(false);
  };

  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text-dark-gray">
              Créer Home Settings
            </h2>
            <p className="text-sm text-text-light-gray mt-1">
              Configurez le contenu principal de la page d&apos;accueil.
            </p>
          </div>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setShowCreateModal(false)}
          >
            <MdOutlineClose size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 border border-warning-red bg-warning-red/10 text-warning-red text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div>
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-2 max-w-[320px]">
                <p className="text-sm font-semibold text-text-dark-gray">Image</p>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="h-44 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center text-text-light-gray"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Aperçu"
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
                    placeholder="Ex: Les meilleurs burgers près de chez vous"
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
                    placeholder="Ex: Rapide, frais et local"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-text-dark-gray">
                    Titre du code promo
                  </label>
                  <input
                    type="text"
                    value={codePromoTitle}
                    onChange={(event) => setCodePromoTitle(event.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pr"
                    placeholder="Ex: Offre week-end"
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
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-2">
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

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            className="bg-pr text-white px-6 py-2 rounded-md font-semibold hover:brightness-95 transition"
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Créer"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateHomeSettingModal;
