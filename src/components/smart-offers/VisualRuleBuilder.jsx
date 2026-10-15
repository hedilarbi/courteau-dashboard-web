"use client";
import React, { useState } from "react";
import { FaTimes, FaSave, FaPlus, FaTrash, FaCogs, FaSitemap, FaGift, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { getToken } from "@/actions";
import { getMenuItems, getCategories } from "@/services/MenuItemServices";
import DropDown from "@/components/DropDown";

// Liste déroulante avec recherche (articles, catégories). `options` : [{ _id, name }].
const SearchablePicker = ({ value, options, onChange, placeholder }) => {
  const list = (options || []).map((option) => ({ value: option._id, label: option.name }));
  const selected = list.find((option) => String(option.value) === String(value || "")) || null;
  return (
    <DropDown
      value={selected}
      setter={(option) => onChange(option?.value || "")}
      list={list}
      placeholder={placeholder}
    />
  );
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CRITERIA_LIST = [
  { group: "Commandes", options: [
    { value: "orders_count", label: "Nombre total de commandes" },
    { value: "total_spent", label: "Montant total dépensé ($)" },
    { value: "average_basket", label: "Panier moyen ($)" },
    { value: "recency_days", label: "Jours depuis dernière commande" },
    { value: "orders_last_X_days", label: "Commandes sur période" },
    { value: "average_days_between_orders", label: "Fréquence moyenne (Jours)" },
    { value: "recency_to_cadence_ratio", label: "Ratio Récence/Cadence (Jours depuis achat / Fréquence)" }
  ]},
  { group: "Fidélité & Compte", options: [
    { value: "account_age_days", label: "Âge du compte (Jours)" },
    { value: "fidelity_points", label: "Solde points fidélité" },
    { value: "rewards_claimed", label: "Récompenses réclamées" },
    { value: "app_is_installed", label: "App installée (Vrai/Faux)" }
  ]},
  { group: "Préférences & Goûts", options: [
    { value: "favorite_category", label: "Catégorie favorite" },
    { value: "favorite_item", label: "Article favori" }
  ]},
  { group: "Comportement", options: [
    { value: "smart_offers_used", label: "Offres intelligentes utilisées" },
    { value: "smart_offers_conversion_rate", label: "Taux de conversion offres (%)" },
    { value: "preferred_day", label: "Jour d'achat préféré (0=Dim, 1=Lun... 6=Sam)" },
    { value: "preferred_hour", label: "Heure d'achat préférée (0-23)" }
  ]}
];

const OPERATORS = [
  { value: "==", label: "Est égal à" },
  { value: ">", label: "Supérieur à" },
  { value: ">=", label: "Supérieur ou égal à" },
  { value: "<", label: "Inférieur à" },
  { value: "<=", label: "Inférieur ou égal à" },
  { value: "!=", label: "Différent de" },
];

const OFFER_TYPES = [
  { value: "discount_order", label: "Réduction sur la commande (%)" },
  { value: "discount_category", label: "Réduction sur une Catégorie (%)" },
  { value: "discount_product", label: "Réduction sur un Produit (%)" },
  { value: "bonus_basket", label: "Réduction fixe ($)" },
  { value: "free_item", label: "Article Gratuit" },
  { value: "loyalty_points", label: "Points de fidélité" },
  { value: "deferred_cashback", label: "🎁 Cashback Différé (Spend & Get)" },
  { value: "tiered_discount", label: "📈 Réduction à Paliers Progressifs" },
  { value: "mystery_gift", label: "❓ Cadeau Mystère sous Seuil" },
  { value: "buy_one_get_one", label: "1 acheté = 1 offert (BOGO)" },
  { value: "split_discount", label: "Rabais divisé (sur 3 commandes)" }
];

export default function VisualRuleBuilder({ campaign, initialRule, onClose }) {
  const [activeSection, setActiveSection] = useState("general"); 
  const [isSaving, setIsSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null);
  const [editingOfferIndex, setEditingOfferIndex] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [resItems, resCats] = await Promise.all([
          getMenuItems(),
          getCategories()
        ]);
        if (resItems.status) setMenuItems(resItems.data || []);
        if (resCats.status) setCategories(resCats.data || []);
      } catch (err) {
        console.error("Failed to fetch menu/categories", err);
      }
    };
    fetchData();
  }, []);

  const [ruleData, setRuleData] = useState({
    name: initialRule?.name || "",
    weight: initialRule?.weight || 0,
    distributionMethod: initialRule?.distributionMethod || "priority",
    isActive: initialRule?.isActive ?? true,
    logicalExpression: initialRule?.logicalExpression || "C1",
    conditions: initialRule?.conditions?.length > 0 ? initialRule.conditions : [{ conditionId: "C1", criteria: "orders_count", operator: "==", value: "0", periodDays: "" }],
    offers: initialRule?.offers || [],
    tags: initialRule?.tags || []
  });

  const handleGeneralChange = (field, value) => {
    setRuleData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionChange = (index, field, value) => {
    const newConds = [...ruleData.conditions];
    newConds[index] = { ...newConds[index], [field]: value };
    setRuleData(prev => ({ ...prev, conditions: newConds }));
  };

  const addCondition = () => {
    // Prochain numéro libre (après suppression d'une condition, la longueur ne suffit pas).
    const usedNumbers = ruleData.conditions.map((c, i) => Number(String(c.conditionId || c.id || `C${i + 1}`).replace(/\D/g, "")) || 0);
    const nextId = `C${Math.max(0, ...usedNumbers) + 1}`;
    setRuleData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { conditionId: nextId, criteria: "orders_count", operator: "==", value: "0", periodDays: "" }]
    }));
  };

  const removeCondition = (index) => {
    const newConds = [...ruleData.conditions];
    newConds.splice(index, 1);
    setRuleData(prev => ({ ...prev, conditions: newConds }));
  };

  const appendToExpression = (text) => {
    setRuleData(prev => ({ ...prev, logicalExpression: prev.logicalExpression + (prev.logicalExpression.endsWith(" ") ? "" : " ") + text + " " }));
  };


  const addOffer = (parentId = null, branchType = null) => {
    setRuleData(prev => {
      const newStepId = crypto.randomUUID();
      const newOffers = [...prev.offers];
      
      const newOffer = {
        offerType: "discount_order",
        discountValue: 10,
        bonusThreshold: 20,
        validityHours: 48,
        notificationTitle: "Nouvelle Offre !",
        notificationBody: "Voici une offre spéciale pour vous.",
        weight: 100,
        deferredActivationRule: "immediate",
        stepId: newStepId,
        isRoot: prev.offers.length === 0,
        nextStepOnAccept: "",
        nextStepOnIgnore: ""
      };
      
      newOffers.push(newOffer);
      
      if (parentId && branchType) {
        const parentIndex = newOffers.findIndex(o => o.stepId === parentId);
        if (parentIndex !== -1) {
            newOffers[parentIndex] = { ...newOffers[parentIndex] };
            if (branchType === 'accept') {
                newOffers[parentIndex].nextStepOnAccept = newStepId;
            } else if (branchType === 'ignore') {
                newOffers[parentIndex].nextStepOnIgnore = newStepId;
            }
        }
      }

      setEditingOfferIndex(newOffers.length - 1);
      return { ...prev, offers: newOffers };
    });
  };

  const removeOfferNode = (stepId) => {
     setRuleData(prev => {
        let newOffers = [...prev.offers];
        
        const removeRecursive = (idToRemove) => {
           const offer = newOffers.find(o => o.stepId === idToRemove);
           if (!offer) return;
           if (offer.nextStepOnAccept) removeRecursive(offer.nextStepOnAccept);
           if (offer.nextStepOnIgnore) removeRecursive(offer.nextStepOnIgnore);
           newOffers = newOffers.filter(o => o.stepId !== idToRemove);
           
           // Also clear references from parents
           newOffers = newOffers.map(o => {
              const updated = { ...o };
              if (updated.nextStepOnAccept === idToRemove) updated.nextStepOnAccept = "";
              if (updated.nextStepOnIgnore === idToRemove) updated.nextStepOnIgnore = "";
              return updated;
           });
        };
        removeRecursive(stepId);
        
        if (newOffers.length > 0 && !newOffers.some(o => o.isRoot)) {
            newOffers[0].isRoot = true;
        }
        
        return { ...prev, offers: newOffers };
     });
  };

  const renderScenarioTree = (currentStepId) => {
      const offer = ruleData.offers.find(o => o.stepId === currentStepId);
      if (!offer) return null;
      const offerIndex = ruleData.offers.findIndex(o => o.stepId === currentStepId);
      
      const hasAcceptChild = !!offer.nextStepOnAccept && ruleData.offers.some(o => o.stepId === offer.nextStepOnAccept);
      const hasIgnoreChild = !!offer.nextStepOnIgnore && ruleData.offers.some(o => o.stepId === offer.nextStepOnIgnore);

      return (
         <div className="flex flex-row items-center relative py-4">
            {/* The Node */}
            <div 
              onClick={() => setEditingOfferIndex(offerIndex)}
              className="bg-white border-2 border-gray-200 hover:border-pr hover:shadow-lg cursor-pointer transition-all rounded-xl p-5 w-64 flex-shrink-0 flex flex-col items-center text-center relative group shadow-sm z-10"
            >
              <button onClick={(e) => { e.stopPropagation(); removeOfferNode(offer.stepId); }} className="absolute -top-3 -right-3 bg-red-100 text-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-20"><FaTrash size={14} /></button>
              {offer.isRoot && <span className="absolute -left-3 -top-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow z-20">Départ</span>}
              <h4 className="font-black text-gray-800 text-sm">{OFFER_TYPES.find(t => t.value === offer.offerType)?.label || "Offre"}</h4>
              <p className="text-xs text-gray-500 mt-2 truncate w-full px-2 font-semibold">{offer.notificationTitle || "Sans titre"}</p>
            </div>
            
            {/* Branches */}
            <div className="flex flex-col justify-center ml-8 relative">
               <div className="absolute left-[-32px] top-1/4 bottom-1/4 w-px bg-gray-300"></div>

               <div className="flex flex-row items-center relative py-6">
                 <div className="absolute left-[-32px] top-1/2 w-8 h-px bg-gray-300"></div>
                 <span className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-[9px] px-1 font-bold rounded z-10 shadow-sm border border-green-200">Oui</span>
                 {hasAcceptChild ? (
                    renderScenarioTree(offer.nextStepOnAccept)
                 ) : (
                    <button onClick={() => addOffer(offer.stepId, 'accept')} className="w-10 h-10 rounded-full bg-white border-2 border-dashed border-gray-400 text-gray-400 hover:text-pr hover:border-pr flex items-center justify-center shadow-sm ml-2 z-10">
                      <FaPlus />
                    </button>
                 )}
               </div>

               <div className="flex flex-row items-center relative py-6">
                 <div className="absolute left-[-32px] top-1/2 w-8 h-px bg-gray-300"></div>
                 <span className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-red-100 text-red-700 text-[9px] px-1 font-bold rounded z-10 shadow-sm border border-red-200">Non</span>
                 {hasIgnoreChild ? (
                    renderScenarioTree(offer.nextStepOnIgnore)
                 ) : (
                    <button onClick={() => addOffer(offer.stepId, 'ignore')} className="w-10 h-10 rounded-full bg-white border-2 border-dashed border-gray-400 text-gray-400 hover:text-pr hover:border-pr flex items-center justify-center shadow-sm ml-2 z-10">
                      <FaPlus />
                    </button>
                 )}
               </div>
            </div>
         </div>
      );
  };


  const removeOffer = (index) => {
    const newOffers = [...ruleData.offers];
    newOffers.splice(index, 1);
    setRuleData(prev => ({ ...prev, offers: newOffers }));
  };

  const moveOffer = (index, direction) => {
    if (direction === "up" && index > 0) {
      const newOffers = [...ruleData.offers];
      const temp = newOffers[index];
      newOffers[index] = newOffers[index - 1];
      newOffers[index - 1] = temp;
      setRuleData(prev => ({ ...prev, offers: newOffers }));
    } else if (direction === "down" && index < ruleData.offers.length - 1) {
      const newOffers = [...ruleData.offers];
      const temp = newOffers[index];
      newOffers[index] = newOffers[index + 1];
      newOffers[index + 1] = temp;
      setRuleData(prev => ({ ...prev, offers: newOffers }));
    }
  };

  const handleOfferChange = (index, field, value) => {
    setRuleData(prev => {
      const newOffers = [...prev.offers];
      newOffers[index] = { ...newOffers[index], [field]: value };
      
      // Force bonusThreshold to 0 if the offer type doesn't use it
      if (field === "offerType") {
        const standardOffers = ["discount_order", "bonus_basket", "free_item", "loyalty_points", "discount_category", "discount_product"];
        if (!standardOffers.includes(value)) {
          newOffers[index].bonusThreshold = 0;
        }
      }
      
      return { ...prev, offers: newOffers };
    });
  };

  const handleTierChange = (offerIdx, tierIdx, field, value) => {
    const newOffers = [...ruleData.offers];
    if (!newOffers[offerIdx].tieredDiscounts) newOffers[offerIdx].tieredDiscounts = [];
    newOffers[offerIdx].tieredDiscounts[tierIdx] = { ...newOffers[offerIdx].tieredDiscounts[tierIdx], [field]: value };
    setRuleData(prev => ({ ...prev, offers: newOffers }));
  };

  const addTier = (offerIdx) => {
    const newOffers = [...ruleData.offers];
    if (!newOffers[offerIdx].tieredDiscounts) newOffers[offerIdx].tieredDiscounts = [];
    newOffers[offerIdx].tieredDiscounts.push({ threshold: 0, discountValue: 0 });
    setRuleData(prev => ({ ...prev, offers: newOffers }));
  };

  const removeTier = (offerIdx, tierIdx) => {
    const newOffers = [...ruleData.offers];
    newOffers[offerIdx].tieredDiscounts.splice(tierIdx, 1);
    setRuleData(prev => ({ ...prev, offers: newOffers }));
  };

  const handleDayToggle = (offerIdx, dayIndex) => {
    const newOffers = [...ruleData.offers];
    const currentDays = newOffers[offerIdx].notifyOnDays || [];
    if (currentDays.includes(dayIndex)) {
      newOffers[offerIdx].notifyOnDays = currentDays.filter(d => d !== dayIndex);
    } else {
      newOffers[offerIdx].notifyOnDays = [...currentDays, dayIndex].sort();
    }
    setRuleData(prev => ({ ...prev, offers: newOffers }));
  };

  const handleSave = async () => {
    if (!ruleData.name.trim()) return alert("Le nom de la règle est obligatoire.");
    if (ruleData.offers.length === 0) return alert("Vous devez ajouter au moins une offre à la règle.");
    
    setIsSaving(true);
    try {
      // Chaque condition doit avoir un conditionId (anciennes règles : champ `id`).
      const conditions = ruleData.conditions.map((cond, idx) => {
        const { id, ...rest } = cond;
        return { ...rest, conditionId: cond.conditionId || id || `C${idx + 1}` };
      });
      const knownIds = new Set(conditions.map((c) => c.conditionId));
      const unknownIds = (ruleData.logicalExpression.match(/\bC\d+\b/g) || []).filter((cid) => !knownIds.has(cid));
      if (unknownIds.length) {
        setIsSaving(false);
        return alert(`L'expression logique utilise des conditions inexistantes : ${[...new Set(unknownIds)].join(", ")}`);
      }
      const payload = { ...ruleData, conditions, campaign: campaign._id };
      
      const url = initialRule?._id ? `${API_URL}/smart-offers-v2/rules/${initialRule._id}` : `${API_URL}/smart-offers-v2/rules`;
      const method = initialRule?._id ? "PUT" : "POST";
      const token = await getToken();

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.value}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onClose();
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.error || "Impossible de sauvegarder la règle."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1600px] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {initialRule ? "Modifier la règle" : "Créer une règle dynamique"}
            </h2>
            <p className="text-pr font-semibold mt-1">Campagne : {campaign.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navigation / Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button onClick={() => setActiveSection("general")} className={`flex-1 py-4 font-bold flex justify-center items-center ${activeSection === "general" ? "text-pr border-b-2 border-pr bg-white" : "text-gray-500 hover:text-gray-700"}`}>
            <FaCogs className="mr-2" /> 1. Configuration Générale
          </button>
          <button onClick={() => setActiveSection("logic")} className={`flex-1 py-4 font-bold flex justify-center items-center ${activeSection === "logic" ? "text-pr border-b-2 border-pr bg-white" : "text-gray-500 hover:text-gray-700"}`}>
            <FaSitemap className="mr-2" /> 2. Ciblage & Logique
          </button>
          <button onClick={() => setActiveSection("offers")} className={`flex-1 py-4 font-bold flex justify-center items-center ${activeSection === "offers" ? "text-pr border-b-2 border-pr bg-white" : "text-gray-500 hover:text-gray-700"}`}>
            <FaGift className="mr-2" /> 3. Offres ({ruleData.offers.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeSection === "general" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la Règle</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-pr focus:ring-1 focus:ring-pr outline-none" 
                  placeholder="Ex: Réactivation VIP 90 jours" 
                  value={ruleData.name} 
                  onChange={(e) => handleGeneralChange("name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Poids (Priorité absolue)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-pr outline-none" 
                    placeholder="Ex: 100" 
                    value={ruleData.weight} 
                    onChange={(e) => handleGeneralChange("weight", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tag (Catégorie de Règle)</label>
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-pr outline-none"
                    value={ruleData.tags?.[0] || ""}
                    onChange={(e) => handleGeneralChange("tags", e.target.value ? [e.target.value] : [])}
                  >
                    <option value="">Aucun Tag</option>
                    <option value="reactivation">🔴 Réactivation</option>
                    <option value="fidelite">🟢 Fidélité / VIP</option>
                    <option value="panier">🟡 Panier (Cross-sell/Upsell)</option>
                    <option value="habitude">🔵 Habitude</option>
                    <option value="test">🟣 A/B Test</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center">
                 <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={ruleData.isActive} 
                    onChange={(e) => handleGeneralChange("isActive", e.target.checked)} 
                    className="w-5 h-5 rounded border-gray-300 bg-white text-pr focus:ring-pr"
                 />
                 <label htmlFor="isActive" className="ml-3 font-bold text-gray-800 cursor-pointer">Activer cette règle</label>
              </div>
            </div>
          )}

          {activeSection === "logic" && (
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                  <span>Conditions de Ciblage</span>
                  <button onClick={addCondition} className="bg-pr/10 hover:bg-pr/20 text-pr text-sm px-3 py-1.5 rounded flex items-center transition-colors">
                    <FaPlus className="mr-2" /> Ajouter une condition
                  </button>
                </h3>
                
                <div className="space-y-3">
                  {ruleData.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <span className="bg-gray-800 text-white font-mono font-bold px-4 py-2 rounded shadow-inner">
                        {cond.conditionId || cond.id || `C${idx + 1}`}
                      </span>
                      <select 
                        className="flex-1 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                        value={cond.criteria}
                        onChange={(e) => handleConditionChange(idx, "criteria", e.target.value)}
                      >
                        {CRITERIA_LIST.map((group, i) => (
                          <optgroup key={i} label={group.group}>
                            {group.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      <select 
                        className="w-32 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                        value={cond.operator}
                        onChange={(e) => handleConditionChange(idx, "operator", e.target.value)}
                      >
                        {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                      {cond.criteria === "favorite_category" ? (
                        <div className="w-56">
                          <SearchablePicker
                            value={cond.value}
                            options={categories}
                            onChange={(v) => handleConditionChange(idx, "value", v)}
                            placeholder="Sélectionner une catégorie"
                          />
                        </div>
                      ) : cond.criteria === "favorite_item" ? (
                        <div className="w-56">
                          <SearchablePicker
                            value={cond.value}
                            options={menuItems}
                            onChange={(v) => handleConditionChange(idx, "value", v)}
                            placeholder="Sélectionner un produit"
                          />
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          className="w-24 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr" 
                          placeholder="Valeur" 
                          value={cond.value} 
                          onChange={(e) => handleConditionChange(idx, "value", e.target.value)}
                        />
                      )}
                      <input 
                        type="text" 
                        className="w-32 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr" 
                        placeholder="Période (jours)" 
                        value={cond.periodDays} 
                        onChange={(e) => handleConditionChange(idx, "periodDays", e.target.value)}
                      />
                      <button onClick={() => removeCondition(idx)} className="text-gray-400 hover:text-red-500 p-2"><FaTrash /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-pr/5 p-6 rounded-xl border border-pr/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <FaSitemap className="w-32 h-32 text-pr" />
                </div>
                <h3 className="text-lg font-bold text-pr mb-2">Expression Logique</h3>
                <p className="text-sm text-pr/80 mb-4">Combinez vos conditions avec <code>AND</code>, <code>OR</code> et des parenthèses.</p>
                <input 
                  type="text" 
                  className="w-full bg-white border border-pr/30 rounded-lg p-4 text-xl text-gray-800 font-mono focus:border-pr outline-none shadow-inner"
                  value={ruleData.logicalExpression}
                  onChange={(e) => handleGeneralChange("logicalExpression", e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={() => appendToExpression("AND")} className="bg-white hover:bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded font-mono border border-gray-300">AND</button>
                  <button onClick={() => appendToExpression("OR")} className="bg-white hover:bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded font-mono border border-gray-300">OR</button>
                  <button onClick={() => appendToExpression("(")} className="bg-white hover:bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded font-mono border border-gray-300">(</button>
                  <button onClick={() => appendToExpression(")")} className="bg-white hover:bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded font-mono border border-gray-300">)</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "offers" && (
            <div className="space-y-6">
               {/* SÉLECTEUR DE MÉTHODE DE DISTRIBUTION */}
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-black text-gray-800 mb-4">1. Choisissez la méthode de distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    <div 
                      onClick={() => handleGeneralChange("distributionMethod", "multi_armed_bandit")}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${ruleData.distributionMethod === "multi_armed_bandit" ? "border-purple-500 bg-purple-50 shadow-md" : "border-gray-200 bg-white hover:border-purple-300"}`}
                    >
                      <div className="text-2xl mb-2">🤖</div>
                      <h4 className="font-bold text-gray-800 mb-1">A/B Testing IA</h4>
                    </div>

                    <div 
                      onClick={() => handleGeneralChange("distributionMethod", "weighted_random")}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${ruleData.distributionMethod === "weighted_random" ? "border-orange-500 bg-orange-50 shadow-md" : "border-gray-200 bg-white hover:border-orange-300"}`}
                    >
                      <div className="text-2xl mb-2">🎲</div>
                      <h4 className="font-bold text-gray-800 mb-1">Aléatoire (Pondéré)</h4>
                    </div>

                    <div 
                      onClick={() => handleGeneralChange("distributionMethod", "scenario_journey")}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${ruleData.distributionMethod === "scenario_journey" ? "border-pink-500 bg-pink-50 shadow-md" : "border-gray-200 bg-white hover:border-pink-300"}`}
                    >
                      <div className="text-2xl mb-2">🗺️</div>
                      <h4 className="font-bold text-gray-800 mb-1">Parcours Scénarisé</h4>
                    </div>

                  </div>
                  <div className="mt-4">
                    {ruleData.distributionMethod === "multi_armed_bandit" && <p className="text-purple-600 text-sm font-bold bg-purple-50 p-3 rounded-lg border border-purple-100">💡 <b>Astuce IA</b> : L'IA se chargera de répartir le trafic. Vous n'avez qu'à lister les offres à tester.</p>}
                    {ruleData.distributionMethod === "weighted_random" && <p className="text-orange-600 text-sm font-bold bg-orange-50 p-3 rounded-lg border border-orange-100">💡 <b>Astuce Aléatoire</b> : Indiquez le "% de Distribution" pour chaque offre ci-dessous.</p>}
                    {ruleData.distributionMethod === "scenario_journey" && <p className="text-pink-600 text-sm font-bold bg-pink-50 p-3 rounded-lg border border-pink-100">💡 <b>Astuce Parcours</b> : Liez les offres entre elles en définissant l'action à prendre en cas de succès ou d'échec.</p>}
                    {(!ruleData.distributionMethod || ruleData.distributionMethod === "priority") && <p className="text-gray-600 text-sm font-bold bg-gray-50 p-3 rounded-lg border border-gray-100">💡 Veuillez choisir une méthode de distribution en haut.</p>}
                  </div>
                  <button onClick={addOffer} className="bg-pr hover:opacity-90 text-white px-4 py-2 rounded-lg font-bold flex items-center transition-all shadow-md whitespace-nowrap">
                    <FaPlus className="mr-2"/> Ajouter une offre
                  </button>
               </div>


               
               <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 mt-6 relative shadow-inner overflow-x-auto min-h-[400px]">
                 <h4 className="absolute top-4 left-4 font-black text-gray-400 text-xs tracking-widest uppercase">
                    {ruleData.distributionMethod === "scenario_journey" ? "Arbre Décisionnel" : "Liste des Offres"}
                 </h4>
                 
                 {ruleData.offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-12">
                       <p className="text-gray-500 italic mb-4 font-semibold">Aucune offre. Cliquez sur le + pour commencer.</p>
                       <button onClick={() => addOffer()} className="bg-white hover:bg-pr hover:text-white text-gray-400 font-bold w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 border-dashed border-gray-400 hover:border-pr shadow-sm text-xl"><FaPlus /></button>
                    </div>
                 ) : (
                    ruleData.distributionMethod === "scenario_journey" ? (
                       // Horizontal Tree Rendering
                       <div className="mt-8 flex items-start min-w-max pb-12">
                          {(() => {
                             const rootOffer = ruleData.offers.find(o => o.isRoot) || ruleData.offers[0];
                             return renderScenarioTree(rootOffer.stepId);
                          })()}
                       </div>
                    ) : (
                       // Simple Grid for AI / Random
                       <div className="mt-12 flex flex-wrap gap-4">
                          {ruleData.offers.map((offer, idx) => (
                             <div 
                                key={offer.stepId}
                                onClick={() => setEditingOfferIndex(idx)}
                                className="bg-white border-2 border-gray-200 hover:border-pr hover:shadow-lg cursor-pointer transition-all rounded-xl p-5 w-64 flex flex-col items-center text-center relative group"
                             >
                                <button onClick={(e) => { e.stopPropagation(); removeOfferNode(offer.stepId); }} className="absolute -top-3 -right-3 bg-red-100 text-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-10"><FaTrash size={14} /></button>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 bg-gray-100 px-2 py-1 rounded">Offre {idx + 1}</span>
                                <h4 className="font-black text-gray-800 text-sm">{OFFER_TYPES.find(t => t.value === offer.offerType)?.label || "Offre"}</h4>
                                <p className="text-xs text-gray-500 mt-2 truncate w-full px-2 font-semibold">{offer.notificationTitle || "Sans titre"}</p>
                             </div>
                          ))}
                          <button onClick={() => addOffer()} className="bg-white hover:bg-pr hover:text-white text-gray-400 font-bold w-full h-auto min-h-[120px] rounded-xl flex flex-col items-center justify-center transition-all border-2 border-dashed border-gray-400 hover:border-pr shadow-sm">
                             <FaPlus className="text-2xl mb-2"/>
                             <span className="font-semibold">Ajouter</span>
                          </button>
                       </div>
                    )
                 )}
               </div>


            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-gray-500 text-sm">Assurez-vous d'avoir bien testé la logique de ciblage.</span>
          <div className="flex gap-4">
            <button onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold transition-colors disabled:opacity-50">
              Annuler
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-pr hover:opacity-90 text-white px-8 py-2 rounded-lg font-bold flex items-center shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? "Sauvegarde..." : <><FaSave className="mr-2" /> Sauvegarder la Règle</>}
            </button>
          </div>
        </div>
      </div>

      {/* OFFER EDITOR MODAL */}
      {editingOfferIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-[95vw] max-w-4xl max-h-[95vh] flex flex-col overflow-hidden relative border border-gray-200">
            <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <h3 className="text-xl font-black text-gray-800 flex items-center">
                <FaGift className="mr-3 text-pr" />
                Éditer l'offre {editingOfferIndex + 1}
              </h3>
              <button onClick={() => setEditingOfferIndex(null)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                 const idx = editingOfferIndex;
                 const offer = ruleData.offers[idx];
                 if (!offer) return null;
                 return (
                   <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 transition-all">
                                           <div className="mb-4 mt-2">
                         <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Type d'offre</label>
                              <select 
                                className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr font-bold"
                                value={offer.offerType}
                                onChange={(e) => handleOfferChange(idx, "offerType", e.target.value)}
                              >
                                {OFFER_TYPES.map(ot => <option key={ot.value} value={ot.value}>{ot.label}</option>)}
                              </select>
                           </div>
                           
                           {/* STANDARD OFFERS */}
                           {["discount_order", "bonus_basket", "loyalty_points", "discount_category", "discount_product"].includes(offer.offerType) && (
                             <div className="flex gap-2">
                               {offer.offerType === "discount_category" && (
                                 <div className="w-1/3">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Catégorie Ciblée</label>
                                    <SearchablePicker
                                      value={offer.targetCategory}
                                      options={categories}
                                      onChange={(v) => handleOfferChange(idx, "targetCategory", v)}
                                      placeholder="Sélectionner une catégorie"
                                    />
                                 </div>
                               )}
                               {offer.offerType === "discount_product" && (
                                 <div className="w-1/3">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Produit Ciblé</label>
                                    <SearchablePicker
                                      value={offer.targetMenuItem}
                                      options={menuItems}
                                      onChange={(v) => handleOfferChange(idx, "targetMenuItem", v)}
                                      placeholder="Sélectionner un produit"
                                    />
                                 </div>
                               )}
                               <div className={["discount_category", "discount_product"].includes(offer.offerType) ? "w-1/3" : "w-1/2"}>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Valeur / Rabais</label>
                                  <input 
                                    type="number" 
                                    className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                                    value={offer.discountValue || ""}
                                    onChange={(e) => handleOfferChange(idx, "discountValue", Number(e.target.value))}
                                  />
                               </div>
                               <div className={["discount_category", "discount_product"].includes(offer.offerType) ? "w-1/3" : "w-1/2"}>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Seuil ($)</label>
                                  <input 
                                    type="number" 
                                    className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                                    value={offer.bonusThreshold || ""}
                                    onChange={(e) => handleOfferChange(idx, "bonusThreshold", Number(e.target.value))}
                                  />
                               </div>
                             </div>
                           )}

                           {/* CATÉGORIES EXCLUES — toute offre qui remise le panier (cashback : sa récompense) */}
                           {["discount_order", "split_discount", "bonus_basket", "tiered_discount", "deferred_cashback"].includes(offer.offerType) && (
                             <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                               <label className="block text-sm font-bold text-gray-700 mb-1">
                                 {offer.offerType === "deferred_cashback" ? "Catégories exclues du rabais à venir" : "Catégories exclues du rabais"}
                               </label>
                               <p className="text-[10px] text-gray-500 mb-3">
                                 {offer.offerType === "deferred_cashback"
                                   ? "Quand le client utilisera son rabais (commande suivante), les articles de ces catégories ne seront pas remisés. Le seuil de la commande qui débloque le cashback n'est pas concerné."
                                   : "Les articles de ces catégories ne sont pas remisés. Si le panier ne contient que des articles exclus, aucun rabais n'est appliqué."}
                               </p>
                               <div className="flex flex-wrap gap-2">
                                 {categories.map((cat) => {
                                   const excluded = (offer.excludedCategories || []).map((c) => String(c?._id || c));
                                   const isExcluded = excluded.includes(String(cat._id));
                                   return (
                                     <button
                                       key={cat._id}
                                       type="button"
                                       onClick={() =>
                                         handleOfferChange(
                                           idx,
                                           "excludedCategories",
                                           isExcluded
                                             ? excluded.filter((id) => id !== String(cat._id))
                                             : [...excluded, String(cat._id)],
                                         )
                                       }
                                       className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                         isExcluded
                                           ? "bg-red-500 border-red-500 text-white"
                                           : "bg-white border-gray-300 text-gray-600 hover:border-red-300"
                                       }`}
                                     >
                                       {isExcluded ? "✕ " : ""}{cat.name}
                                     </button>
                                   );
                                 })}
                                 {categories.length === 0 && <div className="text-xs text-gray-400">Aucune catégorie chargée.</div>}
                               </div>
                             </div>
                           )}

                           {/* FREE ITEM (ARTICLE GRATUIT) */}
                           {offer.offerType === "free_item" && (
                             <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                               <div className="flex justify-between items-center mb-4">
                                 <label className="block text-sm font-bold text-gray-700">Options d'Article Gratuit</label>
                               </div>
                               
                               <div className="mb-4">
                                 <label className="block text-xs font-bold text-gray-600 mb-1">Seuil ($)</label>
                                 <input 
                                   type="number" 
                                   className="w-1/3 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                                   value={offer.bonusThreshold || ""}
                                   onChange={(e) => handleOfferChange(idx, "bonusThreshold", Number(e.target.value))}
                                 />
                               </div>

                               <div className="flex justify-between items-center mb-2">
                                 <label className="block text-xs font-bold text-gray-700">Articles au choix</label>
                                 <button 
                                   onClick={() => {
                                     const arr = offer.freeItems || [];
                                     handleOfferChange(idx, "freeItems", [...arr, { item: "", size: "" }]);
                                   }} 
                                   className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded font-bold"
                                 >
                                   + Ajouter Article
                                 </button>
                               </div>
                               
                               <div className="space-y-2">
                                 {(!offer.freeItems || offer.freeItems.length === 0) && <div className="text-xs text-gray-400">Aucun article défini. Le client ne verra aucun choix.</div>}
                                 {offer.freeItems?.map((fi, fIdx) => {
                                   const selectedItem = menuItems.find(mi => mi._id === fi.item);
                                   const availableSizes = selectedItem?.prices?.map(p => p.size).filter(Boolean) || [];
                                   return (
                                     <div key={fIdx} className="flex flex-col gap-2 bg-white border border-gray-200 rounded-lg p-3">
                                       <SearchablePicker
                                         value={fi.item}
                                         options={menuItems}
                                         onChange={(v) => {
                                           const arr = [...(offer.freeItems || [])];
                                           arr[fIdx] = { ...arr[fIdx], item: v, size: "" };
                                           handleOfferChange(idx, "freeItems", arr);
                                         }}
                                         placeholder="Sélectionner un article"
                                       />
                                       <div className="flex items-center gap-2">
                                       <select
                                         className="flex-1 min-w-0 bg-white border border-gray-300 rounded p-2 text-sm outline-none focus:border-pr"
                                         value={fi.size || ""}
                                         onChange={(e) => {
                                           const arr = [...(offer.freeItems || [])];
                                           arr[fIdx] = { ...arr[fIdx], size: e.target.value };
                                           handleOfferChange(idx, "freeItems", arr);
                                         }}
                                       >
                                         <option value="">-- Taille --</option>
                                         {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                       </select>
                                       <button 
                                         onClick={() => {
                                           const arr = (offer.freeItems || []).filter((_, i) => i !== fIdx);
                                           handleOfferChange(idx, "freeItems", arr);
                                         }} 
                                         className="text-red-400 hover:text-red-600 p-2 shrink-0"
                                         title="Retirer cet article"
                                       >
                                         <FaTrash />
                                       </button>
                                       </div>
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>
                           )}

                           {/* BOGO (1 ACHETÉ = 1 OFFERT) */}
                           {offer.offerType === "buy_one_get_one" && (
                             <div className="flex flex-col gap-4 bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                               <div className="flex justify-between items-center">
                                 <label className="block text-sm font-bold text-gray-700">1 acheté = 1 offert (BOGO)</label>
                               </div>
                               <div className="flex flex-col sm:flex-row gap-4">
                                 {/* Trigger Item (L'article à acheter) */}
                                 <div className="flex-1 bg-white p-3 rounded-lg border border-gray-300">
                                   <label className="block text-xs font-bold text-gray-600 mb-2">Article à acheter (Déclencheur)</label>
                                   <SearchablePicker
                                     value={offer.triggerItem}
                                     options={menuItems}
                                     onChange={(v) => { handleOfferChange(idx, "triggerItem", v); handleOfferChange(idx, "triggerItemSize", ""); }}
                                     placeholder="-- Sélectionner l'article --"
                                   />
                                   {(() => {
                                     const selectedItem = menuItems.find(mi => mi._id === offer.triggerItem);
                                     const availableSizes = selectedItem?.prices?.map(p => p.size).filter(Boolean) || [];
                                     if (availableSizes.length > 0) {
                                       return (
                                         <div className="mt-3">
                                           <label className="block text-xs font-bold text-gray-600 mb-1">Taille exigée (Optionnel)</label>
                                           <select
                                             className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none"
                                             value={offer.triggerItemSize || ""}
                                             onChange={(e) => handleOfferChange(idx, "triggerItemSize", e.target.value)}
                                           >
                                             <option value="">-- N'importe laquelle --</option>
                                             {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                           </select>
                                         </div>
                                       );
                                     }
                                     return null;
                                   })()}
                                 </div>
                                 {/* Free Item (L'article offert) */}
                                 <div className="flex-1 bg-white p-3 rounded-lg border border-gray-300">
                                   <label className="block text-xs font-bold text-gray-600 mb-2">Article offert (Cadeau)</label>
                                   <SearchablePicker
                                     value={offer.freeItem}
                                     options={menuItems}
                                     onChange={(v) => { handleOfferChange(idx, "freeItem", v); handleOfferChange(idx, "giftItemSize", ""); }}
                                     placeholder="-- Sélectionner l'article --"
                                   />
                                   {(() => {
                                     const selectedItem = menuItems.find(mi => mi._id === offer.freeItem);
                                     const availableSizes = selectedItem?.prices?.map(p => p.size).filter(Boolean) || [];
                                     if (availableSizes.length > 0) {
                                       return (
                                         <div className="mt-3">
                                           <label className="block text-xs font-bold text-gray-600 mb-1">Taille offerte (Optionnel)</label>
                                           <select
                                             className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none"
                                             value={offer.giftItemSize || ""}
                                             onChange={(e) => handleOfferChange(idx, "giftItemSize", e.target.value)}
                                           >
                                             <option value="">-- Taille par défaut --</option>
                                             {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                                           </select>
                                         </div>
                                       );
                                     }
                                     return null;
                                   })()}
                                 </div>
                               </div>
                             </div>
                           )}

                           {/* SPLIT DISCOUNT (RABAIS DIVISÉ) */}
                           {offer.offerType === "split_discount" && (
                             <div className="mb-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
                               <div className="flex justify-between items-center mb-2">
                                 <label className="block text-sm font-bold text-gray-700">Rabais divisé (Séquence de commandes)</label>
                                 <button 
                                   onClick={() => {
                                     const currentSteps = offer.discountSteps || [];
                                     handleOfferChange(idx, "discountSteps", [...currentSteps, 10]);
                                   }} 
                                   className="text-xs bg-teal-200 hover:bg-teal-300 text-teal-800 px-2 py-1 rounded font-bold"
                                 >
                                   + Ajouter Commande
                                 </button>
                               </div>
                               <p className="text-[10px] text-gray-500 mb-3">
                                 Définissez le pourcentage de réduction pour chaque commande consécutive (ex: 20% à la 1ère, 15% à la 2ème, 10% à la 3ème).
                               </p>
                               <div className="space-y-2">
                                 {(!offer.discountSteps || offer.discountSteps.length === 0) && <div className="text-xs text-gray-400">Aucune réduction définie.</div>}
                                 {offer.discountSteps?.map((stepDiscount, stepIdx) => (
                                   <div key={stepIdx} className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-teal-700 w-24">Commande {stepIdx + 1}</span>
                                      <input 
                                        type="number" placeholder="Rabais (%)"
                                        className="w-32 bg-white border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-teal-500"
                                        value={stepDiscount || ""}
                                        onChange={(e) => {
                                          const newSteps = [...offer.discountSteps];
                                          newSteps[stepIdx] = Number(e.target.value);
                                          handleOfferChange(idx, "discountSteps", newSteps);
                                        }}
                                      />
                                      <span className="text-xs font-bold text-gray-500">%</span>
                                      <button 
                                        onClick={() => {
                                          const newSteps = offer.discountSteps.filter((_, i) => i !== stepIdx);
                                          handleOfferChange(idx, "discountSteps", newSteps);
                                        }} 
                                        className="text-red-400 hover:text-red-600 ml-2"
                                      >
                                        <FaTrash />
                                      </button>
                                   </div>
                                 ))}
                               </div>
                               <div className="mt-4 pt-3 border-t border-teal-200">
                                 <label className="block text-xs font-bold text-gray-700 mb-1">
                                   Délai max entre deux commandes (jours)
                                 </label>
                                 <div className="flex items-center gap-2">
                                   <input
                                     type="number" min="1" placeholder="7"
                                     className="w-24 bg-white border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-teal-500"
                                     value={offer.followupValidityDays ?? ""}
                                     onChange={(e) => handleOfferChange(idx, "followupValidityDays", e.target.value === "" ? undefined : Math.max(1, Number(e.target.value)))}
                                   />
                                   <span className="text-xs text-gray-500">jours</span>
                                 </div>
                                 <p className="text-[10px] text-gray-500 mt-1">
                                   Après chaque commande, le client a ce délai pour passer la suivante. Passé ce délai, les rabais restants sont perdus. 7 jours si vide.
                                 </p>
                               </div>
                             </div>
                           )}

                           {/* DEFERRED CASHBACK */}
                           {offer.offerType === "deferred_cashback" && (
                             <div className="flex flex-wrap gap-2">
                               <div className="w-[30%]">
                                  <label className="block text-xs font-bold text-gray-600 mb-1 text-blue-600">Seuil Achat Aujourd'hui</label>
                                  <input 
                                    type="number" placeholder="Ex: 35"
                                    className="w-full bg-blue-50 border border-blue-200 rounded p-2 text-gray-800 text-sm outline-none focus:border-blue-500"
                                    value={offer.deferredThreshold || ""}
                                    onChange={(e) => handleOfferChange(idx, "deferredThreshold", Number(e.target.value))}
                                  />
                               </div>
                               <div className="w-[30%]">
                                  <label className="block text-xs font-bold text-gray-600 mb-1 text-green-600">Valeur Cashback (%)</label>
                                  <input 
                                    type="number" placeholder="Ex: 15"
                                    className="w-full bg-green-50 border border-green-200 rounded p-2 text-gray-800 text-sm outline-none focus:border-green-500"
                                    value={offer.deferredDiscountValue || ""}
                                    onChange={(e) => handleOfferChange(idx, "deferredDiscountValue", Number(e.target.value))}
                                  />
                               </div>
                               <div className="w-[30%]">
                                  <label className="block text-xs font-bold text-gray-600 mb-1 text-orange-600">Validité (Jours)</label>
                                  <input 
                                    type="number" placeholder="Ex: 7"
                                    className="w-full bg-orange-50 border border-orange-200 rounded p-2 text-gray-800 text-sm outline-none focus:border-orange-500"
                                    value={offer.deferredValidityDays || ""}
                                    onChange={(e) => handleOfferChange(idx, "deferredValidityDays", Number(e.target.value))}
                                  />
                               </div>
                               <div className="w-full mt-2">
                                  <label className="block text-xs font-bold text-gray-600 mb-1 text-indigo-600">Jour / Période de Déblocage du Cashback (Cadenas)</label>
                                  <select 
                                    className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-gray-800 text-sm outline-none focus:border-indigo-500 font-bold"
                                    value={offer.deferredActivationRule || "immediate"}
                                    onChange={(e) => handleOfferChange(idx, "deferredActivationRule", e.target.value)}
                                  >
                                    <option value="immediate">⚡ Immédiatement (Dès la commande passée)</option>
                                    <option value="next_weekend">🎉 Prochain Week-end (Déblocage Samedi 11h00)</option>
                                    <option value="next_monday">📅 Lundi (Déblocage Lundi 11h00)</option>
                                    <option value="next_tuesday">📅 Mardi (Déblocage Mardi 11h00 - Booster début de semaine)</option>
                                    <option value="next_wednesday">📅 Mercredi (Déblocage Mercredi 11h00)</option>
                                    <option value="next_thursday">📅 Jeudi (Déblocage Jeudi 11h00)</option>
                                    <option value="next_friday">📅 Vendredi (Déblocage Vendredi 11h00)</option>
                                    <option value="next_saturday">📅 Samedi (Déblocage Samedi 11h00)</option>
                                    <option value="next_sunday">📅 Dimanche (Déblocage Dimanche 11h00)</option>
                                  </select>
                               </div>
                             </div>
                           )}

                           {/* MYSTERY GIFT */}
                           {offer.offerType === "mystery_gift" && (
                             <div className="flex flex-col gap-4">
                               <div className="w-full">
                                  <label className="block text-xs font-bold text-gray-600 mb-1 text-purple-600">Seuil pour débloquer ($)</label>
                                  <input 
                                    type="number" placeholder="Ex: 40"
                                    className="w-full bg-purple-50 border border-purple-200 rounded p-2 text-gray-800 text-sm outline-none focus:border-purple-500"
                                    value={offer.mysteryThreshold || ""}
                                    onChange={(e) => handleOfferChange(idx, "mysteryThreshold", Number(e.target.value))}
                                  />
                               </div>

                               <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Article Réel (Liaison au Menu)</label>
                                 <div className="relative">
                                   <div 
                                     className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm cursor-pointer flex justify-between items-center"
                                     onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                                   >
                                     <span>{menuItems.find(mi => mi._id === offer.freeItem)?.name || "-- Sélectionner l'article --"}</span>
                                     <FaArrowDown className="text-gray-400 text-xs" />
                                   </div>

                                   {openDropdownIdx === idx && (
                                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                       <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                                         <input 
                                           type="text" 
                                           placeholder="Rechercher un article..." 
                                           className="w-full p-2 rounded border border-gray-300 text-sm outline-none"
                                           value={menuSearch}
                                           onChange={(e) => setMenuSearch(e.target.value)}
                                           onClick={(e) => e.stopPropagation()}
                                         />
                                       </div>
                                       <div>
                                         {menuItems.filter(mi => mi.name.toLowerCase().includes(menuSearch.toLowerCase())).map(mi => (
                                           <div 
                                             key={mi._id} 
                                             className="p-2 hover:bg-purple-50 cursor-pointer text-sm"
                                             onClick={() => {
                                               handleOfferChange(idx, "freeItem", mi._id);
                                               handleOfferChange(idx, "giftItemSize", "");
                                               setOpenDropdownIdx(null);
                                             }}
                                           >
                                             {mi.name}
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>

                                 {(() => {
                                   const selectedItem = menuItems.find(mi => mi._id === offer.freeItem);
                                   const availableSizes = selectedItem?.prices?.map(p => p.size).filter(Boolean) || [];
                                   if (!selectedItem) return null;
                                   if (availableSizes.length > 0) {
                                     return (
                                       <div className="mt-3">
                                         <label className="block text-xs font-bold text-gray-600 mb-1">Taille (Optionnel)</label>
                                         <select
                                           className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none"
                                           value={offer.giftItemSize || ""}
                                           onChange={(e) => handleOfferChange(idx, "giftItemSize", e.target.value)}
                                         >
                                           <option value="">-- Aucune (Laisse le client choisir) --</option>
                                           {availableSizes.map(size => (
                                             <option key={size} value={size}>{size}</option>
                                           ))}
                                         </select>
                                       </div>
                                     );
                                   } else {
                                     return (
                                       <div className="mt-3 text-xs text-gray-500 italic">
                                         Cet article n'a pas de tailles configurées.
                                       </div>
                                     );
                                   }
                                 })()}
                               </div>
                             </div>
                           )}
                         </div>

                         {/* TIERED DISCOUNT */}
                         {offer.offerType === "tiered_discount" && (
                           <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                             <div className="flex justify-between items-center mb-2">
                               <label className="block text-sm font-bold text-gray-700">Paliers de Réduction</label>
                               <button onClick={() => addTier(idx)} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded font-bold">+ Ajouter Palier</button>
                             </div>
                             <div className="space-y-2">
                               {(!offer.tieredDiscounts || offer.tieredDiscounts.length === 0) && <div className="text-xs text-gray-400">Aucun palier défini.</div>}
                               {offer.tieredDiscounts?.map((tier, tIdx) => (
                                 <div key={tIdx} className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400">Niv {tIdx+1}</span>
                                    <input 
                                      type="number" placeholder="Seuil ($) ex: 20"
                                      className="w-1/3 bg-white border border-gray-300 rounded p-1 text-sm outline-none"
                                      value={tier.threshold || ""}
                                      onChange={(e) => handleTierChange(idx, tIdx, "threshold", Number(e.target.value))}
                                    />
                                    <span className="text-xs text-gray-500">➔ Rabais:</span>
                                    <input 
                                      type="number" placeholder="Rabais (%) ex: 10"
                                      className="w-1/3 bg-white border border-gray-300 rounded p-1 text-sm outline-none"
                                      value={tier.discountValue || ""}
                                      onChange={(e) => handleTierChange(idx, tIdx, "discountValue", Number(e.target.value))}
                                    />
                                    <button onClick={() => removeTier(idx, tIdx)} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Titre de notification</label>
                            <input 
                              type="text" 
                              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                              value={offer.notificationTitle}
                              onChange={(e) => handleOfferChange(idx, "notificationTitle", e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Corps de notification</label>
                            <input 
                              type="text" 
                              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                              value={offer.notificationBody}
                              onChange={(e) => handleOfferChange(idx, "notificationBody", e.target.value)}
                            />
                         </div>
                      </div>

                      <div className="mb-4">
                         <label className="block text-xs font-bold text-gray-600 mb-2">Jours d'envoi de la Notification (Optionnel)</label>
                         <p className="text-[10px] text-gray-500 mb-2">Si coché, l'offre attendra ce jour-là pour s'activer et notifier le client (ex: Ciblez les mardis).</p>
                         <div className="flex flex-wrap gap-2">
                           {[
                             { label: "Dim", val: 0 }, { label: "Lun", val: 1 }, { label: "Mar", val: 2 },
                             { label: "Mer", val: 3 }, { label: "Jeu", val: 4 }, { label: "Ven", val: 5 }, { label: "Sam", val: 6 }
                           ].map(day => {
                             const isSelected = (offer.notifyOnDays || []).includes(day.val);
                             return (
                               <button
                                 key={day.val}
                                 onClick={() => handleDayToggle(idx, day.val)}
                                 className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${isSelected ? 'bg-pr text-white border-pr' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                               >
                                 {day.label}
                               </button>
                             );
                           })}
                         </div>
                      </div>

                      <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                         <label className="block text-xs font-bold text-gray-600 mb-2">Heure d'envoi de la Notification (Optionnel)</label>
                         <p className="text-[10px] text-gray-500 mb-2">L'heure exacte d'envoi (Heure de Montréal). Si vide, le système l'enverra à l'heure d'achat préférée du client.</p>
                         <select 
                            className="w-1/3 bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr font-bold"
                            value={offer.notifyAtHour !== undefined && offer.notifyAtHour !== null ? offer.notifyAtHour : ""}
                            onChange={(e) => handleOfferChange(idx, "notifyAtHour", e.target.value !== "" ? Number(e.target.value) : null)}
                         >
                            <option value="">Automatique (IA Profiling)</option>
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}h00</option>
                            ))}
                         </select>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Validité (Heures)</label>
                            <input 
                              type="number" 
                              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                              value={offer.validityHours || 48}
                              onChange={(e) => handleOfferChange(idx, "validityHours", Number(e.target.value))}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cooldown (Jours)</label>
                            <input 
                              type="number" 
                              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                              value={offer.cooldownDays !== undefined ? offer.cooldownDays : 7}
                              onChange={(e) => handleOfferChange(idx, "cooldownDays", Number(e.target.value))}
                            />
                         </div>
                         {ruleData.distributionMethod === "weighted_random" && (
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">% de Distribution</label>
                              <input 
                                type="number" 
                                className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 text-sm outline-none focus:border-pr"
                                value={offer.weight ?? ""}
                                onChange={(e) => handleOfferChange(idx, "weight", e.target.value === "" ? 0 : Number(e.target.value))}
                              />
                           </div>
                         )}
                      </div>



                   </div>
                 );
              })()}
            </div>
            <div className="bg-white p-4 border-t border-gray-200 flex justify-end sticky bottom-0">
               <button onClick={() => setEditingOfferIndex(null)} className="bg-pr hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center">
                 <FaSave className="mr-2" />
                 Terminer l'édition
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
