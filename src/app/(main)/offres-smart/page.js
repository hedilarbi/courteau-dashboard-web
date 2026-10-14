"use client";
import React, { useState } from "react";
import CampaignsManager from "@/components/smart-offers/CampaignsManager";
import HediRoyaltiesModal from "@/components/smart-offers/HediRoyaltiesModal";
import SmartOffersBI from "@/components/smart-offers/SmartOffersBI";
import OffersHistory from "@/components/smart-offers/OffersHistory";
import { FaBullhorn, FaHistory, FaChartLine, FaPlay, FaCrown, FaPowerOff, FaToggleOn, FaToggleOff } from "react-icons/fa";
import * as PersonalizedOffersServices from "@/services/PersonalizedOffersServices";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SmartOffersV2Page() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isRoyaltiesModalOpen, setIsRoyaltiesModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  // Système smart offers (profilage + création d'offres). Arrêté : plus de scan ni de nouvelle
  // offre ; les offres déjà créées continuent (activation, rappels, cashback, rabais divisé…).
  const [isSystemActive, setIsSystemActive] = useState(null);
  const [isTogglingSystem, setIsTogglingSystem] = useState(false);

  useEffect(() => {
    PersonalizedOffersServices.getCronStatus().then((res) => {
      if (res.status) setIsSystemActive(Boolean(res.isEnabled));
    });
  }, []);

  const handleToggleSystem = async () => {
    if (isSystemActive === null || isTogglingSystem) return;
    const next = !isSystemActive;
    const confirmed = window.confirm(
      next
        ? "Relancer le système smart offers ?\n\nLe profilage et la création de nouvelles offres reprennent (scan de nuit, après commande, scan manuel)."
        : "Arrêter le système smart offers ?\n\n• Plus de profilage ni de nouvelle offre (scan de nuit, après commande, scan manuel).\n• Les offres déjà créées continuent normalement : activation à leur heure, rappels, cashback, rabais divisé."
    );
    if (!confirmed) return;
    setIsTogglingSystem(true);
    try {
      const res = await PersonalizedOffersServices.toggleCron(next);
      if (res.status) {
        setIsSystemActive(Boolean(res.isEnabled));
      } else {
        alert(`Erreur lors du changement de statut : ${res.message || ""}`);
      }
    } finally {
      setIsTogglingSystem(false);
    }
  };

  const handleManualScan = async () => {
    setIsScanning(true);
    try {
      const res = await PersonalizedOffersServices.triggerScan();
      if (res.status) {
        alert("Scan manuel terminé avec succès !");
      } else {
        alert(`Erreur lors du scan: ${res.message}`);
      }
    } catch (err) {
      alert("Erreur serveur lors du scan manuel.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full h-full p-6 pb-0 flex flex-col text-gray-800 font-sans">
      {/* Header Section Compact */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center">
          <FaBullhorn className="text-3xl text-pr mr-3" />
          <h1 className="text-3xl font-black text-pr">
            Smart Offers
          </h1>
        </div>
        
        {/* Global Controls */}
        <div className="flex space-x-3">
          <button 
            onClick={handleManualScan}
            disabled={isScanning}
            className="bg-pr/10 hover:bg-pr/20 text-pr px-4 py-2 rounded-lg font-bold flex items-center transition-colors disabled:opacity-50"
          >
            <FaPlay className={`mr-2 ${isScanning ? 'animate-pulse' : ''}`} /> {isScanning ? "Scan en cours..." : "Scan Manuel"}
          </button>
          
          <button 
            onClick={() => setIsRoyaltiesModalOpen(true)}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg font-bold flex items-center transition-colors"
          >
            <FaCrown className="mr-2" /> Royautés Hedi
          </button>
          
          <button
            onClick={handleToggleSystem}
            disabled={isSystemActive === null || isTogglingSystem}
            title={
              isSystemActive
                ? "Profilage et création d'offres en marche. Cliquer pour arrêter."
                : "Profilage et création d'offres arrêtés (les offres en cours continuent). Cliquer pour relancer."
            }
            className={`px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-sm disabled:opacity-50 ${
              isSystemActive
                ? "bg-green-100 hover:bg-green-200 text-green-600"
                : "bg-red-100 hover:bg-red-200 text-red-600"
            }`}
          >
            {isSystemActive ? <FaToggleOn className="mr-2 text-xl" /> : <FaToggleOff className="mr-2 text-xl" />}
            {isSystemActive === null
              ? "Smart offers…"
              : isSystemActive
                ? "Smart offers : actives"
                : "Smart offers : arrêtées"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-gray-200 pb-1 shrink-0">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center px-6 py-2 rounded-t-lg font-bold transition-all duration-300 ${
            activeTab === "campaigns"
              ? "bg-white text-pr border-b-2 border-pr shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaBullhorn className="mr-2" />
          Campagnes & Règles
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center px-6 py-2 rounded-t-lg font-bold transition-all duration-300 ${
            activeTab === "history"
              ? "bg-white text-pr border-b-2 border-pr shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaHistory className="mr-2" />
          Historique d&apos;Envoi
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center px-6 py-2 rounded-t-lg font-bold transition-all duration-300 ${
            activeTab === "stats"
              ? "bg-white text-pr border-b-2 border-pr shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaChartLine className="mr-2" />
          Monitoring BI & ROI
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white border-t border-l border-r border-gray-200 rounded-t-xl p-4 shadow-sm flex-1 overflow-hidden">
        {activeTab === "campaigns" && <CampaignsManager />}
        {activeTab === "history" && (
          <div className="h-full overflow-hidden">
            <OffersHistory />
          </div>
        )}
        {activeTab === "stats" && (
          <div className="h-full overflow-y-auto">
            <SmartOffersBI />
          </div>
        )}
      </div>

      {isRoyaltiesModalOpen && (
        <HediRoyaltiesModal onClose={() => setIsRoyaltiesModalOpen(false)} />
      )}
    </div>
  );
}
