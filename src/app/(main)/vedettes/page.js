"use client";
import CreateVedetteModal from "@/components/modals/CreateVedetteModal";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import RenderVedette from "@/components/RenderVedette";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import {
  deleteVedette,
  getVedettes,
  vedetteTri,
} from "@/services/VedettesServices";
import React, { useState, useEffect, useRef } from "react";

const Page = () => {
  const [vedettes, setVedettes] = useState([]);
  const [vedetteList, setVedetteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [isTriLoading, setIsTriLoading] = useState(false);
  const [triMode, setTriMode] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const listRef = useRef();
  const [createItemModal, setCreateItemModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVedettes();
      if (response.status) {
        setVedettes(response.data);
        setVedetteList(response.data);
      } else {
        setError(response.message || "Failed to fetch vedettes");
      }
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTri = async (from, to) => {
    const menuItemsCopy = [...vedettes];

    menuItemsCopy[from].order = to;

    menuItemsCopy[to].order = from;

    const temp = menuItemsCopy[from];

    menuItemsCopy[from] = menuItemsCopy[to];
    menuItemsCopy[to] = temp;

    setVedettes(menuItemsCopy);
  };

  const discardTri = () => {
    setVedettes(vedetteList);
    setTriMode(false);
  };
  const handleShowDeleteWarning = (id) => {
    setMenuItem(id);
    setDeleteWarningModelState(true);
  };
  const handleDeleteItem = async () => {
    try {
      const response = await deleteVedette(menuItem);

      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Vedette deleted successfully",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message: "Failed to delete vedette",
        });
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message: "An error occurred while deleting the vedette",
      });
    } finally {
      setDeleteWarningModelState(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };
  const saveTri = async () => {
    setIsTriLoading(true);
    try {
      const list = vedettes.map((item) => {
        return { id: item._id, order: item.order };
      });
      const response = await vedetteTri(list);
      if (response.status) {
        setVedettes(vedettes);
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

  useEffect(() => {
    fetchData();
  }, [refresh]);

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
    <div className="bg-[#f5f7fb] min-h-screen overflow-y-auto relative font-roboto max-h-screen">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {deleteWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setDeleteWarningModelState}
          message={`Etes-vous sûr de vouloir supprimer cette vedette ?`}
          action={handleDeleteItem}
        />
      )}
      {createItemModal && (
        <CreateVedetteModal
          setShowCreateVedette={setCreateItemModal}
          setRefresh={setRefresh}
          setToastData={setToastData}
        />
      )}
      {isTriLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Vedettes</h1>
              <p className="text-sm opacity-90 mt-1">
                Gérez les articles mis en avant et leur ordre.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                  {vedettes.length} vedette(s)
                </span>
                <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                  {triMode ? "Mode tri actif" : "Mode tri inactif"}
                </span>
              </div>

              <button
                onClick={() => setCreateItemModal(true)}
                className="bg-white text-[#111827] px-4 py-2 rounded-md shadow-sm font-semibold hover:brightness-95 transition"
              >
                Ajouter une vedette
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {triMode ? (
            <>
              <button
                className="bg-pr text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:brightness-95"
                onClick={saveTri}
              >
                Sauvegarder
              </button>
              <button
                className="bg-gray-200 text-text-dark-gray px-4 py-2 rounded-md font-semibold"
                onClick={discardTri}
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              className="bg-white border border-gray-200 text-text-dark-gray px-4 py-2 rounded-md font-semibold hover:border-pr"
              onClick={() => setTriMode(true)}
            >
              Modifier l&apos;ordre
            </button>
          )}
        </div>

        {vedettes.length > 0 ? (
          <div
            className="bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden"
            ref={listRef}
          >
            <div className="overflow-x-auto">
              <div className="min-w-[780px]">
                <div
                  className={`grid ${
                    triMode
                      ? "grid-cols-[120px,1.6fr,0.6fr,0.6fr]"
                      : "grid-cols-[120px,1.6fr,0.6fr]"
                  } bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3`}
                >
                  <span>Image</span>
                  <span>Article</span>
                  <span className="text-right">Actions</span>
                  {triMode && <span className="text-right">Ordre</span>}
                </div>
                <div className="h-[calc(100vh-280px)] overflow-y-auto divide-y divide-gray-100">
                  {vedettes.map((vedette, index) => (
                    <RenderVedette
                      key={vedette._id}
                      vedette={vedette}
                      index={index}
                      handleShowDeleteWarning={handleShowDeleteWarning}
                      handleTri={handleTri}
                      triMode={triMode}
                      isLast={index === vedettes.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-default p-8 text-center text-text-light-gray">
            Aucune vedette pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
