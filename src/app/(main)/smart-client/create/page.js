"use client";
import React from "react";
import { WizardProvider } from "@/components/smart-client/wizard/WizardContext";
import WizardLayout from "@/components/smart-client/wizard/WizardLayout";

export default function CreateSmartClientRulePage() {
  return (
    <div className="w-full h-full bg-slate-50">
      <WizardProvider>
        <WizardLayout />
      </WizardProvider>
    </div>
  );
}
