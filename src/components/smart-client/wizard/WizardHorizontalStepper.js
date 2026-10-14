"use client";

import React from "react";
import Link from "next/link";
import { useWizard } from "./WizardContext";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

const STEPS = [
  { id: 1, title: "1. Objectif", subtitle: "Piste stratégique", required: true },
  { id: 2, title: "2. Quand", subtitle: "Conditions & Déclencheur", required: true },
  { id: 3, title: "3. Qui", subtitle: "Filtrage profil", required: false },
  { id: 4, title: "4. Quoi", subtitle: "Mécanique d'offre", required: true },
  { id: 5, title: "5. Où et Durée", subtitle: "Placement & Timer", required: false },
  { id: 6, title: "6. Garde-fous", subtitle: "Limites & Témoins", required: false },
  { id: 7, title: "7. Revue", subtitle: "Validation finale", required: true },
];

export default function WizardHorizontalStepper() {
  const { state, dispatch } = useWizard();

  const handleStepClick = (stepId) => {
    dispatch({ type: "SET_STEP", payload: stepId });
  };

  const currentStep = state.currentStep || 1;
  const progressPct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-xs sticky top-0 z-30">
      {/* Barre Supérieure : Titre, piste active et retour */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-3">
          <Link
            href="/smart-client"
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs hover:border-gray-300"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Quitter le wizard</span>
          </Link>
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">
              Smart Client <span className="font-normal text-gray-400">•</span> Créateur de règle
            </span>
            {state.track && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pr/10 text-pr border border-pr/20">
                Piste {state.track}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-600">
              Étape {currentStep} / {STEPS.length}
            </span>
            <span className="text-xs text-gray-400 ml-1.5 hidden sm:inline">
              ({progressPct}%)
            </span>
          </div>
          <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
            <div
              className="bg-pr h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Barre Horizontale des Étapes */}
      <div className="w-full overflow-x-auto scrollbar-thin px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between min-w-[760px] max-w-7xl mx-auto">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isPast = currentStep > step.id;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* Élément d'étape */}
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center gap-2.5 py-1 px-2 rounded-lg transition-all text-left group shrink-0 ${
                    isActive
                      ? "bg-pr/10 ring-1 ring-pr/30 text-pr shadow-2xs"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {/* Badge numéro / check */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                      isActive
                        ? "bg-pr text-white shadow-sm scale-105"
                        : isPast
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-gray-100 text-gray-500 border border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {isPast ? <FaCheck className="text-[10px]" /> : step.id}
                  </div>

                  {/* Libellé de l'étape */}
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold leading-tight flex items-center gap-1 ${
                        isActive ? "text-pr" : isPast ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      <span>{step.title}</span>
                      {step.required && (
                        <span className="text-red-500 font-bold text-[10px]">*</span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] leading-tight truncate max-w-[110px] hidden md:block mt-0.5 ${
                        isActive ? "text-pr/80 font-medium" : "text-gray-400"
                      }`}
                    >
                      {step.subtitle}
                    </div>
                  </div>
                </button>

                {/* Trait de séparation connecteur entre les étapes */}
                {!isLast && (
                  <div className="flex-1 mx-2 min-w-[12px] h-[2px] rounded-full transition-colors relative">
                    <div
                      className={`h-full w-full rounded-full ${
                        isPast ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
