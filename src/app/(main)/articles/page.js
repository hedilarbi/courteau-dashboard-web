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
    <div className="bg-[#f5f7fb] h-screen max-h-screen overflow-hidden relative flex flex-col min-h-0">
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

      <div className="flex-1 p-5 overflow-y-auto min-h-0">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold">Articles</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-white/15 border border-white/20 text-xs px-3 py-1 rounded-full">
                      {menuItems.length} article(s)
                    </span>
                    <span className="bg-white/15 border border-white/20 text-xs px-3 py-1 rounded-full">
                      {menuItemFilter}
                    </span>
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  Créez, organisez et modifiez les articles du menu.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-white text-[#111827] px-4 py-2 rounded-md font-roboto font-semibold shadow-sm hover:brightness-95"
                  onClick={() => setCreateItemModal(true)}
                >
                  + Créer un article
                </button>
                <button
                  className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-md font-roboto font-semibold hover:bg-white/15"
                  onClick={() => router.push("/articles/categories")}
                >
                  Catégories
                </button>
                <button
                  className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-md font-roboto font-semibold hover:bg-white/15"
                  onClick={() => router.push("/articles/groupe-de-tailles")}
                >
                  Groupes de tailles
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-default rounded-lg p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <MenuItemsFilter
                categories={categories}
                setMenuItemFilter={setMenuItemFilter}
                menuItemFilter={menuItemFilter}
                menuItemsList={menuItemsList}
                setMenuItems={setMenuItems}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="text-sm text-text-light-gray">
                  {menuItems.length} article(s) affiché(s)
                </div>
                <div className="flex flex-wrap gap-2">
                  {triMode ? (
                    <>
                      <button
                        className="bg-pr text-white px-4 py-2 rounded-md font-roboto font-semibold shadow-sm"
                        onClick={saveTri}
                      >
                        Sauvegarder l&apos;ordre
                      </button>
                      <button
                        className="bg-gray-200 text-text-dark-gray px-4 py-2 rounded-md font-roboto font-semibold"
                        onClick={discardTri}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      className="bg-white border border-gray-200 text-text-dark-gray px-4 py-2 rounded-md font-roboto font-semibold hover:border-pr"
                      onClick={() => setTriMode(true)}
                    >
                      Modifier l&apos;ordre
                    </button>
                  )}
                </div>
              </div>

              {menuItems.length > 0 ? (
                <div
                  className="bg-white border border-gray-100 rounded-lg overflow-hidden"
                  ref={listRef}
                >
                  <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                      <div
                        className={`grid ${
                          triMode
                            ? "grid-cols-[120px,1.4fr,1fr,1fr,0.8fr,0.6fr]"
                            : "grid-cols-[120px,1.4fr,1fr,1fr,0.8fr]"
                        } bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3`}
                      >
                        <span>Image</span>
                        <span>Nom / Catégorie</span>
                        <span>Tailles</span>
                        <span>Prix</span>
                        <span className="text-right">Actions</span>
                        {triMode && <span className="text-right">Ordre</span>}
                      </div>
                      <div className="h-[calc(100vh-350px)] overflow-y-auto divide-y divide-gray-100">
                        {menuItems.map((item, index) => (
                          <RenderMenuItem
                            key={item._id}
                            item={item}
                            index={index}
                            handleShowDeleteWarning={handleShowDeleteWarning}
                            handleTri={handleTri}
                            triMode={triMode}
                            isLast={index === menuItems.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 py-10">
                  <h2 className="font-roboto font-semibold text-text-dark-gray text-lg">
                    Aucun Article
                  </h2>
                  <p className="text-sm text-text-light-gray mt-1">
                    Créez un article pour commencer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsScreen;
