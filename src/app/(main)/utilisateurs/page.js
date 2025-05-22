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
          message: "Utilisateur supprimé avec succès",
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
          Une erreur s'est produite
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
    <div className="bg-[#f5f5f5] min-h-screen relative">
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
              : `Etes-vous sûr de vouloir bannir cet utilisateur ?`
          }
          action={handleBanUser}
        />
      )}

      <div className="flex-1 p-5">
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bebas-neue text-4xl">Utilisateurs</h1>
          <div className="flex flex-row items-center mt-3">
            <div className="bg-white flex flex-row w-[300px] items-center pb-1 pt-1 pl-1 border border-gray-300 rounded">
              <FaMagnifyingGlass />
              <input
                className="font-lato-regular text-lg ml-1 flex-1 outline-none"
                placeholder="Chercher par nom"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <button
              className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-black"
              onClick={fetchData}
            >
              Rechercher
            </button>
          </div>
        </div>

        {users?.length > 0 ? (
          <div className="w-full mt-7 border border-black overflow-y-auto h-[calc(100vh-200px)] rounded-xl">
            {users.map((user, index) => (
              <div
                key={user._id}
                className={`flex flex-row gap-12 items-center justify-between py-3 px-2.5 ${
                  index % 2 ? "bg-transparent" : "bg-[rgba(247,166,0,0.3)]"
                }`}
              >
                <span className="font-lato-regular text-lg w-1/5">
                  {user.name}
                </span>
                <span className="font-lato-regular text-lg w-1/5">
                  {user.phone_number}
                </span>
                <span className="font-lato-regular text-lg flex-1">
                  {user.email}
                </span>
                <button
                  className="flex justify-center items-center"
                  onClick={() => handleShowUserModel(user._id)}
                >
                  <HiMiniPencil color="#2AB2DB" size={24} />
                </button>
                <button
                  className="flex justify-center items-center"
                  onClick={() => handleShowDeleteWarning(user._id)}
                >
                  <FaTrash color="#F31A1A" size={24} />
                </button>
                <button
                  className="flex justify-center items-center"
                  onClick={() => handleShowBanWarning(user)}
                >
                  <ImBlocked
                    color={user.isBanned ? "green" : "#F31A1A"}
                    size={24}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center bg-white rounded-xl mt-5">
            <h2 className="font-lato-bold text-2xl">Aucun Utilisateur</h2>
          </div>
        )}
        <div className="flex flex-row justify-center">
          <span className="font-lato-regular text-lg">
            {"Page " + page + (pages > 0 ? "/" + pages : "")}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-3 py-2 rounded ${
                page <= 1 ? "bg-gray-500" : "bg-[#F7A600]"
              }`}
              disabled={page <= 1}
            >
              <span className="text-white">Précédent</span>
            </button>
          </div>
          {pages > 0 && (
            <div className="flex flex-row items-center">
              <input
                className="font-lato-regular text-lg w-24 border border-gray-300 rounded px-1.5 py-1"
                placeholder="Page"
                onChange={(e) => setNavigaTo(e.target.value)}
                value={navigaTo}
                type="number"
              />
              <button
                className="ml-3 bg-[#F7A600] px-3 py-2 rounded text-black"
                onClick={() => {
                  setPage(parseInt(navigaTo));
                  setNavigaTo("");
                }}
              >
                Rechercher
              </button>
            </div>
          )}

          <div>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className={`px-3 py-2 rounded ${
                page >= pages ? "bg-gray-500" : "bg-[#F7A600]"
              }`}
              disabled={page >= pages}
            >
              <span className="text-white">Suivant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersScreen;
