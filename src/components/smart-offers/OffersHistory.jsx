"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight, FaSync } from "react-icons/fa";
import { getOffersHistory } from "@/services/PersonalizedOffersServices";
import Spinner from "@/components/spinner/Spinner";

const STATUS_LABELS = {
  prepared: "Préparée",
  active: "Active",
  viewed: "Vue",
  clicked: "Cliquée",
  applied: "Utilisée",
  expired: "Expirée",
  ignored: "Ignorée",
};

const STATUS_STYLES = {
  prepared: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
  viewed: "bg-indigo-100 text-indigo-700",
  clicked: "bg-purple-100 text-purple-700",
  applied: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-600",
  ignored: "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function OriginBadge({ offer }) {
  if (offer.dynamicRule) {
    return (
      <div className="text-xs">
        <span className="px-1.5 py-0.5 rounded bg-pr/10 text-pr font-bold mr-1">V2</span>
        <span className="text-gray-600">{offer.dynamicRule.name || "règle supprimée"}</span>
        {offer.campaign?.name && <div className="text-gray-400">{offer.campaign.name}</div>}
      </div>
    );
  }
  if (offer.rule) {
    return (
      <div className="text-xs">
        <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-bold mr-1">V1</span>
        <span className="text-gray-600">{offer.rule.segment || "—"}</span>
      </div>
    );
  }
  return <span className="text-xs text-gray-400">—</span>;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("fr-CA", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function OffersHistory() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async (targetPage) => {
    setIsLoading(true);
    setError("");
    const res = await getOffersHistory({
      page: targetPage,
      limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
      source: sourceFilter || undefined,
    });
    if (res.status) {
      setHistory(res.data.history || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } else {
      setError(res.message || "Erreur lors du chargement de l'historique");
    }
    setIsLoading(false);
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchHistory(1), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, sourceFilter]);

  return (
    <div className="h-full flex flex-col">
      {/* Filtres */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Chercher un nom, téléphone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pr"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pr"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pr"
        >
          <option value="">V1 + V2</option>
          <option value="v2">V2 uniquement</option>
          <option value="v1">V1 uniquement</option>
        </select>
        <button
          onClick={() => fetchHistory(page)}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          title="Rafraîchir"
        >
          <FaSync className={isLoading ? "animate-spin" : ""} />
        </button>
        <div className="text-sm text-gray-400 ml-auto shrink-0">{total} offre{total > 1 ? "s" : ""}</div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-20"><Spinner /></div>
        ) : error ? (
          <div className="text-red-500 p-10 bg-red-50 m-4 rounded-xl text-center">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400 py-20">Aucune offre trouvée.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-200 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Type d&apos;offre</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Origine</th>
                <th className="text-left px-4 py-3">Créée le</th>
                <th className="text-left px-4 py-3">Valide jusqu&apos;au</th>
                <th className="text-right px-4 py-3">Commande</th>
              </tr>
            </thead>
            <tbody>
              {history.map((offer) => (
                <tr key={offer._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{offer.user?.name || "—"}</div>
                    <div className="text-xs text-gray-400">{offer.user?.phone_number || offer.user?.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{offer.offerType}</td>
                  <td className="px-4 py-3"><StatusBadge status={offer.status} /></td>
                  <td className="px-4 py-3"><OriginBadge offer={offer} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(offer.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(offer.validUntil)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700">
                    {offer.orderAmount ? `$${Number(offer.orderAmount).toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 p-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => fetchHistory(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            <FaChevronLeft />
          </button>
          <span className="text-sm text-gray-500">Page {page} / {pages}</span>
          <button
            onClick={() => fetchHistory(page + 1)}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
