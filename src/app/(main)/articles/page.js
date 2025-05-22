"use client";
import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import MenuItemsFilter from "@/components/MenuItemsFilter";
import {
  deleteMenuItem,
  getCategories,
  getMenuItems,
  menuTri,
} from "@/services/MenuItemServices";
import RenderMenuItem from "@/components/RenderMenuItem";
import ToastNotification from "@/components/ToastNotification";
import Spinner from "@/components/spinner/Spinner";
import CreateItemModal from "@/components/modals/CreateItemModal";

const ItemsScreen = () => {
  const router = useRouter();
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);

  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [menuItemFilter, setMenuItemFilter] = useState("Toutes les catégories");
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsList, setMenuItemsList] = useState([]);
  const [createItemModal, setCreateItemModal] = useState(false);

  const [error, setError] = useState(false);
  const listRef = useRef();

  const handleTri = async (from, to) => {
    const menuItemsCopy = [...menuItems];
    menuItemsCopy[from].order = to;
    menuItemsCopy[to].order = from;
    const temp = menuItemsCopy[from];
    menuItemsCopy[from] = menuItemsCopy[to];
    menuItemsCopy[to] = temp;
    setMenuItems(menuItemsCopy);
  };

  const discardTri = () => {
    setMenuItems(menuItemsList);
    setTriMode(false);
  };

  const saveTri = async () => {
    setIsTriLoading(true);
    try {
      const list = menuItems.map((item) => {
        return { id: item._id, order: item.order };
      });
      const response = await menuTri(list);
      if (response.status) {
        setMenuItemsList(menuItems);
        setToastData({
          show: true,
          type: "success",
          message: "L'ordre a été modifié avec succès",
        });
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
        message: "Une erreur s'est produite lors de la sauvegarde de l'ordre",
      });
      console.error("An error occurred:", error);
    } finally {
      setTriMode(false);
      setIsTriLoading(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const [categoriesResponse, menuItemResponse] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ]);

      if (menuItemResponse?.status) {
        setMenuItemsList(menuItemResponse?.data);
        if (menuItemFilter === "Toutes les catégories") {
          setMenuItems(menuItemResponse?.data);
        } else {
          const list = menuItemResponse.data.filter(
            (item) => item.category.name === menuItemFilter
          );
          setMenuItems(list);
        }
      } else {
        setError(true);
      }
      if (categoriesResponse?.status) {
        setCategories(categoriesResponse?.data);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [refresh]);

  useEffect(() => {
    fetchData();
  }, [menuItemFilter]);

  const handleShowDeleteWarning = (id) => {
    setMenuItem(id);
    setDeleteWarningModelState(true);
  };

  const handleDeleteItem = async () => {
    setIsLoading(true);
    try {
      const response = await deleteMenuItem(menuItem);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Article supprimé avec succès",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message: response.message,
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setDeleteWarningModelState(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className=" flex justify-center items-center h-screen">
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
    <div className="bg-[#f5f5f5] h-screen overflow-y-auto relative">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {deleteWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setDeleteWarningModelState}
          message={`Etes-vous sûr de vouloir supprimer cet article ?`}
          action={handleDeleteItem}
        />
      )}
      {createItemModal && (
        <CreateItemModal
          setShowCreateItemModal={setCreateItemModal}
          setMenuItems={setMenuItems}
        />
      )}
      {isTriLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}

      <div className="flex-1 p-5">
        <h1 className="font-bebas-neue text-4xl">Articles</h1>

        <div className="flex flex-row items-center mt-7 justify-between">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row gap-3">
              <button
                className="bg-[#F7A600] px-5 py-2.5 rounded border border-black flex flex-row items-center"
                onClick={() => setCreateItemModal(true)}
              >
                + Créer un article
              </button>
            </div>
            <div className="flex flex-row gap-3">
              <button
                className="bg-[#F7A600] px-5 py-2.5 rounded border border-black flex flex-row items-center"
                onClick={() => router.push("/articles/categories")}
              >
                <span className="font-lato-bold text-lg ml-2.5">
                  Liste des catégories
                </span>
              </button>
              <button
                className="bg-[#F7A600] px-5 py-2.5 rounded border border-black flex flex-row items-center"
                onClick={() => router.push("/articles/tailles")}
              >
                <span className="font-lato-bold text-lg ml-2.5">
                  Liste des tailles
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center mt-3">
          <div>
            {triMode ? (
              <div className="flex flex-row items-center gap-3">
                <button
                  className="flex flex-row items-center bg-[#F7A600] px-5 py-2.5 rounded justify-between"
                  onClick={saveTri}
                >
                  <span className="font-lato-bold text-lg">Sauvegarder</span>
                </button>
                <button
                  className="flex flex-row items-center bg-gray-300 px-5 py-2.5 rounded justify-between"
                  onClick={discardTri}
                >
                  <span className="font-lato-bold text-lg text-black">
                    Annuler
                  </span>
                </button>
              </div>
            ) : (
              <button
                className="flex flex-row items-center bg-[#F7A600] px-5 py-2.5 rounded justify-between"
                onClick={() => setTriMode(true)}
              >
                Modifier l&apos;ordre
              </button>
            )}
          </div>

          <MenuItemsFilter
            categories={categories}
            setMenuItemFilter={setMenuItemFilter}
            menuItemFilter={menuItemFilter}
            menuItemsList={menuItemsList}
            setMenuItems={setMenuItems}
          />
        </div>

        {menuItems.length > 0 ? (
          <div className="mt-2.5" ref={listRef}>
            {menuItems.map((item, index) => (
              <RenderMenuItem
                key={item._id}
                item={item}
                index={index}
                handleShowDeleteWarning={handleShowDeleteWarning}
                handleTri={handleTri}
                triMode={triMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center bg-white rounded-xl mt-5">
            <h2 className="font-lato-bold text-2xl">Aucun Article</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsScreen;
