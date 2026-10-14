"use client";

import React from "react";
import { useWizard } from "../WizardContext";

const FIELDS = [
  { id: "orderCount", label: "Nombre de commandes", type: "number" },
  { id: "accountAgeDays", label: "Ancienneté du compte (jours)", type: "number" },
  { id: "fidelityPoints", label: "Points de fidélité", type: "number" },
  { id: "favoriteCount", label: "Nombre de favoris", type: "number" },
  { id: "subscriptionIsActive", label: "Abonnement actif", type: "boolean" },
  { id: "hasDateOfBirth", label: "Date de naissance renseignée", type: "boolean" },
];
const OPERATORS = [
  ["eq", "égal à"], ["neq", "différent de"], ["gte", "supérieur ou égal"],
  ["gt", "supérieur à"], ["lte", "inférieur ou égal"], ["lt", "inférieur à"],
];
const SEGMENTS = {
  Nouveau: [{ field: "orderCount", operator: "eq", value: 0 }],
  Occasionnel: [{ field: "orderCount", operator: "lte", value: 2 }],
  Régulier: [{ field: "orderCount", operator: "gte", value: 3 }],
  Fidèle: [{ field: "orderCount", operator: "gte", value: 8 }],
  VIP: [{ field: "orderCount", operator: "gte", value: 15 }, { field: "fidelityPoints", operator: "gte", value: 500 }],
};

export default function Step3Who() {
  const { state, dispatch } = useWizard();
  const conditions = state.profileConditions || { operator: "AND", rules: [] };
  const update = (next) => dispatch({ type: "UPDATE_FIELD", payload: { path: "profileConditions", value: next } });
  const addRule = () => update({ ...conditions, rules: [...(conditions.rules || []), { field: "orderCount", operator: "gte", value: 1 }] });
  const updateRule = (index, patch) => update({ ...conditions, rules: conditions.rules.map((rule, i) => i === index ? { ...rule, ...patch } : rule) });
  const removeRule = (index) => update({ ...conditions, rules: conditions.rules.filter((_, i) => i !== index) });
  const selectSegment = (name) => update({ operator: "AND", rules: SEGMENTS[name] });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Qui est ciblé ?</h2>
        <p className="text-gray-500 mt-2">Limitez la règle à un profil calculé par le serveur depuis les données du compte.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div><h3 className="font-bold text-gray-800">Filtre profil</h3><p className="text-sm text-gray-500">Désactivé : tous les clients éligibles.</p></div>
          <button
            type="button"
            onClick={() => dispatch({ type: "UPDATE_FIELD", payload: { path: "hasProfileFilter", value: !state.hasProfileFilter } })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${state.hasProfileFilter ? "bg-pr" : "bg-gray-300"}`}
          ><span className={`h-4 w-4 rounded-full bg-white transition-transform ${state.hasProfileFilter ? "translate-x-6" : "translate-x-1"}`} /></button>
        </div>

        {state.hasProfileFilter && (
          <div className="mt-6 border-t pt-6 space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700">Segments rapides</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(SEGMENTS).map((name) => <button type="button" key={name} onClick={() => selectSegment(name)} className="rounded-full border px-4 py-2 text-sm hover:border-pr hover:text-pr">{name}</button>)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">Combinaison</span>
              <select value={conditions.operator || "AND"} onChange={(e) => update({ ...conditions, operator: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="AND">Toutes les conditions (ET)</option><option value="OR">Au moins une condition (OU)</option>
              </select>
            </div>
            <div className="space-y-3">
              {(conditions.rules || []).map((rule, index) => {
                const field = FIELDS.find((item) => item.id === rule.field) || FIELDS[0];
                return (
                  <div key={`${rule.field}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border bg-gray-50 p-3 md:grid-cols-[1fr_180px_160px_auto]">
                    <select value={rule.field} onChange={(e) => updateRule(index, { field: e.target.value, value: FIELDS.find((item) => item.id === e.target.value)?.type === "boolean" ? true : 0 })} className="rounded border px-3 py-2 text-sm">
                      {FIELDS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                    <select value={rule.operator} onChange={(e) => updateRule(index, { operator: e.target.value })} className="rounded border px-3 py-2 text-sm">
                      {OPERATORS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    {field.type === "boolean" ? (
                      <select value={String(rule.value)} onChange={(e) => updateRule(index, { value: e.target.value === "true" })} className="rounded border px-3 py-2 text-sm"><option value="true">Oui</option><option value="false">Non</option></select>
                    ) : (
                      <input type="number" min="0" value={rule.value ?? 0} onChange={(e) => updateRule(index, { value: Number(e.target.value) })} className="rounded border px-3 py-2 text-sm" />
                    )}
                    <button type="button" onClick={() => removeRule(index)} className="rounded px-3 text-red-500 hover:bg-red-50">Supprimer</button>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={addRule} className="rounded-lg border border-pr px-4 py-2 text-sm font-bold text-pr">+ Ajouter une condition</button>
          </div>
        )}
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch({ type: "SET_STEP", payload: 2 })} className="px-6 py-3 text-gray-500">← Retour</button>
        <button onClick={() => dispatch({ type: "SET_STEP", payload: 4 })} disabled={state.hasProfileFilter && !(conditions.rules || []).length} className="rounded-lg bg-pr px-8 py-3 font-bold text-white disabled:opacity-40">Suivant : Quoi →</button>
      </div>
    </div>
  );
}
