import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import { getCategories, getItemsNames } from "@/services/MenuItemServices";
import Spinner from "../spinner/Spinner";
import DropDown from "../DropDown";
import {
  createPromoCode,
  updatePromoCode,
} from "@/services/PromoCodesServices";

const normalizeId = (value) => String(value || "").trim();

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const CreatePromoCodeModal = ({
  setShowCreateModal,
  setRefresh,
  promoCode = null,
}) => {
  const isEditMode = Boolean(promoCode?._id);
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsNames, setItemsNames] = useState([]);
  const [categoriesNames, setCategoriesNames] = useState([]);
  const [item, setItem] = useState(null);
  const [selectedExcludedCategories, setSelectedExcludedCategories] = useState(
    [],
  );
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] =
    useState(false);
  const [categoriesSearch, setCategoriesSearch] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [usagePerUser, setUsagePerUser] = useState(1);
  const [typeOfUsage, setTypeOfUsage] = useState("limited");
  const [notifContent, setNotifContent] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    if (!promoCode) return;

    setCode(String(promoCode.code || ""));
    setType(String(promoCode.type || "percent"));
    setValue(
      promoCode.type === "amount"
        ? String(promoCode.amount ?? "")
        : promoCode.type === "percent"
          ? String(promoCode.percent ?? "")
          : "",
    );
    setEndDate(formatDateInputValue(promoCode.endDate));
    setUsagePerUser(promoCode.usagePerUser ?? 1);
    setTypeOfUsage(
      typeof promoCode.usagePerUser === "number" ? "limited" : "unlimited",
    );
    setNotifContent({
      title: String(promoCode?.notifContent?.title || ""),
      body: String(promoCode?.notifContent?.body || ""),
    });
  }, [promoCode]);
  const fetchData = async () => {
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getItemsNames(),
        getCategories(),
      ]);

      if (itemsResponse?.status) {
        const list = [];
        itemsResponse.data.map((item) => {
          list.push({ value: item._id, label: item.name });
        });
        setItemsNames(list);
      } else {
        console.error("Menu items data not found:", itemsResponse?.message);
      }

      if (categoriesResponse?.status) {
        const list = categoriesResponse.data.map((entry) => ({
          value: entry._id,
          label: entry.name,
        }));
        setCategoriesNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse?.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code) {
      setError("Code obligatoire");
      return;
    }
    if ((type === "amount" || type === "percent") && !value) {
      setError("Valeur obligatoire");
      return;
    }
    if (type === "percent" && (value < 0 || value > 100)) {
      setError("Pourcentage doit être entre 0 et 100");
      return;
    }
    if (type === "amount" && value <= 0) {
      setError("Montant doit être supérieur à 0");
      return;
    }

    if (type === "free_item" && !item) {
      setError("Article obligatoire");
      return;
    }
    if (!endDate) {
      setError("Date de fin obligatoire");
      return;
    }
    if (typeOfUsage === "limited" && usagePerUser <= 0) {
      setError("Usage par utilisateur doit être supérieur à 0");
      return;
    }

    setError(null);

    try {
      setCreating(true);
      const payload = {
        code: code.toUpperCase(),
        type,
        amount: type === "amount" ? value : null,
        percent: type === "percent" ? value : null,
        freeItem: type === "free_item" ? item.value : null,
        excludedCategories:
          type === "amount" || type === "percent"
            ? selectedExcludedCategories.map((entry) => entry.value)
            : [],
        usagePerUser: typeOfUsage === "limited" ? usagePerUser : null,
        endDate: new Date(endDate).toISOString(),
        notifContent,
      };
      const response = isEditMode
        ? await updatePromoCode(promoCode._id, payload)
        : await createPromoCode(payload);

      if (response.status) {
        setRefresh((prev) => prev + 1);
        setShowCreateModal(false);
      } else {
        setError(
          response.message ||
            `Erreur lors de ${
              isEditMode ? "la modification" : "la création"
            } du code promotionnel`
        );
      }
    } catch (err) {
      setError(
        `Une erreur s'est produite lors de ${
          isEditMode ? "la modification" : "la création"
        } du code promotionnel`
      );
    } finally {
      setCreating(false);
    }
  };
  // Call the API to create the promo code here

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!promoCode) return;

    if (promoCode.type === "free_item") {
      const selectedItem = itemsNames.find(
        (entry) =>
          normalizeId(entry?.value) === normalizeId(promoCode?.freeItem?._id),
      );
      setItem(selectedItem || null);
      setSelectedExcludedCategories([]);
      return;
    }

    const excludedIds = Array.isArray(promoCode?.excludedCategories)
      ? promoCode.excludedCategories.map((entry) => normalizeId(entry?._id))
      : [];

    setSelectedExcludedCategories(
      categoriesNames.filter((entry) =>
        excludedIds.includes(normalizeId(entry?.value)),
      ),
    );
    setItem(null);
  }, [promoCode, itemsNames, categoriesNames]);

  const filteredCategories = categoriesNames.filter((entry) => {
    const query = categoriesSearch.trim().toLowerCase();
    if (!query) return true;
    return String(entry?.label || "").toLowerCase().includes(query);
  });

  const isCategorySelected = (entry) =>
    selectedExcludedCategories.some(
      (category) => normalizeId(category?.value) === normalizeId(entry?.value),
    );

  const toggleExcludedCategory = (entry) => {
    setSelectedExcludedCategories((current) => {
      if (
        current.some(
          (category) => normalizeId(category?.value) === normalizeId(entry?.value),
        )
      ) {
        return current.filter(
          (category) => normalizeId(category?.value) !== normalizeId(entry?.value),
        );
      }

      return [...current, entry];
    });
  };

  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-lg h-[80%]  bg-white p-6 overflow-y-auto rounded-lg shadow-lg z-30">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditMode
              ? "Modifier un code promotionnel"
              : "Ajouter un code promotionnel"}
          </h1>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <MdOutlineClose size={28} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : (
          <div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="percent">Pourcentage</option>
                  <option value="amount">Montant fixe</option>
                  <option value="free_item">Article gratuit</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="value"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valeur
                </label>
                {type === "free_item" ? (
                  <DropDown
                    value={item}
                    setter={setItem}
                    list={itemsNames}
                    placeholder={"Selectionner un article"}
                  />
                ) : (
                  <input
                    type="text"
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
              {(type === "amount" || type === "percent") && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégories exclues du rabais
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setIsCategoriesDropdownOpen((prev) => !prev)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {selectedExcludedCategories.length > 0
                        ? `${selectedExcludedCategories.length} catégorie(s) exclue(s)`
                        : "Aucune catégorie exclue"}
                    </button>
                  </div>

                  {isCategoriesDropdownOpen && (
                    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
                      <input
                        type="text"
                        value={categoriesSearch}
                        onChange={(e) => setCategoriesSearch(e.target.value)}
                        placeholder="Rechercher une catégorie"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />

                      <div className="max-h-52 overflow-y-auto space-y-2">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((entry) => (
                            <label
                              key={entry.value}
                              className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isCategorySelected(entry)}
                                onChange={() => toggleExcludedCategory(entry)}
                              />
                              <span>{entry.label}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            Aucune catégorie trouvée.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedExcludedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedExcludedCategories.map((entry) => (
                        <button
                          key={entry.value}
                          type="button"
                          onClick={() => toggleExcludedCategory(entry)}
                          className="text-xs bg-pr/20 text-black rounded-full px-3 py-1"
                        >
                          {entry.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="">
                <label
                  htmlFor="usagePerUser"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usage par utilisateur
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <button
                    className={`${
                      typeOfUsage === "limited"
                        ? "border-2 border-pr bg-pr/40 "
                        : "bg-white border-2 border-gray-500"
                    } px-4 py-2 rounded-md`}
                    onClick={() => setTypeOfUsage("limited")}
                  >
                    <span>limité</span>
                  </button>

                  <button
                    className={`${
                      typeOfUsage === "unlimited"
                        ? "border-2 border-pr bg-pr/40 "
                        : "bg-white border-2 border-gray-500"
                    } px-4 py-2 rounded-md`}
                    onClick={() => setTypeOfUsage("unlimited")}
                  >
                    <span>illimité</span>
                  </button>
                </div>
                {typeOfUsage === "limited" && (
                  <input
                    type="number"
                    id="limitedUsage"
                    value={usagePerUser}
                    onChange={(e) => setUsagePerUser(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="notifContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contenu de la notification
                </label>
                <textarea
                  id="notifContent"
                  value={notifContent.body}
                  onChange={(e) =>
                    setNotifContent({
                      ...notifContent,
                      body: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Message de la notification"
                />
                <input
                  type="text"
                  id="notifTitle"
                  value={notifContent.title}
                  onChange={(e) =>
                    setNotifContent({
                      ...notifContent,
                      title: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                  placeholder="Titre de la notification 
                    "
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-pr text-black px-6 py-2 rounded  transition font-semibold"
                >
                  {creating
                    ? isEditMode
                      ? "Modification..."
                      : "Création..."
                    : isEditMode
                      ? "Enregistrer"
                      : "Créer le code"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default CreatePromoCodeModal;
