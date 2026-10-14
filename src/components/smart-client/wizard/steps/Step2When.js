"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/services/MenuItemServices";
import { useWizard } from "../WizardContext";

const EVENT_TRIGGERS = [
  { value: "session_start", label: "Ouverture de session" },
  { value: "cart_changed", label: "Modification du panier" },
  { value: "tappable_clicked", label: "Interaction / clic" },
  { value: "category_view", label: "Page catégorie ouverte" },
  { value: "checkout_click", label: "Clic sur Passer la commande" },
  { value: "inactivity", label: "Inactivité détectée" },
  { value: "order_confirmed", label: "Commande validée" },
  { value: "state_change", label: "Changement d'état (Sensible au prix, etc.)" },
];

const SESSION_STATES = [
  {
    id: "Sensible au prix",
    label: "Sensible au prix",
    icon: "🏷️",
    desc: "Détecté quand le client retire un article après avoir vu le total, baisse une taille, ou consulte les promos à répétition.",
    detectionDetails: "Baisse de taille de panier, retrait post-total, consultations répétées de promos.",
    blockedTracks: [],
    activeTracks: ["Persuasion", "Contexte"],
  },
  {
    id: "Indécis",
    label: "Indécis",
    icon: "🤔",
    desc: "Détecté lors d'hésitations prolongées, va-et-vient entre plusieurs articles ou options sans ajout au panier.",
    detectionDetails: "Temps sur page > 45 s, 3+ changements d'options, consultation aller-retour.",
    blockedTracks: [],
    activeTracks: ["Persuasion", "Service"],
  },
  {
    id: "Sur le départ",
    label: "Sur le départ",
    icon: "🚪",
    desc: "Détecté quand le client reste inactif sur le panier sans valider, ou s'apprête à quitter l'application.",
    detectionDetails: "Inactivité panier > 30 s, retour accueil sans vider, geste d'abandon.",
    blockedTracks: [],
    activeTracks: ["Persuasion"],
  },
  {
    id: "Frustré",
    label: "Frustré",
    icon: "😤",
    desc: "Détecté après des recherches infructueuses, clics répétés ou blocages techniques. Nécessite du service ou de l'aide, pas un rabais.",
    detectionDetails: "2+ recherches sans résultat, clics répétés rapides, tentative de code invalide.",
    blockedTracks: ["Persuasion"], // BLOQUANT POUR PERSUASION
    blockedReason: "Bloquant pour Persuasion — un client frustré a besoin de service ou d'aide (Piste Service), pas d'un rabais commercial.",
    activeTracks: ["Service"],
  },
  {
    id: "Décidé",
    label: "Décidé",
    icon: "⚡",
    desc: "Détecté quand le client ajoute rapidement ses articles habituels et file droit vers le paiement. Ne pas éroder la marge.",
    detectionDetails: "Ajout direct sans hésitation, parcours direct au checkout en < 20 s.",
    blockedTracks: ["Persuasion"], // BLOQUANT POUR PERSUASION
    blockedReason: "Bloquant pour Persuasion — le client va acheter de toute façon. Un rabais ici réduirait inutilement votre marge.",
    activeTracks: ["Expansion"],
  },
  {
    id: "Satisfait",
    label: "Satisfait",
    icon: "😊",
    desc: "Client régulier qui finalise sa commande sans friction.",
    detectionDetails: "Commande répétée sans blocage, historique positif.",
    blockedTracks: ["Persuasion"],
    blockedReason: "Non pertinent pour Persuasion — réservé au cycle post-commande (Fidélisation).",
    activeTracks: ["Fidélisation"],
  },
];

