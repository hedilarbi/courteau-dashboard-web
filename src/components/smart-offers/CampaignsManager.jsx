"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaFolderOpen, FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";
import DynamicRuleList from "./DynamicRuleList";
import { getToken } from "@/actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({ name: "", priority: 50, defaultCooldownDays: 7 });

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/campaigns`, {
        headers: { Authorization: `Bearer ${token?.value}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
        if (!selectedCampaign && data.length > 0) {
          setSelectedCampaign(data[0]);
        }
      } else {
        console.error("Erreur lors de la récupération des campagnes");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaignData.name.trim()) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/campaigns`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.value}`
        },
        body: JSON.stringify({ ...newCampaignData, isActive: false })
      });
      if (res.ok) {
        await fetchCampaigns();
        setIsCreating(false);
        setNewCampaignData({ name: "", priority: 50, defaultCooldownDays: 7 });
      }
    } catch (err) {
      console.error("Erreur lors de la création:", err);
    }
  };

  const handleToggleActive = async (camp) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/campaigns/${camp._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.value}`
        },
        body: JSON.stringify({ isActive: !camp.isActive })
      });
      if (res.ok) {
        await fetchCampaigns();
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
    }
  };

  const handleDelete = async (e, campId) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette campagne et toutes ses règles ?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/smart-offers-v2/campaigns/${campId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token?.value}` }
      });
      if (res.ok) {
        if (selectedCampaign?._id === campId) setSelectedCampaign(null);
        await fetchCampaigns();
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Sidebar: List of Campaigns */}
      <div className="w-1/3 border-r border-gray-200 pr-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaFolderOpen className="mr-3 text-pr" /> Campagnes
          </h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-pr hover:opacity-90 text-white p-2 rounded-lg transition-all shadow-md"
          >
            <FaPlus />
          </button>
        </div>

        {isCreating && (
          <div className="bg-gray-50 p-4 rounded-xl border border-pr/50 mb-4 shadow-sm shrink-0">
            <input 
              type="text" 
              placeholder="Nom de la campagne" 
              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 mb-2 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
              value={newCampaignData.name}
              onChange={(e) => setNewCampaignData({...newCampaignData, name: e.target.value})}
              autoFocus
            />
            <div className="flex justify-between items-center">
              <input 
                type="number" 
                placeholder="Priorité (ex: 50)" 
                className="w-1/2 bg-white border border-gray-300 rounded p-2 text-gray-800 mr-2 focus:border-pr outline-none"
                value={newCampaignData.priority}
                onChange={(e) => setNewCampaignData({...newCampaignData, priority: Number(e.target.value)})}
              />
              <button 
                onClick={handleCreateCampaign}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-bold text-sm shadow-sm"
              >
                Créer
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {isLoading && <div className="text-center text-gray-500 py-10"><FaSpinner className="animate-spin text-3xl mx-auto mb-2 text-pr" /> Chargement...</div>}
          {!isLoading && campaigns.map((camp) => (
            <div
              key={camp._id}
              onClick={() => setSelectedCampaign(camp)}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                selectedCampaign?._id === camp._id
                  ? "bg-pr/10 border-pr shadow-sm"
                  : "bg-white border-gray-200 hover:border-pr/50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{camp.name}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleActive(camp); }}
                  className={`text-2xl transition-colors ${camp.isActive ? "text-green-500 hover:text-green-600" : "text-gray-400 hover:text-gray-500"}`}
                  title={camp.isActive ? "Désactiver" : "Activer"}
                >
                  {camp.isActive ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-between">
                <span>Priorité: {camp.priority}</span>
                <div className="flex space-x-2">
                  <button onClick={(e) => handleDelete(e, camp._id)} className="text-gray-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && campaigns.length === 0 && !isCreating && (
             <div className="text-center text-gray-500 py-10">Aucune campagne. Cliquez sur + pour en créer une.</div>
          )}
        </div>
      </div>

      {/* Main Area: Rules for the selected Campaign */}
      <div className="w-2/3 pl-2 h-full flex flex-col overflow-hidden">
        {selectedCampaign ? (
          <DynamicRuleList campaign={selectedCampaign} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FaFolderOpen className="text-6xl mb-4 opacity-30" />
            <p className="text-xl">Sélectionnez une campagne pour voir ses règles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
