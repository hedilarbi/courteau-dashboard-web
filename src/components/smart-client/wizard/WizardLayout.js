"use client";

import React from "react";
import { useWizard } from "./WizardContext";
import WizardHorizontalStepper from "./WizardHorizontalStepper";
import LiveMetricsPanel from "./LiveMetricsPanel";

// Import steps
import Step1Objective from "./steps/Step1Objective";
import Step2When from "./steps/Step2When";
import Step3Who from "./steps/Step3Who";
import Step4What from "./steps/Step4What";
import Step5Where from "./steps/Step5Where";
import Step6Safeguards from "./steps/Step6Safeguards";
import Step7Review from "./steps/Step7Review";

export default function WizardLayout() {
  const { state } = useWizard();
  
  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <Step1Objective />;
      case 2: return <Step2When />;
      case 3: return <Step3Who />;
      case 4: return <Step4What />;
      case 5: return <Step5Where />;
      case 6: return <Step6Safeguards />;
      case 7: return <Step7Review />;
      default: return <Step1Objective />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50">
      {/* Barre Horizontale des Étapes en Haut */}
      <WizardHorizontalStepper />

      {/* Zone de Contenu : Formulaire + Panneau Live */}
      <div className="flex flex-1 overflow-hidden">
        {/* Formulaire de l'étape active */}
        <div className="flex-1 overflow-y-auto flex justify-center pb-24">
          <div className="w-full max-w-4xl px-6 sm:px-10 py-8">
            {renderStep()}
          </div>
        </div>

        {/* Panneau Live de Droite */}
        <div className="w-[360px] min-w-[320px] max-w-[420px] bg-white border-l border-gray-200 shadow-sm overflow-y-auto hidden lg:block">
          <LiveMetricsPanel />
        </div>
      </div>
    </div>
  );
}
