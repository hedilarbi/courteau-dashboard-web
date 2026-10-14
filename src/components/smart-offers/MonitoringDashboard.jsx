"use client";
import React, { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaPercentage, FaBullseye, FaTrophy, FaArrowDown, FaChevronDown, FaChevronRight, FaFolder, FaLayerGroup, FaGift } from "react-icons/fa";
import { getToken } from "@/actions";
import Spinner from "@/components/spinner/Spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DrillDownRow = ({ title, icon, metrics, children, defaultOpen = false, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const paddingLeft = level === 0 ? "pl-4" : level === 1 ? "pl-10" : "pl-16";
  const bgClass = level === 0 ? "bg-white hover:bg-gray-50 border-b border-gray-100" : level === 1 ? "bg-gray-50/50 hover:bg-gray-100 border-b border-gray-100" : "bg-gray-100/50 border-b border-gray-200";

  return (
    <>
      <div 
        onClick={() => children && setIsOpen(!isOpen)}
        className={`flex items-center justify-between py-4 pr-4 cursor-pointer transition-colors ${paddingLeft} ${bgClass}`}
      >
        <div className="flex items-center space-x-3 w-1/3">
          {children ? (
            isOpen ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />
          ) : <div className="w-3"></div>}
          {icon}
          <span className={`font-bold ${level === 0 ? "text-gray-800" : "text-gray-600"} truncate`}>{title}</span>
        </div>
        
        <div className="flex w-2/3 justify-between items-center text-sm">
          <div className="w-1/4 text-center text-gray-500 font-semibold">{metrics.totalSent}</div>
          <div className="w-1/4 text-center text-gray-500 font-semibold">{metrics.totalConverted}</div>
          <div className="w-1/4 text-center font-black text-pr">{metrics.conversionRate}%</div>
          <div className="w-1/4 text-right font-black text-green-600">${metrics.discountCost}</div>
        </div>
      </div>
      {isOpen && children && (
        <div className="border-l-2 border-pr/20 ml-6 my-1">
          {children}
        </div>
      )}
    </>
  );
};

export default function MonitoringDashboard({ campaignId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = campaignId 
        ? `${API_URL}/smart-offers-v2/analytics?campaignId=${campaignId}`
        : `${API_URL}/smart-offers-v2/analytics`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token?.value || token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Erreur analytics");
      
      setData(json);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId]);

  if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-10 bg-red-50 rounded-xl">Erreur: {error}</div>;
  if (!data) return null;

  const { kpis, funnel, algorithms, campaignBreakdown } = data;
  
  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  // Calculate funnel max to scale the bars
  const maxFunnelValue = funnel[0]?.value || 1;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* 1. KPIs Section */}
      <div>
        <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-pr" /> Vue Globale (Performances Réelles)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <FaDollarSign className="absolute -bottom-4 -right-4 text-8xl text-white opacity-20" />
            <p className="text-green-100 font-bold text-sm mb-1 uppercase tracking-wider">Revenu Généré (Est.)</p>
            <h3 className="text-3xl font-black">{formatMoney(kpis.totalRevenue)}</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <FaPercentage className="absolute -bottom-4 -right-4 text-8xl text-gray-100" />
            <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Taux de Conversion</p>
            <h3 className="text-3xl font-black text-gray-800">{kpis.globalConversionRate}%</h3>
            <p className="text-xs text-gray-400 mt-1">Des utilisateurs notifiés</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 text-8xl text-red-50 opacity-50">💰</div>
            <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Coût des Réductions</p>
            <h3 className="text-3xl font-black text-red-500">-{formatMoney(kpis.totalDiscountCost)}</h3>
            <p className="text-xs text-gray-400 mt-1">Investissement Marketing</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <FaBullseye className="absolute -bottom-4 -right-4 text-8xl text-white opacity-10" />
            <p className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">R.O.I.</p>
            <h3 className="text-3xl font-black text-yellow-400">x{kpis.roi}</h3>
            <p className="text-xs text-gray-400 mt-1">Retour sur Investissement</p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Funnel Visual */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center">
            Entonnoir de Conversion
          </h2>
          
          <div className="space-y-6">
            {funnel.map((step, idx) => {
              const percentage = maxFunnelValue > 0 ? (step.value / maxFunnelValue) * 100 : 0;
              const dropoff = idx > 0 && funnel[idx - 1].value > 0 
                ? (((funnel[idx - 1].value - step.value) / funnel[idx - 1].value) * 100).toFixed(1)
                : null;

              return (
                <div key={step.name} className="relative">
                  {idx > 0 && dropoff !== null && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center text-xs font-bold text-red-400 bg-red-50 px-2 rounded-full z-10">
                      <FaArrowDown className="mr-1 text-[10px]" /> {dropoff}% Perte
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-700">{step.name}</span>
                    <span className="font-black text-pr">{step.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        idx === 0 ? 'bg-gray-300' :
                        idx === funnel.length - 1 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        'bg-gradient-to-r from-pr/50 to-pr'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Algorithm Battle */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" /> Comparatif des Algorithmes
          </h2>

          {algorithms.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Pas de données d'algorithmes.
            </div>
          ) : (
            <div className="space-y-4">
              {algorithms.map((algo, idx) => (
                <div key={algo.method} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between relative overflow-hidden">
                  {idx === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>}
                  {idx === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>}
                  {idx === 2 && <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>}
                  
                  <div>
                    <h4 className="font-black text-gray-800 text-md">{algo.method}</h4>
                    <p className="text-xs text-gray-500 font-semibold">{algo.totalConverted} convertis sur {algo.totalSent} ciblés</p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xl font-black ${idx === 0 ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {algo.conversionRate}%
                    </span>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Taux Conv.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Drill-Down Table (Campaign > Rule > Offer) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-black text-gray-800 flex items-center">
            <FaLayerGroup className="mr-2 text-pr" /> Analyse Granulaire (Drill-down)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Dépliez les campagnes pour voir les performances exactes de chaque règle et chaque offre.</p>
        </div>
        
        {/* Table Header */}
        <div className="flex items-center justify-between py-3 pr-4 pl-4 bg-gray-100 border-b border-gray-200 text-xs uppercase font-black text-gray-400 tracking-wider">
          <div className="w-1/3">Hiérarchie</div>
          <div className="flex w-2/3 justify-between">
            <div className="w-1/4 text-center">Générées</div>
            <div className="w-1/4 text-center">Converties</div>
            <div className="w-1/4 text-center">Taux Conv.</div>
            <div className="w-1/4 text-right">Coût Réduc.</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {!campaignBreakdown || campaignBreakdown.length === 0 ? (
            <div className="p-10 text-center text-gray-400">Aucune donnée granulaire disponible.</div>
          ) : (
            campaignBreakdown.map(campaign => (
              <DrillDownRow 
                key={campaign.id} 
                title={campaign.name} 
                icon={<FaFolder className="text-blue-400" />}
                metrics={campaign}
                level={0}
              >
                {campaign.rules.map(rule => (
                  <DrillDownRow 
                    key={rule.id} 
                    title={rule.name} 
                    icon={<FaLayerGroup className="text-purple-400" />}
                    metrics={rule}
                    level={1}
                  >
                    {rule.offers.map(offer => (
                      <DrillDownRow 
                        key={offer.id} 
                        title={offer.name} 
                        icon={<FaGift className="text-pink-400" />}
                        metrics={offer}
                        level={2}
                      />
                    ))}
                  </DrillDownRow>
                ))}
              </DrillDownRow>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
