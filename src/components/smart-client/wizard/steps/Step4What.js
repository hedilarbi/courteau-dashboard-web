"use client";

import React, { useEffect, useState } from "react";
import { getCategories, getMenuItems } from "@/services/MenuItemServices";
import { useWizard } from "../WizardContext";

const MECHANICS = [
  ["fixed_price", "Prix fixe", ["Persuasion", "Expansion", "Contexte"]],
  ["free_item_threshold", "Article offert dès un seuil", ["Persuasion", "Expansion", "Contexte"]],
  ["cashback", "Cashback différé", ["Persuasion", "Fidélisation", "Contexte"]],
  ["bogo", "2e article réduit (BOGO)", ["Persuasion", "Expansion", "Contexte"]],
  ["rescue", "Sauvetage d’article", ["Persuasion"]],
  ["message_only", "Message sans offre", ["Service"]],
  ["discount", "Réduction", ["Persuasion", "Contexte"]],
  ["free_item", "Article gratuit", ["Expansion", "Fidélisation"]],
  ["suggest_category", "Suggérer une catégorie", ["Expansion", "Mix produit"]],
];
const TARGETS = [
  ["cart", "Panier entier"], ["item", "Article précis"], ["category", "Catégorie"],
  ["missing_role", "Rôle manquant"], ["removed_item", "Article retiré"],
  ["viewed_item", "Article consulté"], ["favorite_item", "Article favori"], ["size_upgrade", "Taille supérieure"],
];

