import { getItemsNames } from "@/services/MenuItemServices";
import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { MdOutlineClose } from "react-icons/md";
import Spinner from "../spinner/Spinner";
import DropDown from "../DropDown";
import { createVedette } from "@/services/VedettesServices";

const CreateVedetteModal = ({
  setShowCreateVedette,
  setRefresh,
  setToastData,
}) => {
  const [itemsNames, setItemsNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
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
    if (!item) {
      setError("Article obligatoire");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const response = await createVedette(item.value);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Article ajouté en vedette avec succès",
        });
        setRefresh((prev) => prev + 1);
        setShowCreateVedette(false);
      } else {
        setToastData({
          show: true,
          type: "error",
          message: response.message,
        });
        console.error(response.message);
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message:
          "Une erreur s'est produite lors de l'ajout de l'article en vedette",
      });
      console.error("An error occurred:", error);
    } finally {
      setCreating(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ModalWrapper zindex={20}>
      <div className="w-full max-w-lg bg-white p-6 overflow-y-auto rounded-lg shadow-lg z-30">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ajouter un article en vedette
          </h1>
          <button
            onClick={() => setShowCreateVedette(false)}
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
                  htmlFor="value"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valeur
                </label>

                <DropDown
                  value={item}
                  setter={setItem}
                  list={itemsNames}
                  placeholder={"Selectionner un article"}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="bg-pr text-black px-6 py-2 rounded  transition font-semibold"
                >
                  {creating ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default CreateVedetteModal;
