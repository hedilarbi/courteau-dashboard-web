import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import { getItemsNames } from "@/services/MenuItemServices";
import Spinner from "../spinner/Spinner";
import DropDown from "../DropDown";
import { createPromoCode } from "@/services/PromoCodesServices";

const CreatePromoCodeModal = ({ setShowCreateModal, setRefresh }) => {
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsNames, setItemsNames] = useState([]);
  const [item, setItem] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [usagePerUser, setUsagePerUser] = useState(1);
  const [typeOfUsage, setTypeOfUsage] = useState("limited");
  const [notifContent, setNotifContent] = useState({
    title: "",
    body: "",
  });
  const fetchData = async () => {
    try {
      const response = await getItemsNames();
      if (response?.status) {
        let list = [];
        response.data.map((item) => {
          list.push({ value: item._id, label: item.name });
        });
        setItemsNames(list);
      } else {
        console.error("Categories data not found:", categoriesResponse.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
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
      const response = await createPromoCode({
        code: code.toUpperCase(),
        type,
        amount: type === "amount" ? value : null,
        percent: type === "percent" ? value : null,
        freeItem: type === "free_item" ? item.value : null,
        usagePerUser: typeOfUsage === "limited" ? usagePerUser : null,
        endDate: new Date(endDate).toISOString(),
        notifContent,
      });

      if (response.status) {
        setRefresh((prev) => prev + 1);
        setShowCreateModal(false);
      } else {
        setError(
          response.message || "Erreur lors de la création du code promotionnel"
        );
      }
    } catch (err) {
      setError(
        "Une erreur s'est produite lors de la création du code promotionnel"
      );
    } finally {
      setCreating(false);
    }
  };
  // Call the API to create the promo code here

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-lg h-[80%]  bg-white p-6 overflow-y-auto rounded-lg shadow-lg z-30">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ajouter un code promotionnel
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
                  onClick={handleCreate}
                  className="bg-pr text-black px-6 py-2 rounded  transition font-semibold"
                >
                  {creating ? "Création..." : "Créer le code"}
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
