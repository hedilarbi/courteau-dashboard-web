"use client";

import React from "react";
import { useWizard } from "./WizardContext";

const STEPS = [
  { id: 1, title: "1. Objectif", subtitle: "Choisir la piste", required: true },
  { id: 2, title: "2. Quand", subtitle: "Condition de déclenchement", required: true },
  { id: 3, title: "3. Qui", subtitle: "Filtrage profil (optionnel)", required: false },
  { id: 4, title: "4. Quoi", subtitle: "Mécanique de l'offre", required: true },
  { id: 5, title: "5. Où et Durée", subtitle: "Placement et timer", required: false },
  { id: 6, title: "6. Garde-fous", subtitle: "Limites et témoins", required: false },
  { id: 7, title: "7. Revue", subtitle: "Validation et publication", required: true },
];

export default function WizardSidebar() {
  const { state, dispatch } = useWizard();

  const handleStepClick = (stepId) => {
    dispatch({ type: "SET_STEP", payload: stepId });
  };

  return (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Smart Client</h2>
        <p className="text-sm text-gray-500 mt-1">Création de règle</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {STEPS.map((step) => {
          const isActive = state.currentStep === step.id;
          const isPast = state.currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-start gap-3
                ${isActive ? "bg-pr/10 border-l-4 border-pr" : "hover:bg-gray-100 border-l-4 border-transparent"}
              `}
            >
              <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5 shrink-0
                ${isActive ? "bg-pr text-white" : isPast ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}
              `}>
                {isPast ? "✓" : step.id}
              </div>
              <div>
                <div className={`font-semibold ${isActive ? "text-pr" : "text-gray-700"}`}>
                  {step.title}
                  {step.required && <span className="ml-2 text-red-500 text-xs">*</span>}
                </div>
                <div className="text-xs text-gray-500">{step.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          * Étape obligatoire pour publier
        </div>
      </div>
    </div>
  );
}
