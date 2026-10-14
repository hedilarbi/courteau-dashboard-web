"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaBrain, FaPlus, FaPlay, FaPause, FaEdit, FaTrash, FaCog, FaList, FaChartLine, FaHistory, FaSearch, FaCopy, FaToggleOn, FaToggleOff } from "react-icons/fa";
import StateDefinitionsModal from "../../../components/smart-client/StateDefinitionsModal";
import SmartClientAnalytics from "../../../components/smart-client/SmartClientAnalytics";
import RuleHistoryModal from "../../../components/smart-client/RuleHistoryModal";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";

const API_URL = SMART_CLIENT_API_URL;

export default function SmartClientPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDefinitionsModalOpen, setIsDefinitionsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [historyRule, setHistoryRule] = useState(null);
  const [systemActive, setSystemActive] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/smart-client`, { headers: await getSmartClientAuthHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Impossible de charger les règles.");
      if (json.data) {
        setRules(json.data.map(r => ({
          id: r._id,
          name: r.ruleName || "Règle sans nom",
          description: `Piste: ${r.track} • Déclencheur: ${r.selectedStates?.join(", ") || r.triggerEvent} • Remise: ${r.safeguards?.maxDiscountPct || 15}% max`,
          status: r.status || "active",
          weight: r.safeguards?.priority || 50,
          track: r.track,
          offersCount: 1,
        })));
      }
    } catch (e) {
      console.error("Could not fetch Smart Client rules", e);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    getSmartClientAuthHeaders().then((headers) => fetch(`${API_URL}/smart-client/system-status`, { headers })).then((response) => response.json()).then((json) => json.success && setSystemActive(json.isActive)).catch(() => {});
  }, []);

  const filteredRules = rules.filter((rule) =>
    (statusFilter === "all" || rule.status === statusFilter) &&
    (trackFilter === "all" || rule.track === trackFilter) &&
    `${rule.name} ${rule.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/smart-client/${id}/toggle`, { method: "PATCH", headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Impossible de modifier la règle.");
      setRules((current) => current.map(r =>
        r.id === id ? { ...r, status: json.data.status } : r
      ));
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const deleteRule = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette règle ?")) return;
    try {
      const response = await fetch(`${API_URL}/smart-client/${id}`, { method: "DELETE", headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Impossible d'archiver la règle.");
      setRules((current) => current.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const duplicateRule = async (id) => {
    try {
      const response = await fetch(`${API_URL}/smart-client/${id}/duplicate`, { method: "POST", headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Duplication impossible.");
      await fetchRules();
    } catch (error) { alert(error.message); }
  };

  const toggleSystem = async () => {
    try {
      const response = await fetch(`${API_URL}/smart-client/toggle-system`, { method: "POST", headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Action impossible.");
      setSystemActive(json.isActive);
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="w-full h-full p-6 pb-0 flex flex-col text-gray-800 font-sans">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center">
          <FaBrain className="text-3xl text-pr mr-3" />
          <div>
            <h1 className="text-3xl font-black text-pr">Smart Client</h1>
            <p className="text-sm text-gray-500 mt-1">Moteur de règles comportementales temps réel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleSystem} className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-bold ${systemActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{systemActive ? <FaToggleOn className="mr-2 text-xl" /> : <FaToggleOff className="mr-2 text-xl" />}{systemActive ? "Système actif" : "Système inactif"}</button>
          <button 
            onClick={() => setIsDefinitionsModalOpen(true)}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-bold flex items-center transition-colors shadow-sm text-sm"
          >
            <FaCog className="mr-2 text-gray-500" /> Définitions des états
          </button>

          <Link 
            href="/smart-client/create"
            className="bg-pr hover:bg-pr/90 text-white px-5 py-2.5 rounded-lg font-bold flex items-center transition-colors shadow-md text-sm"
          >
            <FaPlus className="mr-2" /> Créer une règle
          </Link>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 pb-1 shrink-0">
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center px-6 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === "rules"
              ? "bg-white text-pr border-b-2 border-pr shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaList className="mr-2" /> Règles
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center px-6 py-2 rounded-t-lg font-bold transition-all ${
            activeTab === "analytics"
              ? "bg-white text-pr border-b-2 border-pr shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaChartLine className="mr-2" /> Analytics
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-xl p-6 shadow-sm flex-1 overflow-y-auto">
        {activeTab === "analytics" ? (
          <SmartClientAnalytics />
        ) : (
        <>
        <div className="mb-5 flex flex-wrap gap-3">
          <label className="flex min-w-[260px] flex-1 items-center rounded-lg border bg-gray-50 px-3"><FaSearch className="mr-2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une règle…" className="w-full bg-transparent py-2 outline-none" /></label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2"><option value="all">Tous les statuts</option><option value="active">Actives</option><option value="inactive">Inactives</option><option value="draft">Brouillons</option><option value="test">Tests</option></select>
          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className="rounded-lg border px-3 py-2"><option value="all">Toutes les pistes</option>{[...new Set(rules.map((rule) => rule.track))].map((track) => <option key={track} value={track}>{track}</option>)}</select>
        </div>
        {rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <FaBrain className="text-6xl opacity-20" />
            <p className="text-lg">Aucune règle configurée pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 px-4">Statut</th>
                  <th className="pb-3 px-4">Nom de la règle</th>
                  <th className="pb-3 px-4">Poids</th>
                  <th className="pb-3 px-4">Offres liées</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => toggleStatus(rule.id)}
                        className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                          rule.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                        title={rule.status === "active" ? "Désactiver" : "Activer"}
                      >
                        {rule.status === "active" ? <FaPlay size={12} /> : <FaPause size={12} />}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-800">{rule.name}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-md truncate">{rule.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        {rule.weight}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-600">{rule.offersCount} offre(s)</span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link href={`/smart-client/edit/${rule.id}`} className="inline-flex p-2 text-gray-400 hover:text-pr transition-colors bg-gray-50 hover:bg-pr/10 rounded-lg">
                        <FaEdit />
                      </Link>
                      <button onClick={() => setHistoryRule(rule)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg" title="Historique"><FaHistory /></button>
                      <button onClick={() => duplicateRule(rule.id)} className="p-2 text-gray-400 hover:text-purple-600 bg-gray-50 rounded-lg" title="Dupliquer"><FaCopy /></button>
                      <button 
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg"
                        title="Supprimer la règle"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}
      </div>

      <StateDefinitionsModal
        isOpen={isDefinitionsModalOpen}
        onClose={() => setIsDefinitionsModalOpen(false)}
      />
      {historyRule && <RuleHistoryModal rule={historyRule} onClose={() => setHistoryRule(null)} onRestored={fetchRules} />}
    </div>
  );
}