export default function Step4What() {
  const { state, dispatch } = useWizard();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const offer = state.offer || {};
  const setOffer = (field, value) => dispatch({ type: "UPDATE_NESTED_FIELD", payload: { root: "offer", field, val: value } });

  useEffect(() => {
    Promise.all([getMenuItems(), getCategories()]).then(([items, cats]) => {
      if (items?.status) setMenuItems(items.data || []);
      if (cats?.status) setCategories(cats.data || []);
    }).catch(() => {});
  }, []);

  const addVariant = () => setOffer("variants", [...(offer.variants || []), { key: `variante_${(offer.variants || []).length + 1}`, weight: 50, value: offer.value || 0, productId: null }]);
  const updateVariant = (index, patch) => setOffer("variants", offer.variants.map((variant, i) => i === index ? { ...variant, ...patch } : variant));
  const needsProduct = ["item", "removed_item", "viewed_item", "favorite_item"].includes(offer.targetType) || ["free_item", "free_item_threshold", "bogo"].includes(offer.mechanic);
  const needsValue = offer.mechanic !== "message_only" && offer.mechanic !== "free_item" && offer.mechanic !== "suggest_category";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div><h2 className="text-2xl font-bold text-gray-800">Quoi offrir ?</h2><p className="mt-2 text-gray-500">Tous les champs ci-dessous sont enregistrés et validés par le serveur.</p></div>
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <label className="mb-4 block text-sm font-bold">Mécanique</label>
        <div className="grid gap-3 md:grid-cols-2">
          {MECHANICS.map(([id, label, tracks]) => {
            const compatible = tracks.includes(state.track);
            return <button type="button" key={id} disabled={!compatible} onClick={() => dispatch({ type: "SET_MECHANIC", payload: id })} className={`rounded-lg border p-4 text-left font-bold ${offer.mechanic === id ? "border-pr bg-pr/5 ring-1 ring-pr" : "border-gray-200"} disabled:cursor-not-allowed disabled:opacity-40`}>{label}{!compatible && <span className="ml-2 text-xs font-normal text-red-500">Incompatible</span>}</button>;
          })}
        </div>
      </section>

      <section className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">Cible
            <select value={offer.targetType || "cart"} onChange={(e) => setOffer("targetType", e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal">{TARGETS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
          </label>
          <label className="text-sm font-bold">Type de seuil
            <select value={offer.thresholdType || "fixed"} onChange={(e) => setOffer("thresholdType", e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"><option value="fixed">Montant fixe</option><option value="habit_ratio">Panier habituel × facteur</option><option value="cart_plus">Panier actuel + montant</option><option value="next_tier">Prochain palier</option></select>
          </label>
          <label className="text-sm font-bold">Seuil minimum
            <input type="number" min="0" value={offer.thresholdValue ?? 0} onChange={(e) => setOffer("thresholdValue", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-bold">Plafond
            <input type="number" min="0" value={offer.thresholdCeiling ?? 0} onChange={(e) => setOffer("thresholdCeiling", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" />
          </label>
        </div>

        {needsProduct && <label className="block text-sm font-bold">Article
          <select value={offer.productId || ""} onChange={(e) => setOffer("productId", e.target.value || null)} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"><option value="">Sélectionner un article</option>{menuItems.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        </label>}
        {(offer.targetType === "category" || offer.mechanic === "suggest_category") && <label className="block text-sm font-bold">Catégorie
          <select value={offer.categoryId || ""} onChange={(e) => setOffer("categoryId", e.target.value || null)} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"><option value="">Sélectionner une catégorie</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        </label>}

        {needsValue && <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-bold">Type de valeur<select value={offer.valueType || "discount_amount"} onChange={(e) => setOffer("valueType", e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"><option value="discount_amount">Rabais fixe</option><option value="discount_pct">Rabais %</option><option value="fixed_price">Prix fixe</option><option value="cashback_amount">Cashback</option></select></label>
          <label className="text-sm font-bold">Valeur<input type="number" min="0" value={offer.value ?? 0} onChange={(e) => setOffer("value", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" /></label>
          <label className="text-sm font-bold">Quantité<input type="number" min="1" value={offer.quantity ?? 1} onChange={(e) => setOffer("quantity", Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" /></label>
        </div>}
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <label className="text-sm font-bold">Distribution</label>
        <select value={offer.distribution || "single"} onChange={(e) => setOffer("distribution", e.target.value)} className="ml-4 rounded-lg border px-3 py-2 text-sm"><option value="single">Offre unique</option><option value="ab">A/B manuel</option><option value="ai">Optimisation automatique</option></select>
        {offer.distribution !== "single" && <div className="mt-4 space-y-2">
          {(offer.variants || []).map((variant, index) => <div key={index} className="grid grid-cols-[1fr_120px_120px_auto] gap-2"><input value={variant.key} onChange={(e) => updateVariant(index, { key: e.target.value })} className="rounded border px-3 py-2" placeholder="Nom" /><input type="number" min="0" max="100" value={variant.weight} onChange={(e) => updateVariant(index, { weight: Number(e.target.value) })} className="rounded border px-3 py-2" placeholder="Poids %" /><input type="number" min="0" value={variant.value} onChange={(e) => updateVariant(index, { value: Number(e.target.value) })} className="rounded border px-3 py-2" placeholder="Valeur" /><button type="button" onClick={() => setOffer("variants", offer.variants.filter((_, i) => i !== index))} className="text-red-500">Supprimer</button></div>)}
          <button type="button" onClick={addVariant} className="rounded border border-pr px-3 py-2 text-sm font-bold text-pr">+ Variante</button>
          <p className="text-xs text-gray-500">Total des poids : {(offer.variants || []).reduce((sum, item) => sum + Number(item.weight || 0), 0)} %</p>
        </div>}
      </section>

      <div className="flex justify-between"><button onClick={() => dispatch({ type: "SET_STEP", payload: 3 })} className="px-6 py-3 text-gray-500">← Retour</button><button onClick={() => dispatch({ type: "SET_STEP", payload: 5 })} disabled={!offer.mechanic || (needsProduct && !offer.productId)} className="rounded-lg bg-pr px-8 py-3 font-bold text-white disabled:opacity-40">Suivant : Où →</button></div>
    </div>
  );
}
