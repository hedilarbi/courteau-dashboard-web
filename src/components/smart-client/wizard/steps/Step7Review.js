"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizard } from "../WizardContext";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";

export default function Step7Review() {
  const { state, dispatch } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState("");

  const handleBack = () => dispatch({ type: "SET_STEP", payload: 6 });

  // Basic validation
  const isValid = state.track && state.ruleName && state.triggerEvent && state.offer.mechanic;

  const router = useRouter();

  const buildPayload = (status = state.status || "draft") => {
    const { currentStep, nameIsCustomized, ruleId, ...ruleData } = state;
    return { ...ruleData, ruleId, status };
  };

  const validateRule = async () => {
    setValidationError("");
    const response = await fetch(`${SMART_CLIENT_API_URL}/smart-client/validate`, {
      method: "POST", headers: await getSmartClientAuthHeaders(true), body: JSON.stringify(buildPayload()),
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      const message = json.message || "La règle est invalide.";
      setValidationError(message);
      throw new Error(message);
    }
    setValidationResult(json.data);
    return json.data;
  };

  const handleSubmit = async (status) => {
    setIsSubmitting(true);
    
    try {
      if (status !== "draft") await validateRule();
      const payload = buildPayload(status);
      delete payload.ruleId;
      const ruleId = state.ruleId;
      const isEditing = Boolean(ruleId);

      const res = await fetch(`${SMART_CLIENT_API_URL}/smart-client${isEditing ? `/${ruleId}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: await getSmartClientAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de la création de la règle.");
      }

      // Success
      alert(`Règle ${isEditing ? "mise à jour" : "enregistrée"} avec succès (Statut : ${status})`);
      router.push("/smart-client"); // Redirect to the list view
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Revue et publication</h2>
        <p className="text-gray-500 mt-2">
          Vérifiez les détails avant {state.ruleId ? "de mettre à jour" : "d'activer"} votre règle.
        </p>
      </div>

      <div className="bg-pr/10 border-2 border-pr/20 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-pr tracking-wider">Nom de la règle</span>
          <span className="text-xs font-semibold bg-pr/20 text-pr px-2.5 py-0.5 rounded-full">{state.track}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{state.ruleName || "Règle sans nom"}</h3>
        
        <div className="pt-2 border-t border-pr/20">
          <h4 className="font-bold text-gray-700 text-sm mb-1">Comportement en langage naturel :</h4>
          <p className="text-base text-gray-800 leading-relaxed">
            "Quand un client passe à l'état <strong>[{state.selectedStates?.join(" OU ") || "N/A"}]</strong>, 
            lui proposer <strong>{state.offer?.mechanic === "rescue" ? "un sauvetage d'article (−" + (state.offer?.value || 2) + " $)" : "une offre avantage"}</strong> sur <strong>{state.location === "checkout" ? "la feuille de checkout" : state.location}</strong>, 
            déclenché à <strong>{state.safeguards?.triggerRate ?? 50} %</strong> des cas 
            {state.showTimer ? " (avec compte à rebours 15 min)" : ""}, 
            plafonné à max <strong>{state.safeguards?.maxPerWeek ?? 2} fois / semaine</strong>."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm font-bold mb-2">Audience estimée</div>
          <div className="text-4xl font-bold text-gray-800">{validationResult ? `~ ${validationResult.projectedAudience}` : "—"}</div>
          <div className="text-sm text-gray-500 mt-1">sessions / semaine</div>
        </div>
        
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm font-bold mb-2">Coût projeté</div>
          <div className="text-4xl font-bold text-gray-800">{validationResult ? `${validationResult.projectedWeeklyCost} $` : "—"}</div>
          <div className="text-sm text-gray-500 mt-1">max / semaine</div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm font-bold mb-2">Conflits</div>
          <div className={`text-xl font-bold flex items-center gap-2 mt-2 ${validationResult?.conflicts?.length ? "text-orange-600" : "text-green-600"}`}>
            <span>{validationResult?.conflicts?.length ? "⚠️" : "✅"}</span> {validationResult ? `${validationResult.conflicts.length} conflit(s)` : "Non vérifié"}
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200">
          ⚠️ <strong>Attention :</strong> Certaines étapes obligatoires sont incomplètes. (Piste, Événement déclencheur, Mécanique d'offre).
        </div>
      )}
      {validationError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{validationError}</div>}
      <button type="button" onClick={() => validateRule().catch(() => {})} disabled={!isValid || isSubmitting} className="rounded-lg border border-blue-600 px-5 py-2 font-bold text-blue-600 disabled:opacity-40">Tester et valider la règle</button>

      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
          ← Retour
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            Enregistrer en brouillon
          </button>
          
          <button 
            onClick={() => handleSubmit("test")}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            Tester sur moi
          </button>
          
          <button 
            onClick={() => handleSubmit("active")}
            disabled={!isValid || isSubmitting}
            className="bg-pr hover:bg-pr/90 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? "Enregistrement..." : state.ruleId ? "Enregistrer les modifications" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
