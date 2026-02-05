"use client";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { HiMiniPencil } from "react-icons/hi2";
import { ImBlocked } from "react-icons/im";
import {
  banUser,
  deleteUser,
  getUsersPagination,
} from "@/services/UsersServices";
import Spinner from "@/components/spinner/Spinner";
import DeleteWarningModal from "@/components/modals/DeleteWarningModal";
import ToastNotification from "@/components/ToastNotification";

const UsersScreen = () => {
  const router = useRouter();
  const [deleteWarningModelState, setDeleteWarningModelState] = useState(false);
  const [banWarningModelState, setBanWarningModelState] = useState(false);
  const [userId, setUserId] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [navigaTo, setNavigaTo] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(false);
    try {
      if (page < 1) {
        return;
      }
      if (pages !== 0 && page > pages) {
        return;
      }
      const response = await getUsersPagination(page, 20, search);
      if (response.status) {
        setUsers(response.data.users);
        setPages(response.data.pages);
      }
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh, page]);

  const handleShowUserModel = (id) => {
    router.push(`/utilisateurs/${id}`);
  };

  const handleShowDeleteWarning = (id) => {
    setUserId(id);
    setDeleteWarningModelState(true);
  };

  const handleShowBanWarning = (id) => {
    setUserId(id);
    setBanWarningModelState(true);
  };

  const handleDeleteUser = async () => {
    try {
      const response = await deleteUser(userId._id);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Utilisateur supprimé avec succès",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message:
            "Une erreur s'est produite lors de la suppression de l'utilisateur",
        });
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message:
          "Une erreur s'est produite lors de la suppression de l'utilisateur",
      });
    } finally {
      setDeleteWarningModelState(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  const handleBanUser = async () => {
    try {
      const response = await banUser(userId._id);
      if (response.status) {
        setToastData({
          show: true,
          type: "success",
          message: "Utilisateur modifié avec succès",
        });
        setRefresh((prev) => prev + 1);
      } else {
        setToastData({
          show: true,
          type: "error",
          message:
            "Une erreur s'est produite lors de la desactivation de l'utilisateur",
        });
      }
    } catch (error) {
      setToastData({
        show: true,
        type: "error",
        message:
          "Une erreur s'est produite lors de la desactivation de l'utilisateur",
      });
    } finally {
      setBanWarningModelState(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] max-h-screen overflow-y-auto relative font-roboto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />
      {deleteWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setDeleteWarningModelState}
          message={`Etes-vous sûr de vouloir supprimer cet utilisateur ?`}
          action={handleDeleteUser}
        />
      )}

      {banWarningModelState && (
        <DeleteWarningModal
          setShowDeleteWarningModal={setBanWarningModelState}
          message={
            userId.isBanned
              ? `Etes-vous sûr de vouloir activer cet utilisateur ?`
              : `Etes-vous sûr de vouloir desactiver cet utilisateur ?`
          }
          action={handleBanUser}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold">Utilisateurs</h1>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                    Page {page}/{pages || 1}
                  </span>
                  <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
                    {users.length} utilisateur(s) affiché(s)
                  </span>
                </div>
              </div>
              <p className="text-sm opacity-90 mt-1">
                Recherchez, consultez et gérez les comptes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="bg-white/15 border border-white/25 rounded-md px-3 py-2 flex items-center gap-2 backdrop-blur">
                <FaMagnifyingGlass size={16} />
                <input
                  className="bg-transparent placeholder-white/70 text-sm focus:outline-none w-48"
                  placeholder="Chercher par nom"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>
              <button
                className="bg-white text-[#111827] font-semibold rounded-md px-4 py-2 shadow-sm hover:brightness-95 transition"
                onClick={fetchData}
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-md font-semibold ${
              page <= 1
                ? "bg-gray-200 text-text-light-gray cursor-not-allowed"
                : "bg-pr text-white hover:brightness-95"
            }`}
            disabled={page <= 1}
          >
            Précédent
          </button>

          {pages > 0 && (
            <div className="flex items-center gap-2">
              <input
                className="font-lato-regular text-sm w-24 border border-gray-300 rounded px-2 py-2 focus:outline-none focus:border-pr"
                placeholder="Aller à"
                onChange={(e) => setNavigaTo(e.target.value)}
                value={navigaTo}
                type="number"
                min={1}
              />
              <button
                className="bg-white border border-gray-300 text-text-dark-gray px-3 py-2 rounded-md hover:border-pr"
                onClick={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                Aller
              </button>
            </div>
          )}

          <button
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-md font-semibold ${
              page >= pages
                ? "bg-gray-200 text-text-light-gray cursor-not-allowed"
                : "bg-pr text-white hover:brightness-95"
            }`}
            disabled={page >= pages}
          >
            Suivant
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-default p-4 border border-gray-100">
          {users?.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[1.2fr,1fr,1.6fr,0.8fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                  <span>Nom</span>
                  <span>Téléphone</span>
                  <span>Email</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="h-[calc(100vh-320px)] overflow-y-auto divide-y divide-gray-100">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="grid grid-cols-[1.2fr,1fr,1.6fr,0.8fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-text-dark-gray truncate">
                        {user.name}
                      </span>
                      <span className="text-text-dark-gray truncate">
                        {user.phone_number}
                      </span>
                      <span className="text-text-light-gray truncate">
                        {user.email}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition"
                          onClick={() => handleShowUserModel(user._id)}
                          aria-label="Voir l'utilisateur"
                        >
                          <HiMiniPencil size={18} />
                        </button>
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => handleShowDeleteWarning(user._id)}
                          aria-label="Supprimer l'utilisateur"
                        >
                          <FaTrash size={16} />
                        </button>
                        <button
                          className={`p-2 rounded-md ${
                            user.isBanned
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-warning-red/10 text-warning-red hover:bg-warning-red/20"
                          } transition`}
                          onClick={() => handleShowBanWarning(user)}
                          aria-label={
                            user.isBanned
                              ? "Activer l'utilisateur"
                              : "Désactiver l'utilisateur"
                          }
                        >
                          <ImBlocked size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-text-light-gray text-sm">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersScreen;
