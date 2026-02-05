"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  deleteToppingGroup,
  getToppingGroups,
} from "@/services/ToppingGroupsServices";
import Spinner from "./spinner/Spinner";
import ToastNotification from "./ToastNotification";
import { FaPlus, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { HiMiniPencil } from "react-icons/hi2";
import NavBackButton from "./NavBackButton";

const ToppingGroupsScreen = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupRes] = await Promise.all([getToppingGroups()]);
      if (groupRes.status) {
        const list = Array.isArray(groupRes.data?.items)
          ? groupRes.data.items
          : groupRes.data || [];
        setGroups(list);
      }
    } catch (err) {
      setError(err.message);
      setToastData({ show: true, type: "error", message: err.message });
    } finally {
      setIsLoading(false);
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await deleteToppingGroup(id);
      if (res.status) {
        setGroups((prev) => prev.filter((g) => g._id !== id));
        setToastData({
          show: true,
          type: "success",
          message: "Groupe supprimé",
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setToastData({
        show: true,
        type: "error",
        message: err.message,
      });
    } finally {
      setTimeout(
        () => setToastData((prev) => ({ ...prev, show: false })),
        3000
      );
    }
  };

  const selectionLabel = (group) => {
    const rules = group.selectionRule || {};
    if (rules.isRequired) {
      const minVal = rules.min ?? "-";
      const maxVal = rules.max ?? "Illimité";
      return `Requise (${minVal} - ${maxVal})`;
    }
    return "Facultative";
  };

  const filteredGroups = useMemo(() => groups, [groups]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] max-h-screen overflow-y-auto font-roboto">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className="max-w-6xl mx-auto  flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <NavBackButton />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold">
                    Groupes de personnalisations
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs bg-white/15 border border-white/20">
                    {filteredGroups.length} groupe(s)
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  Organisez les personnalisations par règles de sélection.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/personnalisations/groupes-de-personnalisations/ajouter"
                className="flex bg-white items-center justify-center gap-2 rounded-md font-roboto font-semibold py-2 px-4 text-[#111827] shadow-sm hover:brightness-95 transition"
              >
                <FaPlus />
                Nouveau groupe
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-default rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1.4fr,1fr,1.4fr,0.8fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Nom</span>
                <span>Règles</span>
                <span>Personnalisations</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredGroups.length > 0 ? (
                <div className="h-[calc(100vh-200px)] overflow-y-auto divide-y divide-gray-100">
                  {filteredGroups.map((group) => (
                    <div
                      key={group._id}
                      className="grid grid-cols-[1.4fr,1fr,1.4fr,0.8fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-text-dark-gray truncate">
                        {group.name}
                      </span>
                      <span className="text-text-dark-gray">
                        {selectionLabel(group)}
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs text-text-dark-gray">
                        {(group.toppings || []).slice(0, 4).map((t) => (
                          <span
                            key={t._id || t}
                            className="bg-gray-50 border border-gray-200 rounded-full px-2 py-1"
                          >
                            {t.name || t}
                          </span>
                        ))}
                        {group.toppings && group.toppings.length > 4 && (
                          <span className="text-text-light-gray">
                            +{group.toppings.length - 4} autres
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/personnalisations/groupes-de-personnalisations/${group._id}`}
                          className="p-2 rounded-md bg-pr/10 text-pr hover:bg-pr/20 transition mr-2"
                          aria-label="Modifier le groupe"
                        >
                          <HiMiniPencil size={16} />
                        </Link>
                        <button
                          className="p-2 rounded-md bg-warning-red/10 text-warning-red hover:bg-warning-red/20 transition"
                          onClick={() => handleDelete(group._id)}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucun groupe configuré.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToppingGroupsScreen;
