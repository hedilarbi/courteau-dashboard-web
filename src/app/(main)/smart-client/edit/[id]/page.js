"use client";

import React, { useEffect, useState } from "react";
import { WizardProvider } from "@/components/smart-client/wizard/WizardContext";
import WizardLayout from "@/components/smart-client/wizard/WizardLayout";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";

export default function EditSmartClientRulePage({ params }) {
  const [rule, setRule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${SMART_CLIENT_API_URL}/smart-client/${params.id}`, {
          headers: await getSmartClientAuthHeaders(),
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || "Règle introuvable.");
        setRule(json.data);
      } catch (loadError) {
        setError(loadError.message);
      }
    };
    load();
  }, [params.id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rule) return <div className="p-8 text-gray-500">Chargement de la règle…</div>;

  return (
    <div className="w-full h-full bg-slate-50">
      <WizardProvider initialRule={rule}>
        <WizardLayout />
      </WizardProvider>
    </div>
  );
}
