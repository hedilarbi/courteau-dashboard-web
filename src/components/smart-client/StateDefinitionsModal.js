"use client";

import React, { useState, useEffect } from "react";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";
import { FaTimes, FaUndo, FaSave, FaCheck, FaExclamationCircle } from "react-icons/fa";

export default function StateDefinitionsModal({ isOpen, onClose, initialSelectedState = "Indécis", onSaved }) {
  const [definitions, setDefinitions] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState(initialSelectedState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Load definitions from API
  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SMART_CLIENT_API_URL}/smart-client/states/definitions`, { headers: await getSmartClientAuthHeaders() });
      const json = await res.json();
      if (json.success && json.data) {
        setDefinitions(json.data);
      }
    } catch (e) {
      console.error("Error loading state definitions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDefinitions();
      if (initialSelectedState) {
        setSelectedStateId(initialSelectedState);
      }
    }
  }, [isOpen, initialSelectedState]);

  if (!isOpen) return null;

  const currentState = definitions.find((d) => d.stateId === selectedStateId) || definitions[0] || null;

  const handleCriteriaChange = (field, value) => {
    setDefinitions((prev) =>
      prev.map((item) => {
        if (item.stateId === selectedStateId) {
          const updatedCriteria = {
            ...item.criteria,
            [field]: value,
          };
          return {
            ...item,
            criteria: updatedCriteria,
          };
        }
        return item;
      })
    );
  };

  const handleDefinitionChange = (field, value) => {
    setDefinitions((prev) => prev.map((item) => item.stateId === selectedStateId ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!currentState) return;
    try {
      setSaving(true);
      const res = await fetch(`${SMART_CLIENT_API_URL}/smart-client/states/definitions`, {
        method: "PUT",
        headers: await getSmartClientAuthHeaders(true),
        body: JSON.stringify({
          stateId: currentState.stateId,
          criteria: currentState.criteria,
          naturalLanguageRule: currentState.naturalLanguageRule,
          questionLabel: currentState.questionLabel,
          priority: currentState.priority,
          enabled: currentState.enabled,
          minimumDurationSeconds: currentState.minimumDurationSeconds,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Définition enregistrée avec succès !" });
        if (onSaved) onSaved(json.data);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: json.message || "Erreur de sauvegarde." });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Erreur de connexion au serveur." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Voulez-vous réinitialiser toutes les définitions d'état aux valeurs d'usine recommandées ?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${SMART_CLIENT_API_URL}/smart-client/states/definitions/reset`, {
        method: "POST",
        headers: await getSmartClientAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDefinitions(json.data);
        setMessage({ type: "success", text: "Valeurs d'usine restaurées !" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🧠</span> Définition & Critères des États Comportementaux
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Définissez précisément les seuils pour qualifier un client (« Qu'est-ce qu'un client hésitant ? »)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content Body: Left sidebar (States) + Right Form */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar States */}
          <div className="w-1/3 min-w-[240px] bg-gray-50 border-r border-gray-200 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
              États disponibles ({definitions.length})
            </div>
            {definitions.map((def) => {
              const isSelected = def.stateId === selectedStateId;
              return (
                <button
                  key={def.stateId}
                  onClick={() => setSelectedStateId(def.stateId)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-white border-pr text-pr font-bold shadow-sm ring-1 ring-pr"
                      : "bg-transparent border-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{def.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{def.label}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">{def.questionLabel}</div>
                    </div>
                  </div>
                  {isSelected && <span className="text-pr font-bold text-sm">→</span>}
                </button>
              );
            })}
          </div>

          {/* Configuration Form */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                Chargement des critères...
              </div>
            ) : currentState ? (
              <div className="space-y-6">
                {/* Header of selected state */}
                <div className="p-4 bg-pr/5 border border-pr/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currentState.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{currentState.label}</h3>
                      <p className="text-sm text-pr font-semibold">{currentState.questionLabel}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {currentState.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-3">
                  <label className="text-sm font-bold text-gray-700">État actif
                    <select value={String(currentState.enabled !== false)} onChange={(e) => handleDefinitionChange("enabled", e.target.value === "true")} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"><option value="true">Oui</option><option value="false">Non</option></select>
                  </label>
                  <label className="text-sm font-bold text-gray-700">Priorité
                    <input type="number" min="0" max="1000" value={currentState.priority ?? 50} onChange={(e) => handleDefinitionChange("priority", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" />
                  </label>
                  <label className="text-sm font-bold text-gray-700">Durée minimale (s)
                    <input type="number" min="0" value={currentState.minimumDurationSeconds ?? 0} onChange={(e) => handleDefinitionChange("minimumDurationSeconds", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" />
                  </label>
                </div>

                {/* Critères spécifiques par État */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <span>⚙️</span> Seuils & Règles de Détection en direct
                  </h4>

                  {/* CAS 1 : Indécis / Hésitant */}
                  {currentState.stateId === "Indécis" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Temps passé sans action sur un plat avant hésitation
                          </label>
                          <span className="text-xs font-bold text-pr">
                            {currentState.criteria?.inactivitySeconds || 45} secondes
                          </span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="120"
                          step="5"
                          value={currentState.criteria?.inactivitySeconds || 45}
                          onChange={(e) => handleCriteriaChange("inactivitySeconds", parseInt(e.target.value))}
                          className="w-full accent-pr cursor-pointer"
                        />
                        <p className="text-[11px] text-gray-400">
                          Recommandé : 45 s. Si le client regarde un plat sans l'ajouter, le moteur le qualifie d'hésitant.
                        </p>
                      </div>

                      <div className="pt-2 border-t">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nombre de va-et-vient entre plats ou catégories
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={currentState.criteria?.oscillationsCount || 3}
                            onChange={(e) => handleCriteriaChange("oscillationsCount", parseInt(e.target.value) || 1)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">consultations aller-retour successives</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 border-t pt-3 md:grid-cols-2">
                        <label className="text-xs font-bold text-gray-700">
                          Articles différents consultés
                          <input type="number" min="2" max="20" value={currentState.criteria?.distinctProductsViewedCount ?? 3} onChange={(e) => handleCriteriaChange("distinctProductsViewedCount", Number(e.target.value) || 2)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-bold text-gray-700">
                          Changements entre articles
                          <input type="number" min="1" max="30" value={currentState.criteria?.productSwitchesCount ?? 3} onChange={(e) => handleCriteriaChange("productSwitchesCount", Number(e.target.value) || 1)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-bold text-gray-700">
                          Retours sur un article déjà vu
                          <input type="number" min="1" max="20" value={currentState.criteria?.productRevisitsCount ?? 1} onChange={(e) => handleCriteriaChange("productRevisitsCount", Number(e.target.value) || 1)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-bold text-gray-700">
                          Fenêtre d’analyse (secondes)
                          <input type="number" min="30" max="600" step="30" value={currentState.criteria?.productViewWindowSeconds ?? 120} onChange={(e) => handleCriteriaChange("productViewWindowSeconds", Number(e.target.value) || 120)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                      </div>
                      <p className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-700">
                        Exemple : Pizza A → Pizza B → Pizza A produit 2 articles distincts, 2 changements et 1 retour.
                      </p>

                      <div className="pt-2 border-t">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Changements successifs d'ingrédients / personnalisations
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={currentState.criteria?.optionsChangesCount || 3}
                            onChange={(e) => handleCriteriaChange("optionsChangesCount", parseInt(e.target.value) || 1)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">modifications d'options sans validation</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAS 2 : Sensible au prix */}
                  {currentState.stateId === "Sensible au prix" && (
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(currentState.criteria?.itemRemovedAfterTotal)}
                          onChange={(e) => handleCriteriaChange("itemRemovedAfterTotal", e.target.checked)}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Retrait d'un article après consultation du montant total
                          </div>
                          <div className="text-xs text-gray-500">
                            Signal fort de sensibilité au prix : le client trouve le total trop cher et retire un plat.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(currentState.criteria?.sizeDowngraded)}
                          onChange={(e) => handleCriteriaChange("sizeDowngraded", e.target.checked)}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Rétrogradation de format (ex : Grand vers Régulier)
                          </div>
                          <div className="text-xs text-gray-500">
                            Le client choisit une portion plus petite pour réduire la facture.
                          </div>
                        </div>
                      </label>

                      <div className="pt-2 border-t">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Visites répétées de la section Rabais / Offres
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={currentState.criteria?.promosConsultationsCount || 2}
                            onChange={(e) => handleCriteriaChange("promosConsultationsCount", parseInt(e.target.value) || 1)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">consultations sans ajout</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Baisse du montant du panier par rapport au panier habituel
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="5"
                            max="50"
                            value={currentState.criteria?.cartBelowHabitPct || 20}
                            onChange={(e) => handleCriteriaChange("cartBelowHabitPct", parseInt(e.target.value) || 10)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">% de baisse constatée</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAS 3 : Sur le départ */}
                  {currentState.stateId === "Sur le départ" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Temps d'inactivité sur le panier avant qualification d'abandon
                          </label>
                          <span className="text-xs font-bold text-pr">
                            {currentState.criteria?.cartInactivitySeconds || 30} secondes
                          </span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="90"
                          step="5"
                          value={currentState.criteria?.cartInactivitySeconds || 30}
                          onChange={(e) => handleCriteriaChange("cartInactivitySeconds", parseInt(e.target.value))}
                          className="w-full accent-pr cursor-pointer"
                        />
                        <p className="text-[11px] text-gray-400">
                          Recommandé : 30 s. Au-delà, le client s'apprête à verrouiller son téléphone ou changer d'application.
                        </p>
                      </div>

                      <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(currentState.criteria?.cartExitIntent)}
                          onChange={(e) => handleCriteriaChange("cartExitIntent", e.target.checked)}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Geste de retour à l'accueil depuis le panier ouvert
                          </div>
                          <div className="text-xs text-gray-500">
                            Le client avait son panier prêt mais revient en arrière sans valider.
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* CAS 4 : Frustré */}
                  {currentState.stateId === "Frustré" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nombre de recherches dans le menu sans résultat
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={currentState.criteria?.failedSearchesCount || 2}
                            onChange={(e) => handleCriteriaChange("failedSearchesCount", parseInt(e.target.value) || 1)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">recherches infructueuses</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Clics répétés rapides (Rage clicks)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="2"
                            max="10"
                            value={currentState.criteria?.rapidClicksCount || 4}
                            onChange={(e) => handleCriteriaChange("rapidClicksCount", parseInt(e.target.value) || 2)}
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold bg-gray-50 focus:bg-white"
                          />
                          <span className="text-xs text-gray-600">clics en moins de 2 secondes sur un élément</span>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(currentState.criteria?.promoCodeFailed)}
                          onChange={(e) => handleCriteriaChange("promoCodeFailed", e.target.checked)}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Tentative d'un code promo invalide ou expiré
                          </div>
                          <div className="text-xs text-gray-500">
                            Génère une déception immédiate nécessitant une assistance ou message d'aide (Piste Service).
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* CAS 5 : Décidé */}
                  {currentState.stateId === "Décidé" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Temps maximum d'arrivée au checkout
                          </label>
                          <span className="text-xs font-bold text-pr">
                            {currentState.criteria?.checkoutTimeSeconds || 25} secondes
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          step="5"
                          value={currentState.criteria?.checkoutTimeSeconds || 25}
                          onChange={(e) => handleCriteriaChange("checkoutTimeSeconds", parseInt(e.target.value))}
                          className="w-full accent-pr cursor-pointer"
                        />
                        <p className="text-[11px] text-gray-400">
                          Un client qui passe commande en moins de 25 s ne doit pas recevoir de rabais (marge préservée).
                        </p>
                      </div>

                      <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(currentState.criteria?.habitualItemsOnly)}
                          onChange={(e) => handleCriteriaChange("habitualItemsOnly", e.target.checked)}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Ajout direct des articles habituels sans exploration
                          </div>
                          <div className="text-xs text-gray-500">
                            Parcours fluide et rapide sans détour.
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* CAS 6 : Satisfait */}
                  {currentState.stateId === "Satisfait" && (
                    <div className="space-y-4">
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        État post-commande qualifiant un client régulier ayant complété son achat avec succès. Sert de cible idéale pour les offres de la piste <strong>Fidélisation</strong> (ex : 5 $ crédités pour 7 jours).
                      </div>
                    </div>
                  )}
                </div>

                {/* Synthèse en langage naturel */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Définition résultante en langage naturel :
                  </span>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    « {currentState.naturalLanguageRule} »
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || saving}
            className="text-xs font-semibold text-gray-600 hover:text-red-600 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FaUndo size={12} />
            <span>Rétablir valeurs d'usine</span>
          </button>

          <div className="flex items-center gap-3">
            {message && (
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  message.type === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {message.type === "success" ? <FaCheck size={12} /> : <FaExclamationCircle size={12} />}
                {message.text}
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-2 text-xs font-bold text-white bg-pr hover:bg-pr/90 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <FaSave size={13} />
              <span>{saving ? "Enregistrement..." : "Enregistrer la définition"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
