"use client";

import React, { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";
import { getToken } from "@/actions";
import { useSelector } from "react-redux";
import { selectStaffToken } from "@/redux/slices/StaffSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AuditsPage = () => {
  const [audits, setAudits] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAudits = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const token = await getToken();

      const res = await fetch(
        `${API_URL}/audits?page=${page}&limit=20`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
        {
          cache: "no-store",
        },
      );
      if (!res.ok) {
        throw new Error("Impossible de récupérer les audits");
      }
      const data = await res.json();
      console.log("Audits fetched:", data.audits[3]);

      setAudits(data.audits || []);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
      setToastData({ show: true, type: "error", message: err.message });
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
      setTimeout(() => setToastData((p) => ({ ...p, show: false })), 3000);
    }
  };

  useEffect(() => {
    fetchAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAudits({ silent: true });
  };

  const filteredAudits = useMemo(() => {
    const query = search.toLowerCase();
    return audits.filter((audit) => {
      const user =
        audit.userId?.name ||
        audit.userId?.email ||
        audit.userId?.username ||
        "";
      const action = Array.isArray(audit.action)
        ? audit.action.join(" ").toLowerCase()
        : "";
      return (
        user.toLowerCase().includes(query) ||
        action.includes(query) ||
        audit.detailsModel?.toLowerCase?.().includes(query)
      );
    });
  }, [audits, search]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
          className="ml-3 bg-pr px-3 py-2 rounded text-white"
          onClick={fetchAudits}
        >
          Réessayer
        </button>
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

      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Audits</h1>
              <p className="text-sm opacity-90">
                Historique des actions utilisateurs et système.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                className="bg-white/15 border border-white/25 rounded-md px-3 py-2 text-sm placeholder-white/70 focus:outline-none focus:border-white w-64"
                placeholder="Rechercher (utilisateur, action, modèle)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className={`rounded-md px-4 py-2 text-sm font-semibold transition bg-white/15 border border-white/25 text-white hover:bg-white/20 ${
                  isRefreshing ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Rafraîchissement..." : "Rafraîchir"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
              {filteredAudits.length} audit(s) affiché(s)
            </span>
            <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">
              Page {page}/{pages || 1}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-default border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[0.9fr,2fr,1.2fr,0.9fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-4 py-3">
                <span>Utilisateur</span>

                <span>Action</span>
                <span>Détails</span>
                <span className="text-right">Date</span>
              </div>
              {filteredAudits.length > 0 ? (
                <div className="h-[calc(100vh-320px)] overflow-y-auto divide-y divide-gray-100">
                  {filteredAudits.map((audit) => {
                    const user =
                      audit.userId?.name ||
                      audit.userId?.email ||
                      audit.userId?.username ||
                      "N/A";
                    const action = Array.isArray(audit.action)
                      ? audit.action.join(", ")
                      : audit.action || "";
                    const model = audit.detailsModel || "";
                    let detailsDisplay = "-";
                    if (
                      model.toLowerCase() === "order" &&
                      typeof audit.details === "object"
                    ) {
                      detailsDisplay =
                        audit.details?.code ||
                        audit.details?.orderCode ||
                        audit.details?._id ||
                        "-";
                    } else if (
                      model.toLowerCase() === "restaurant" &&
                      typeof audit.details === "object"
                    ) {
                      detailsDisplay = "-";
                    }

                    return (
                      <div
                        key={audit._id}
                        className="grid grid-cols-[0.9fr,2fr,1.2fr,0.9fr] items-center px-4 py-3 text-sm hover:bg-gray-50 transition"
                      >
                        <span className="font-semibold text-text-dark-gray truncate">
                          {user}
                        </span>
                        <span className="text-text-dark-gray whitespace-pre-wrap break-words">
                          {action || "-"}
                        </span>
                        <span className="text-text-light-gray truncate">
                          {detailsDisplay || "-"}
                        </span>
                        <span className="text-text-light-gray text-right">
                          {audit.timestamp
                            ? dateToDDMMYYYYHHMM(audit.timestamp)
                            : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-text-light-gray text-sm">
                  Aucun audit trouvé.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-md font-semibold ${
              page <= 1
                ? "bg-gray-200 text-text-light-gray cursor-not-allowed"
                : "bg-pr text-white hover:brightness-95"
            }`}
            disabled={page <= 1}
          >
            Précédent
          </button>
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
      </div>
    </div>
  );
};

export default AuditsPage;
