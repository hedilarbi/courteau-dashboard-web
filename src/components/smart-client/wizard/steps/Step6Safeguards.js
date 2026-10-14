"use client";

import React from "react";
import { useWizard } from "../WizardContext";

export default function Step6Safeguards() {
  const { state, dispatch } = useWizard();

  const handleSafeguardChange = (field, value) => {
    dispatch({ type: "UPDATE_NESTED_FIELD", payload: { root: "safeguards", field, val: value } });
  };

  const handleNext = () => dispatch({ type: "SET_STEP", payload: 7 });
  const handleBack = () => dispatch({ type: "SET_STEP", payload: 5 });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Garde-fous et Sécurité</h2>
        <p className="text-gray-500 mt-2">
          Ces valeurs ont été pré-remplies de manière sécurisée en fonction de la piste <strong>{state.track}</strong>.
        </p>
      </div>

      {/* Bloquants automatiques (Lecture seule) */}
      <div className="bg-red-50 p-6 border border-red-100 rounded-xl">
        <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
          <span>🛡️</span> Bloquants automatiques stricts (Niveau Système)
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked disabled className="rounded text-red-600 bg-red-100 border-red-300 cursor-not-allowed" />
            <span className="text-sm text-red-800 opacity-90">Session "Décidé" (pas de rabais si le client va acheter de toute façon).</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked disabled className="rounded text-red-600 bg-red-100 border-red-300 cursor-not-allowed" />
            <span className="text-sm text-red-800 opacity-90">Panier déjà supérieur à l'habitude × 1,3.</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked disabled className="rounded text-red-600 bg-red-100 border-red-300 cursor-not-allowed" />
            <span className="text-sm text-red-800 opacity-90">L'offre a été refusée dans les dernières 24 h.</span>
          </label>
        </div>
        <p className="text-xs text-red-600 mt-4 italic">
          Décochables uniquement par un administrateur système.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fréquence & Plafonds anti-fatigue */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <span>⏱️</span> Fréquence & Plafond anti-fatigue
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Max / session</label>
              <input 
                type="number" 
                min="1"
                value={state.safeguards.maxPerSession ?? 1} 
                onChange={(e) => handleSafeguardChange("maxPerSession", parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Max / jour</label>
              <input 
                type="number" 
                min="1"
                value={state.safeguards.maxPerDay ?? 2} 
                onChange={(e) => handleSafeguardChange("maxPerDay", parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pr mb-1">Max / semaine ⭐</label>
              <input 
                type="number" 
                min="1"
                value={state.safeguards.maxPerWeek ?? 2} 
                onChange={(e) => handleSafeguardChange("maxPerWeek", parseInt(e.target.value) || 1)}
                className="w-full border-2 border-pr/40 bg-pr/5 text-pr font-bold rounded-lg px-3 py-2 text-sm focus:bg-white" 
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Le <strong>maximum par semaine</strong> (défaut 2 en Persuasion) est le vrai plafond anti-fatigue pour éviter la saturation du client.
          </p>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Délai après refus (heures)</label>
            <input 
              type="number" 
              min="1"
              value={state.safeguards.delayAfterRefusal ?? 24} 
              onChange={(e) => handleSafeguardChange("delayAfterRefusal", parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white" 
            />
            <p className="text-xs text-gray-400 mt-1">Durée minimale avant de reproposer une offre après un refus explicite.</p>
          </div>

          <div className="pt-2 border-t">
            <label className="block text-xs font-bold text-gray-700 mb-1">Rabais maximum en % du panier</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1" 
                max="50"
                value={state.safeguards.maxDiscountPct ?? 15} 
                onChange={(e) => handleSafeguardChange("maxDiscountPct", parseInt(e.target.value) || 15)}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white font-bold" 
              />
              <span className="text-sm font-semibold text-gray-600">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Plafonne la remise même si la mécanique ou un cumul dépassait ce pourcentage (défaut 15 %).</p>
          </div>
        </div>

        {/* Budgets & Dates */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <span>💰</span> Budgets et Dates d'activité
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Budget max par jour ($)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  placeholder="Illimité"
                  value={state.safeguards.maxBudgetDaily || ""} 
                  onChange={(e) => handleSafeguardChange("maxBudgetDaily", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm bg-gray-50 focus:bg-white" 
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">$</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Arrête la règle dès que le coût dépasse ce montant le même jour.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Budget max total ($)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  placeholder="Illimité"
                  value={state.safeguards.maxBudgetTotal || ""} 
                  onChange={(e) => handleSafeguardChange("maxBudgetTotal", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm bg-gray-50 focus:bg-white" 
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">$</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Désactive la règle une fois l'enveloppe globale épuisée.</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <h5 className="text-xs font-bold text-gray-700 mb-2">Période d'activité (Optionnelle)</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Date de début</label>
                <input 
                  type="date" 
                  value={state.safeguards.startDate || ""} 
                  onChange={(e) => handleSafeguardChange("startDate", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 focus:bg-white" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Date de fin</label>
                <input 
                  type="date" 
                  value={state.safeguards.endDate || ""} 
                  onChange={(e) => handleSafeguardChange("endDate", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-gray-50 focus:bg-white" 
                />
              </div>
            </div>
          </div>

          {/* Mesure & Déclenchement */}
          <div className="pt-2 border-t space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-700">Groupe témoin (A/B Test)</label>
                <span className="text-xs font-bold text-pr">{state.safeguards.controlGroupPct}%</span>
              </div>
              <input 
                type="range" 
                min="5" max="50" step="1"
                value={state.safeguards.controlGroupPct ?? 10} 
                onChange={(e) => handleSafeguardChange("controlGroupPct", parseInt(e.target.value))}
                className="w-full accent-pr cursor-pointer" 
              />
              <p className="text-[11px] text-gray-400">Pourcentage de sessions éligibles qui ne reçoivent volontairement rien (minimum 5 % garanti pour mesurer l'incrément net).</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Taux de déclenchement : {state.safeguards.triggerRate}% {state.track === "Persuasion" && "(Défaut 50 % anti-dressage)"}
              </label>
              <input 
                type="number" 
                min="1" 
                max="100"
                value={state.safeguards.triggerRate ?? 50} 
                onChange={(e) => handleSafeguardChange("triggerRate", parseInt(e.target.value) || 50)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white font-medium" 
              />
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                🛡️ <strong>Garde-fou anti-dressage :</strong> Pré-rempli à 50 % en Persuasion. À 100 %, les clients apprennent en quelques semaines qu'hésiter ou retirer un plat fait apparaître un rabais.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priorité d'exécution (1-100)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={state.safeguards.priority ?? 90} 
                onChange={(e) => handleSafeguardChange("priority", parseInt(e.target.value) || 50)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bold text-pr bg-pr/5 border-pr/30 text-sm" 
              />
              <p className="text-[11px] text-gray-400 mt-1">Détermine quelle règle s'applique en premier si un panier remplit plusieurs conditions.</p>
            </div>
          </div>

        </div>

      </div>

      <div className="flex justify-between pt-4">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
          ← Retour
        </button>
        <button onClick={handleNext} className="bg-pr hover:bg-pr/90 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm">
          Suivant : Revue et Publication →
        </button>
      </div>
    </div>
  );
}
