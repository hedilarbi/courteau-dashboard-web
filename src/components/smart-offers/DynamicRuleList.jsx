"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaCogs, FaEdit, FaTrash, FaRandom, FaWater, FaChartLine, FaTrophy, FaSpinner } from "react-icons/fa";
import VisualRuleBuilder from "./VisualRuleBuilder";
import { getToken } from "@/actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DynamicRuleList({ campaign }) {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [filterTag, setFilterTag] = useState("all");

  const TAGS_MAP = {
    "reactivation": { label: "Réactivation", color: "bg-red-100 text-red-700 border-red-200" },
    "fidelite": { label: "Fidélité / VIP", color: "bg-green-100 text-green-700 border-green-200" },
    "panier": { label: "Panier", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    "habitude": { label: "Habitude", color: "bg-blue-100 text-blue-700 border-blue-200" },
    "test": { label: "A/B Test", color: "bg-purple-100 text-purple-700 border-purple-200" }
  };

  const fetchRules = useCallback(async () => {
    if (!campaign?._id) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/rules/campaign/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token?.value}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      } else {
        console.error("Erreur lors de la récupération des règles");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    } finally {
      setIsLoading(false);
    }
  }, [campaign?._id]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette règle et toutes ses offres ?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/rules/${ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token?.value}` }
      });
      if (res.ok) {
        await fetchRules();
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "waterfall": return <><FaWater className="mr-1 text-blue-500" /> Waterfall</>;
      case "multi_armed_bandit": return <><FaChartLine className="mr-1 text-purple-500" /> Bandit A/B</>;
      case "success_sequence": return <><FaTrophy className="mr-1 text-yellow-500" /> Follow-Up</>;
      case "weighted_random": return <><FaRandom className="mr-1 text-pink-500" /> Aléatoire</>;
      default: return <><FaCogs className="mr-1 text-gray-500" /> Stricte</>;
    }
  };

  const handleOpenBuilder = (rule = null) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const handleCloseBuilder = () => {
    setIsBuilderOpen(false);
    setEditingRule(null);
    fetchRules(); // Refresh list after create/edit
  };

  const filteredRules = filterTag === "all" ? rules : rules.filter(r => r.tags?.includes(filterTag));

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            Règles : <span className="text-pr ml-2">{campaign?.name}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Gérez le ciblage et la distribution pour cette campagne.</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none"
          >
            <option value="all">Tous les tags</option>
            <option value="reactivation">🔴 Réactivation</option>
            <option value="fidelite">🟢 Fidélité / VIP</option>
            <option value="panier">🟡 Panier</option>
            <option value="habitude">🔵 Habitude</option>
            <option value="test">🟣 A/B Test</option>
          </select>
          <button 
            onClick={() => handleOpenBuilder()}
            className="bg-pr hover:opacity-90 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center"
          >
            <FaPlus className="mr-2" /> Nouvelle Règle
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 space-y-4 pr-2">
        {isLoading && <div className="text-center text-gray-500 py-10"><FaSpinner className="animate-spin text-3xl mx-auto mb-2 text-pr" /> Chargement...</div>}
        
        {!isLoading && filteredRules.map((rule) => (
          <div key={rule._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-pr/50 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center flex-wrap gap-2">
                  {rule.name}
                  {rule.tags && rule.tags[0] && TAGS_MAP[rule.tags[0]] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${TAGS_MAP[rule.tags[0]].color}`}>
                      {TAGS_MAP[rule.tags[0]].label}
                    </span>
                  )}
                  {!rule.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">Inactif</span>}
                </h3>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleOpenBuilder(rule)} className="text-gray-400 hover:text-pr p-2 transition-colors"><FaEdit size={18} /></button>
                <button onClick={() => handleDeleteRule(rule._id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><FaTrash size={18} /></button>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm font-semibold bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                {getMethodIcon(rule.distributionMethod)}
              </div>
              <div className="text-sm text-gray-500">
                Poids (Priorité): <span className="font-bold text-gray-800">{rule.weight}</span>
              </div>
              <div className="text-sm text-gray-500">
                Offres configurées: <span className="font-bold text-gray-800">{rule.offers?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && filteredRules.length === 0 && rules.length > 0 && (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             Aucune règle ne correspond à ce filtre.
          </div>
        )}
        {!isLoading && rules.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
             Aucune règle définie pour cette campagne.
          </div>
        )}
      </div>

      {/* Visual Builder Modal */}
      {isBuilderOpen && (
        <VisualRuleBuilder 
          campaign={campaign} 
          initialRule={editingRule} 
          onClose={handleCloseBuilder} 
        />
      )}
    </div>
  );
}
