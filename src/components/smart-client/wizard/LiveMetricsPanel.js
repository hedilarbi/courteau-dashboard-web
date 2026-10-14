"use client";

import React from "react";
import { useWizard } from "./WizardContext";

export default function LiveMetricsPanel() {
  const { state } = useWizard();

  // Helper to generate the dynamic sentence
  const generateSummarySentence = () => {
    if (!state.track) {
      return "Sélectionnez un objectif à l'étape 1 pour commencer.";
    }

    const statesStr = state.selectedStates && state.selectedStates.length > 0 
      ? state.selectedStates.join(" OU ") 
      : "Aucun état sélectionné";

    let mechanicDesc = "une offre spéciale";
    if (state.offer?.mechanic === "rescue") {
      mechanicDesc = `un sauvetage d'article (${state.offer.value || 2} $ de rabais)`;
    } else if (state.offer?.mechanic === "free_delivery") {
      mechanicDesc = "la livraison offerte (0 $)";
    } else if (state.offer?.mechanic === "free_item") {
      mechanicDesc = "un article offert";
    } else if (state.offer?.mechanic === "discount_percent") {
      mechanicDesc = `une remise de ${state.offer.value || 15} %`;
    } else if (state.offer?.mechanic === "cashback") {
      mechanicDesc = "5 $ crédités pour la prochaine commande";
    }

    const locationLabel = 
      state.location === "checkout" ? "la feuille de checkout" :
      state.location === "cart_banner" ? "le bandeau panier" :
      state.location === "product" ? "la fiche produit" : "l'écran sélectionné";

    const triggerPct = state.safeguards?.triggerRate ?? 50;
    const maxWeek = state.safeguards?.maxPerWeek ?? 2;
    const timerStr = state.showTimer ? "avec chrono 15 min" : "sans chrono";

    const extraConditions = [];
    if (state.conditions?.cart?.minTotal > 0) extraConditions.push(`panier ≥ ${state.conditions.cart.minTotal} $`);
    if (state.conditions?.cart?.itemRemovedAfterTotal) extraConditions.push(`article retiré post-total`);
    if (state.conditions?.behavior?.inactivitySeconds > 0) extraConditions.push(`inactivité ≥ ${state.conditions.behavior.inactivitySeconds} s`);
    if (state.conditions?.context?.timeSlot && state.conditions.context.timeSlot !== "all") extraConditions.push(`créneau horaire ciblé`);
    const extraStr = extraConditions.length > 0 ? ` et conditions [${extraConditions.join(", ")}]` : "";

    return `Quand un client passe à l'état [${statesStr}]${extraStr}, lui proposer ${mechanicDesc} sur ${locationLabel}, déclenché à ${triggerPct} % des cas (${timerStr}), plafonné à max ${maxWeek} fois/semaine.`;
  };

  // Base mobile traffic: ~3,500 active ordering sessions/week
  const BASE_WEEKLY_SESSIONS = 3500;

  // Calcul déterministe de la proportion d'audience ciblée
  const calculateAudience = () => {
    if (!state.selectedStates || state.selectedStates.length === 0) return 0;

    // Poids théorique estimé par état d'intention
    let ratio = 0;
    if (state.selectedStates.includes("Sensible au prix")) ratio += 0.084;
    if (state.selectedStates.includes("Indécis")) ratio += 0.112;
    if (state.selectedStates.includes("Sur le départ")) ratio += 0.065;
    if (state.selectedStates.includes("Frustré")) ratio += 0.042;
    if (state.selectedStates.includes("Décidé")) ratio += 0.180;

    // Déduction des chevauchements (OU logique)
    if (state.selectedStates.length > 1) {
      ratio = ratio * 0.82;
    }

    // Filtre profil client additionnel
    if (state.hasProfileFilter) {
      ratio = ratio * 0.55;
    }

    // Taux de déclenchement (anti-dressage)
    const triggerRatio = (state.safeguards?.triggerRate ?? 50) / 100;

    // Exclusion du groupe témoin A/B
    const activeGroupRatio = 1 - ((state.safeguards?.controlGroupPct ?? 10) / 100);

    const projectedSessions = Math.round(BASE_WEEKLY_SESSIONS * ratio * triggerRatio * activeGroupRatio);
    return Math.max(0, projectedSessions);
  };

  // Calcul du coût projeté
  const calculateCost = (audience) => {
    if (audience === 0) return { weekly: 0, daily: 0 };

    // Taux de conversion estimé sur l'offre affichée (~18%)
    const conversionRate = 0.18;
    const estimatedConversions = audience * conversionRate;

    // Valeur unitaire de l'avantage
    let unitCost = 2.0;
    if (state.offer?.mechanic === "rescue") unitCost = state.offer.value || 2.0;
    else if (state.offer?.mechanic === "free_delivery") unitCost = 3.50;
    else if (state.offer?.mechanic === "free_item") unitCost = 4.25;
    else if (state.offer?.mechanic === "discount_percent") unitCost = 3.60;
    else if (state.offer?.mechanic === "cashback") unitCost = 5.00;

    const rawWeeklyCost = Math.round(estimatedConversions * unitCost);
    const rawDailyCost = Math.round(rawWeeklyCost / 7);

    // Prise en compte des plafonds configurés
    let daily = rawDailyCost;
    if (state.safeguards?.maxBudgetDaily && state.safeguards.maxBudgetDaily > 0) {
      daily = Math.min(daily, state.safeguards.maxBudgetDaily);
    }

    let weekly = daily * 7;
    if (state.safeguards?.maxBudgetTotal && state.safeguards.maxBudgetTotal > 0) {
      weekly = Math.min(weekly, state.safeguards.maxBudgetTotal);
    }

    return { weekly, daily, capped: (state.safeguards?.maxBudgetDaily && rawDailyCost > state.safeguards.maxBudgetDaily) };
  };

  const estimatedAudience = calculateAudience();
  const { weekly: estimatedCost, daily: dailyCost, capped } = calculateCost(estimatedAudience);

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-5 bg-gray-900 text-white shadow-sm border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-pr bg-pr/20 px-2 py-0.5 rounded">
            Panneau Vivant
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <h3 className="font-bold text-sm text-gray-100 mb-1">Règle synthétisée en direct</h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {generateSummarySentence()}
        </p>
      </div>

      <div className="p-5 space-y-4">
        
        {/* Fréquence observée */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fréquence observée</div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              Logging requis
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <span>📊</span> Non encore mesuré
          </div>
          <div className="mt-1 text-[11px] text-gray-400 leading-normal">
            Nécessite 2 à 3 semaines de logging à blanc pour afficher la fréquence réelle mesurée sans fausser le dimensionnement.
          </div>
        </div>

        {/* KPI 1 : Audience estimée */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Audience ciblée</div>
            <div className="text-[11px] text-gray-400">Trafic Le Courteau</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {estimatedAudience.toLocaleString()} <span className="text-xs font-normal text-gray-500">sessions/sem</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Après taux de déclenchement ({state.safeguards?.triggerRate ?? 50}%) et groupe témoin ({state.safeguards?.controlGroupPct ?? 10}%).
          </div>
          {estimatedAudience > 0 && estimatedAudience < 50 && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
              <span>⚠️</span> 
              <span><strong>Audience très restreinte :</strong> Moins de 50 sessions/semaine. La règle risque de ne presque jamais être vue.</span>
            </div>
          )}
        </div>

        {/* KPI 2 : Coût projeté */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Coût projeté</div>
            <div className="text-[11px] text-gray-400">~{dailyCost} $/jour</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {estimatedCost} $ <span className="text-xs font-normal text-gray-500">/semaine</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-400">
            Estimation basée sur ~18 % d'acceptation par les clients ciblés.
          </div>
          {capped && (
            <div className="mt-2 text-xs text-pr bg-pr/10 p-2 rounded-lg border border-pr/20 flex items-start gap-1.5 font-medium">
              <span>🛡️</span> Plafond quotidien de {state.safeguards.maxBudgetDaily} $ actif : limitation automatique dès atteinte du quota.
            </div>
          )}
        </div>

        {/* Conflits et priorités */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Conflits d'emplacement</div>
          {state.location === "checkout" ? (
             <div className="text-xs space-y-2">
               <div className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                 <div className="font-bold flex items-center gap-1">
                   <span>⚠️</span> 2 autres règles ciblent le Checkout :
                 </div>
                 <ul className="list-disc ml-4 mt-1 text-[11px] text-gray-700 space-y-0.5">
                   <li>Sauvetage Panier (Priorité 90)</li>
                   <li>Promo Boisson (Priorité 60)</li>
                 </ul>
               </div>
               <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                 Votre priorité : <strong className="text-pr font-bold">{state.safeguards?.priority ?? 90}</strong>
                 {(state.safeguards?.priority ?? 90) >= 90 ? (
                   <span className="block text-emerald-700 font-medium mt-0.5">⚡ Prioritaire sur les offres concurrentes.</span>
                 ) : (
                   <span className="block text-gray-500 mt-0.5">S'exécutera après les règles prioritaires.</span>
                 )}
               </div>
             </div>
          ) : (
            <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-medium">
               <span>✅</span> Aucun conflit détecté sur cet emplacement.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
