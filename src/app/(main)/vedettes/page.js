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
    <div className="bg-[#f5f5f5] h-screen overflow-y-auto relative">
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
      <div className="flex-1 p-5">
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-roboto font-bold text-4xl">Vedettes</h1>
          <button
            onClick={() => setCreateItemModal(true)}
            className="bg-[#F7A600] text-black px-4 py-2 rounded hover:bg-[#e69500] transition"
          >
            Ajouter une vedette
          </button>
        </div>
      </div>
      <div className="flex-1 px-5">
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
              <span className="font-lato-bold text-lg text-black">Annuler</span>
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
      {vedettes.length > 0 ? (
        <div className="mt-2.5 p-5" ref={listRef}>
          {vedettes.map((vedette, index) => (
            <RenderVedette
              key={vedette._id}
              vedette={vedette}
              index={index}
              handleShowDeleteWarning={handleShowDeleteWarning}
              handleTri={handleTri}
              triMode={triMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center bg-white rounded-xl mt-5 p-5">
          <h2 className="font-lato-bold text-2xl">Aucunne vedette</h2>
        </div>
      )}
    </div>
  );
};

export default Page;
