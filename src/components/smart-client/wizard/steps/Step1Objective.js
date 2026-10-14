"use client";

import React from "react";
import { useWizard } from "../WizardContext";

const TRACKS = [
  {
    id: "Persuasion",
    label: "Persuasion",
    desc: "Convaincre un client qui hésite ou qui s'apprête à partir.",
    example: "Ex: Il retire un article après avoir vu le total.",
    icon: "🎯"
  },
  {
    id: "Expansion",
    label: "Expansion",
    desc: "Agrandir une commande qui est déjà en train de se faire.",
    example: "Ex: Ajouter une poutine ou une boisson à un menu incomplet.",
    icon: "📈"
  },
  {
    id: "Fidélisation",
    label: "Fidélisation",
    desc: "Faire revenir le client plus vite après sa commande.",
    example: "Ex: 5 $ crédités sur ta prochaine commande, valables 7 jours.",
    icon: "🤝"
  },
  {
    id: "Contexte",
    label: "Contexte",
    desc: "Remplir un creux : midi, début de semaine, heure calme.",
    example: "Ex: Offre spéciale le mardi entre 15h et 17h.",
    icon: "⏱️"
  },
  {
    id: "Mix produit",
    label: "Mix produit",
    desc: "Pousser une catégorie sous-vendue ou à meilleure marge.",
    example: "Ex: Mettre en avant les desserts sur l'accueil.",
    icon: "🍰"
  },
  {
    id: "Service",
    label: "Service",
    desc: "Aider sans vendre : problème, rupture, recherche vide.",
    example: "Ex: Message d'aide après 2 recherches sans résultat.",
    icon: "🛟"
  },
  {
    id: "Réactivation",
    label: "Réactivation",
    desc: "Ramener un client qui n'est pas venu depuis longtemps.",
    example: "Ex: Push notification après 30 jours d'absence.",
    icon: "👋"
  }
];

export default function Step1Objective() {
  const { state, dispatch } = useWizard();

  const handleSelectTrack = (trackId) => {
    dispatch({ type: "SET_TRACK", payload: trackId });
  };

  const handleNameChange = (e) => {
    dispatch({ type: "UPDATE_FIELD", payload: { path: "ruleName", value: e.target.value } });
  };

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 2 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quel est l'objectif de cette règle ?</h2>
        <p className="text-gray-500 mt-2">
          Le choix de la piste va pré-configurer automatiquement les conditions, les offres et les limites pour vous faire gagner du temps.
        </p>
      </div>

      {/* Nom de la règle (toujours visible à l'étape 1) */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Nom de la règle <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={state.ruleName}
          onChange={handleNameChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pr/50 focus:border-pr text-base font-semibold text-gray-800 bg-gray-50/50"
          placeholder="Ex: Persuasion — Sauvetage article — Sensible au prix"
        />
        <p className="text-xs text-gray-500 mt-2">
          Pré-rempli automatiquement selon vos choix (« Piste — Mécanique — État ciblé »). Vous pouvez le personnaliser à tout moment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRACKS.map((track) => {
          const isSelected = state.track === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handleSelectTrack(track.id)}
              className={`
                cursor-pointer rounded-xl p-5 border-2 transition-all
                ${isSelected 
                  ? "border-pr bg-pr/5 shadow-md scale-[1.02]" 
                  : "border-gray-200 hover:border-pr/30 hover:bg-gray-50"}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{track.icon}</div>
                <div>
                  <h3 className={`font-bold ${isSelected ? "text-pr" : "text-gray-800"}`}>
                    {track.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{track.desc}</p>
                  <p className="text-xs text-gray-400 mt-3 italic">{track.example}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!state.ruleName?.trim()}
          className="bg-pr hover:bg-pr/90 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Suivant : Définir le Quand →
        </button>
      </div>
    </div>
  );
}