export default function Step2When() {
  const { state, dispatch } = useWizard();
  const [activeTab, setActiveTab] = useState("etat");
  const [showJson, setShowJson] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((response) => {
        if (!mounted) return;
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
        if (!response?.status || !list.length) {
          setCategoriesError("Aucune catégorie réelle n’a pu être chargée.");
          setCategories([]);
          return;
        }
        setCategories(list.filter((category) => category?._id && category?.name));
        setCategoriesError("");
      })
      .catch(() => {
        if (mounted) setCategoriesError("Impossible de charger les catégories.");
      })
      .finally(() => {
        if (mounted) setCategoriesLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleTriggerChange = (e) => {
    dispatch({ type: "UPDATE_FIELD", payload: { path: "triggerEvent", value: e.target.value } });
  };

  const handleNext = () => dispatch({ type: "SET_STEP", payload: 3 });
  const handleBack = () => dispatch({ type: "SET_STEP", payload: 1 });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quand la règle doit-elle se déclencher ?</h2>
        <p className="text-gray-500 mt-2">
          Définissez l'événement déclencheur et les conditions nécessaires.
        </p>
      </div>

      {/* Événement déclencheur */}
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          1. L'événement déclencheur
        </label>
        <select
          value={state.triggerEvent}
          onChange={handleTriggerChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white transition-colors"
        >
          {EVENT_TRIGGERS.map((evt) => (
            <option key={evt.value} value={evt.value}>{evt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Pré-rempli par la piste ({state.track}).
        </p>
      </div>

      {/* Constructeur de conditions */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700">
            2. Les conditions (ET / OU)
          </label>
          <button 
            onClick={() => setShowJson(!showJson)}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            {showJson ? "Vue Simple" : "Vue Avancée (JSON)"}
          </button>
        </div>

        {showJson ? (
          <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto max-h-64">
            <pre>{JSON.stringify(state.conditions, null, 2)}</pre>
            <div className="text-xs text-gray-500 mt-4 border-t border-gray-700 pt-2">
              Lecture seule pour l'instant. Structure envoyée à l'API.
            </div>
          </div>
        ) : (
          <div>
            {/* Onglets des Familles de conditions */}
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              {[
                { 
                  id: "etat", 
                  label: "État", 
                  icon: "🏷️", 
                  count: (state.selectedStates || []).length,
                },
                { 
                  id: "panier", 
                  label: "Panier", 
                  icon: "🛒", 
                  count: (
                    (state.conditions?.cart?.minTotal > 0 ? 1 : 0) +
                    ((state.conditions?.cart?.missingCategories || []).length > 0 ? 1 : 0) +
                    ((state.conditions?.cart?.requiredCategories || []).length > 0 ? 1 : 0) +
                    (state.conditions?.cart?.itemRemovedAfterTotal ? 1 : 0) +
                    (state.conditions?.cart?.sizeDowngraded ? 1 : 0)
                  ),
                },
                { 
                  id: "comportement", 
                  label: "Comportement", 
                  icon: "⏱️", 
                  count: (
                    (state.conditions?.behavior?.inactivitySeconds > 0 ? 1 : 0) +
                    (state.conditions?.behavior?.oscillationsMin > 0 ? 1 : 0) +
                    (state.conditions?.behavior?.cartCheckoutExit ? 1 : 0) +
                    (state.conditions?.behavior?.promoCodeFailed ? 1 : 0)
                  ),
                },
                { 
                  id: "contexte", 
                  label: "Contexte", 
                  icon: "🌤️", 
                  count: (
                    (state.conditions?.context?.timeSlot && state.conditions.context.timeSlot !== "all" ? 1 : 0) +
                    ((state.conditions?.context?.daysOfWeek || []).length > 0 ? 1 : 0) +
                    (state.conditions?.context?.orderType && state.conditions.context.orderType !== "all" ? 1 : 0) +
                    (state.conditions?.context?.channel && state.conditions.context.channel !== "all" ? 1 : 0)
                  ),
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id ? "border-pr text-pr bg-white shadow-sm font-bold" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>Famille {tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id ? "bg-pr text-white" : "bg-gray-200 text-gray-700"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ============================================================== */}
              {/* 1. FAMILLE ÉTAT                                               */}
              {/* ============================================================== */}
              {activeTab === "etat" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm text-gray-700 font-bold">
                      États de session ciblés (multi-sélection avec OU implicite) :
                    </label>
                    <span className="text-xs text-pr font-semibold bg-pr/10 px-2.5 py-1 rounded-full">
                      {(state.selectedStates || []).length} sélectionné{(state.selectedStates || []).length > 1 ? "s" : ""} (OU implicite)
                    </span>
                  </div>

                  {/* Multi-choix des états sous forme de cartes/chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SESSION_STATES.map((st) => {
                      const isBlocked = state.track && st.blockedTracks?.includes(state.track);
                      const isSelected = (state.selectedStates || []).includes(st.id);

                      return (
                        <div
                          key={st.id}
                          onClick={() => {
                            if (!isBlocked) {
                              dispatch({ type: "TOGGLE_STATE", payload: st.id });
                            }
                          }}
                          className={`
                            p-3.5 rounded-xl border transition-all text-left relative flex flex-col justify-between
                            ${isBlocked 
                              ? "bg-gray-50/80 border-gray-200 opacity-60 cursor-not-allowed" 
                              : isSelected
                              ? "bg-pr/5 border-pr ring-1 ring-pr shadow-sm cursor-pointer"
                              : "bg-white border-gray-200 hover:border-pr/40 cursor-pointer"}
                          `}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{st.icon}</span>
                              <span className={`font-bold text-sm ${isSelected ? "text-pr" : isBlocked ? "text-gray-400" : "text-gray-800"}`}>
                                {st.label}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isBlocked}
                              readOnly
                              className={`rounded text-pr ${isBlocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                            />
                          </div>

                          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            {st.desc}
                          </p>

                          {isBlocked && (
                            <div className="mt-2 pt-2 border-t border-gray-200/80 text-[11px] font-medium text-red-600 flex items-start gap-1">
                              <span>🚫</span>
                              <span>{st.blockedReason || `Bloqué pour la piste ${state.track}`}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Encadré d'état dynamique : suit précisément les états sélectionnés */}
                  <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Détail de détection pour votre sélection :
                    </h4>

                    {(state.selectedStates || []).map((selectedId) => {
                      const stateInfo = SESSION_STATES.find((s) => s.id === selectedId);
                      if (!stateInfo) return null;

                      return (
                        <div
                          key={selectedId}
                          className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{stateInfo.icon}</span>
                              <h4 className="font-bold text-blue-900 text-sm">{stateInfo.label}</h4>
                            </div>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                              Fréquence observée : non encore mesuré
                            </span>
                          </div>

                          <p className="text-xs text-blue-800 leading-relaxed">
                            {stateInfo.desc}
                          </p>

                          <div className="text-[11px] text-blue-600 bg-white/70 p-2 rounded-lg border border-blue-100">
                            <strong>Critères de détection :</strong> {stateInfo.detectionDetails}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* 2. FAMILLE PANIER                                             */}
              {/* ============================================================== */}
              {activeTab === "panier" && (
                <div className="space-y-6">
                  {/* Montant du panier */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span>💵</span> Montant du sous-total panier
                      </label>
                      <span className="text-xs text-gray-500">Avant taxes et pourboire</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Montant minimum ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={state.conditions?.cart?.minTotal ?? 0}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "cart", field: "minTotal", val: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="0 $ (Tous les paniers)"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Montant maximum ($ optionnel)</label>
                        <input
                          type="number"
                          min="0"
                          value={state.conditions?.cart?.maxTotal || ""}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "cart", field: "maxTotal", val: e.target.value ? parseFloat(e.target.value) : "" }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                          placeholder="Illimité"
                        />
                      </div>
                    </div>

                    {/* Raccourcis seuils */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-gray-500">Seuils rapides :</span>
                      {[
                        { label: "Tous", val: 0 },
                        { label: "≥ 20 $", val: 20 },
                        { label: "≥ 30 $", val: 30 },
                        { label: "≥ 45 $ (Grand panier)", val: 45 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "cart", field: "minTotal", val: item.val }
                          })}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            (state.conditions?.cart?.minTotal === item.val)
                              ? "bg-pr text-white border-pr font-bold"
                              : "bg-white text-gray-600 border-gray-300 hover:border-pr"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Catégories manquantes (Croissance du mix) */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span>🥤</span> Catégories manquantes dans la commande (Expansion)
                    </label>
                    <p className="text-xs text-gray-500">
                      Déclencher l'offre si le client n'a pas encore ajouté de plat appartenant à ces catégories :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const currentList = state.conditions?.cart?.missingCategories || [];
                        const categoryId = String(cat._id);
                        const isSelected = currentList.map(String).includes(categoryId);
                        return (
                          <button
                            key={categoryId}
                            type="button"
                            onClick={() => {
                              const updated = isSelected 
                                ? currentList.filter((value) => String(value) !== categoryId)
                                : [...currentList, categoryId];
                              dispatch({
                                type: "UPDATE_CONDITION_FAMILY",
                                payload: { family: "cart", field: "missingCategories", val: updated }
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                              isSelected 
                                ? "bg-pr/10 border-pr text-pr font-bold shadow-sm" 
                                : "bg-white border-gray-300 text-gray-700 hover:border-pr/50"
                            }`}
                          >
                            <span>🗂️</span>
                            <span>{cat.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                      {categoriesLoading && <span className="text-xs text-gray-400">Chargement des catégories…</span>}
                      {!categoriesLoading && categoriesError && <span className="text-xs font-medium text-red-600">{categoriesError}</span>}
                    </div>
                  </div>

                  {/* Catégories obligatoirement requises dans le panier */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span>🍟</span> Articles ou catégories requis dans le panier
                    </label>
                    <p className="text-xs text-gray-500">
                      L'offre ne s'activera que si le panier contient au moins un article de ce type :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const currentList = state.conditions?.cart?.requiredCategories || [];
                        const categoryId = String(cat._id);
                        const isSelected = currentList.map(String).includes(categoryId);
                        return (
                          <button
                            key={categoryId}
                            type="button"
                            onClick={() => {
                              const updated = isSelected 
                                ? currentList.filter((value) => String(value) !== categoryId)
                                : [...currentList, categoryId];
                              dispatch({
                                type: "UPDATE_CONDITION_FAMILY",
                                payload: { family: "cart", field: "requiredCategories", val: updated }
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                              isSelected 
                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm" 
                                : "bg-white border-gray-300 text-gray-700 hover:border-emerald-400"
                            }`}
                          >
                            <span>🗂️</span>
                            <span>{cat.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                      {categoriesLoading && <span className="text-xs text-gray-400">Chargement des catégories…</span>}
                      {!categoriesLoading && categoriesError && <span className="text-xs font-medium text-red-600">{categoriesError}</span>}
                    </div>
                  </div>

                  {/* Actions critiques récentes sur le panier */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Événements critiques sur le panier
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(state.conditions?.cart?.itemRemovedAfterTotal)}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "cart", field: "itemRemovedAfterTotal", val: e.target.checked }
                          })}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Un article a été retiré après affichage du sous-total
                          </div>
                          <div className="text-xs text-gray-500">
                            Signal clé de la piste <strong>Persuasion</strong> (sauvetage d'article pour éviter l'abandon de plat).
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(state.conditions?.cart?.sizeDowngraded)}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "cart", field: "sizeDowngraded", val: e.target.checked }
                          })}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Rétrogradation de format (ex : Grand vers Régulier)
                          </div>
                          <div className="text-xs text-gray-500">
                            Le client réduit sa portion pour des raisons budgétaires.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* 3. FAMILLE COMPORTEMENT                                       */}
              {/* ============================================================== */}
              {activeTab === "comportement" && (
                <div className="space-y-6">
                  {/* Inactivité sur le panier */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Number(state.conditions?.behavior?.inactivitySeconds || 0) > 0}
                        onChange={(e) => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: {
                            family: "behavior",
                            field: "inactivitySeconds",
                            val: e.target.checked ? 30 : 0,
                          }
                        })}
                        className="rounded text-pr w-4 h-4 cursor-pointer"
                      />
                      <span>⏱️</span> Utiliser un délai d&apos;inactivité
                    </label>
                    {state.conditions?.behavior?.inactivitySeconds > 0 ? (
                      <>
                        <p className="text-xs text-gray-500">
                          Déclencher si le client reste sans action pendant :
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: "15 s (Flash)", val: 15 },
                            { label: "30 s (Recommandé)", val: 30 },
                            { label: "45 s", val: 45 },
                            { label: "60 s", val: 60 },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => dispatch({
                                type: "UPDATE_CONDITION_FAMILY",
                                payload: { family: "behavior", field: "inactivitySeconds", val: item.val }
                              })}
                              className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition-colors ${
                                state.conditions?.behavior?.inactivitySeconds === item.val
                                  ? "bg-pr text-white border-pr shadow-sm"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-pr/60"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-green-700">
                        Condition désactivée : aucun délai d&apos;inactivité ne sera vérifié.
                      </p>
                    )}
                  </div>

                  {/* Oscillations et allers-retours */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span>🔄</span> Va-et-vient entre plusieurs articles (Hésitation)
                    </label>
                    <p className="text-xs text-gray-500">
                      Nombre de consultations successives d'articles similaires sans passer à l'action :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Désactivé", val: 0 },
                        { label: "≥ 2 allers-retours", val: 2 },
                        { label: "≥ 3 allers-retours (Hésitant)", val: 3 },
                        { label: "≥ 5 allers-retours (Blocage)", val: 5 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "behavior", field: "oscillationsMin", val: item.val }
                          })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            (state.conditions?.behavior?.oscillationsMin ?? 0) === item.val
                              ? "bg-pr text-white border-pr shadow-sm"
                              : "bg-white text-gray-700 border-gray-300 hover:border-pr/60"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frictions et signaux de sortie (Exit-intent) */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Frictions & Signaux d'abandon
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(state.conditions?.behavior?.cartCheckoutExit)}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "behavior", field: "cartCheckoutExit", val: e.target.checked }
                          })}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Retour arrière depuis l'écran de paiement vers le panier
                          </div>
                          <div className="text-xs text-gray-500">
                            Le client a cliqué « Commander », a vu le récapitulatif avec les frais, puis revient en arrière.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(state.conditions?.behavior?.promoCodeFailed)}
                          onChange={(e) => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "behavior", field: "promoCodeFailed", val: e.target.checked }
                          })}
                          className="mt-0.5 rounded text-pr w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            Échec de saisie d'un code promo
                          </div>
                          <div className="text-xs text-gray-500">
                            Le client a essayé un code promo invalide ou expiré et risque de quitter par frustration.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* 4. FAMILLE CONTEXTE                                           */}
              {/* ============================================================== */}
              {activeTab === "contexte" && (
                <div className="space-y-6">
                  {/* Tranche horaire */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span>⏰</span> Créneau horaire de la journée
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "all", label: "Toute la journée (24h/24)", sub: "Pas de filtre horaire" },
                        { id: "afternoon", label: "Heures creuses après-midi (14h–17h)", sub: "Idéal pour combler les temps calmes" },
                        { id: "lunch", label: "Coup de feu du midi (11h30–13h30)", sub: "Pic de commandes rapides" },
                        { id: "dinner", label: "Coup de feu du soir (17h30–20h30)", sub: "Commandes familiales" },
                        { id: "late_night", label: "Tard le soir (après 21h00)", sub: "Fringale de nuit" },
                      ].map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => dispatch({
                            type: "UPDATE_CONDITION_FAMILY",
                            payload: { family: "context", field: "timeSlot", val: slot.id }
                          })}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            (state.conditions?.context?.timeSlot || "all") === slot.id
                              ? "bg-pr/10 border-pr text-pr font-bold"
                              : "bg-white border-gray-300 text-gray-700 hover:border-pr/50"
                          }`}
                        >
                          <div className="text-xs font-bold">{slot.label}</div>
                          <div className="text-[11px] text-gray-500 font-normal">{slot.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Jours de la semaine */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span>📅</span> Jours de la semaine ciblés
                      </label>
                      <span className="text-xs text-gray-500">
                        {((state.conditions?.context?.daysOfWeek || []).length === 0) 
                          ? "Actif tous les jours" 
                          : `${state.conditions.context.daysOfWeek.length} jour(s) actif(s)`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {[
                        { day: 1, label: "Lun" },
                        { day: 2, label: "Mar" },
                        { day: 3, label: "Mer" },
                        { day: 4, label: "Jeu" },
                        { day: 5, label: "Ven" },
                        { day: 6, label: "Sam" },
                        { day: 0, label: "Dim" },
                      ].map((d) => {
                        const currentDays = state.conditions?.context?.daysOfWeek || [];
                        const isSelected = currentDays.includes(d.day);
                        return (
                          <button
                            key={d.day}
                            type="button"
                            onClick={() => {
                              const updated = isSelected 
                                ? currentDays.filter(day => day !== d.day) 
                                : [...currentDays, d.day];
                              dispatch({
                                type: "UPDATE_CONDITION_FAMILY",
                                payload: { family: "context", field: "daysOfWeek", val: updated }
                              });
                            }}
                            className={`flex-1 min-w-[40px] py-2 rounded-lg text-xs font-bold border transition-colors ${
                              isSelected
                                ? "bg-pr text-white border-pr shadow-sm"
                                : "bg-white border-gray-300 text-gray-700 hover:border-pr"
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Raccourcis de jours */}
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "daysOfWeek", val: [] }
                        })}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:border-pr text-gray-600"
                      >
                        Tous les jours
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "daysOfWeek", val: [1, 2] }
                        })}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:border-pr text-gray-600"
                      >
                        Début de semaine (Lun–Mar)
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "daysOfWeek", val: [1, 2, 3, 4] }
                        })}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:border-pr text-gray-600"
                      >
                        En semaine (Lun–Jeu)
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "daysOfWeek", val: [5, 6, 0] }
                        })}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:border-pr text-gray-600"
                      >
                        Week-end (Ven–Dim)
                      </button>
                    </div>
                  </div>

                  {/* Mode de commande & Canal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span>🛵</span> Mode de commande
                      </label>
                      <select
                        value={state.conditions?.context?.orderType || "all"}
                        onChange={(e) => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "orderType", val: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white font-medium"
                      >
                        <option value="all">Tous les modes (Livraison & Ramassage)</option>
                        <option value="delivery">Livraison uniquement</option>
                        <option value="pickup">Pour emporter / Ramassage uniquement</option>
                      </select>
                    </div>

                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-2">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span>📱</span> Canal de commande
                      </label>
                      <select
                        value={state.conditions?.context?.channel || "all"}
                        onChange={(e) => dispatch({
                          type: "UPDATE_CONDITION_FAMILY",
                          payload: { family: "context", field: "channel", val: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white font-medium"
                      >
                        <option value="all">Tous les canaux (App & Web)</option>
                        <option value="app">Application mobile uniquement</option>
                        <option value="web">Site Web client uniquement</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={handleNext}
          className="bg-pr hover:bg-pr/90 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm"
        >
          Suivant : Qui →
        </button>
      </div>
    </div>
  );
}
