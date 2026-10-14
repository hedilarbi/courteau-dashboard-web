"use client";

import React, { createContext, useContext, useReducer } from "react";

const initialState = {
  ruleId: null,
  currentStep: 1,
  // Etape 1: Objectif
  track: "Persuasion", // Par défaut Persuasion
  ruleName: "Persuasion — Sauvetage article — Sensible au prix",
  nameIsCustomized: false,
  // Etape 2: Quand
  triggerEvent: "state_change",
  selectedStates: ["Sensible au prix"], // Multi-sélection avec OU implicite
  conditions: {
    operator: "AND",
    cart: {
      minTotal: 0,
      maxTotal: "",
      minItems: 1,
      missingCategories: [],
      requiredCategories: [],
      cartRatioVsHabit: "any",
      itemRemovedAfterTotal: true,
      sizeDowngraded: false,
    },
    behavior: {
      inactivitySeconds: 30,
      sessionDurationMin: 0,
      oscillationsMin: 0,
      cartCheckoutExit: false,
      promoCodeFailed: false,
    },
    context: {
      timeSlot: "all",
      customStartTime: "",
      customEndTime: "",
      daysOfWeek: [],
      orderType: "all",
      channel: "all",
      weather: "all",
    },
    rules: [],
  },
  // Etape 3: Qui
  hasProfileFilter: false,
  profileConditions: {
    operator: "AND",
    rules: [],
  },
  // Etape 4: Quoi
  offer: {
    mechanic: "rescue", // Sauvetage d'article par défaut
    targetType: "cart",
    thresholdType: "fixed",
    thresholdValue: 0,
    thresholdCeiling: 0,
    valueType: "discount_amount",
    value: 2,
    distribution: "single",
  },
  // Etape 5: Où et combien de temps
  location: "checkout",
  validityDuration: "15min", // Recommandé: 15 min avec chrono pour Persuasion
  showTimer: true, // Lié au chronomètre visuel
  content: {
    title: "",
    text: "",
    buttonLabel: "",
    image: "",
  },
  // Etape 6: Garde-fous
  safeguards: {
    maxPerSession: 1,
    maxPerDay: 2,
    maxPerWeek: 2, // Recommandé: 2 en persuasion (plafond anti-fatigue)
    delayAfterRefusal: 24, // heures
    controlGroupPct: 10,
    triggerRate: 50, // Recommandé: 50 % pour Persuasion (anti-dressage)
    maxBudgetDaily: null, // Budget max par jour ($)
    maxBudgetTotal: null, // Budget max total ($)
    maxDiscountPct: 15, // Rabais maximum en % du panier (défaut 15 %)
    startDate: "",
    endDate: "",
    priority: 90,
  }
};

// Map des valeurs par défaut selon la Piste choisie
const TRACK_DEFAULTS = {
  "Persuasion": {
    ruleName: "Persuasion — Sauvetage article — Sensible au prix",
    triggerEvent: "state_change",
    selectedStates: ["Sensible au prix"],
    mechanic: "rescue",
    validityDuration: "15min",
    showTimer: true,
    safeguards: {
      triggerRate: 50, // Anti-dressage : 50%
      maxPerWeek: 2,   // Plafond anti-fatigue
      maxDiscountPct: 15,
      priority: 90,
    },
  },
  "Expansion": {
    ruleName: "Expansion — Compléter la commande",
    triggerEvent: "checkout_click",
    selectedStates: ["Décidé"],
    mechanic: "fixed_price",
    validityDuration: "session",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 3,
      maxDiscountPct: 20,
      priority: 70,
    },
  },
  "Fidélisation": {
    ruleName: "Fidélisation — 5 $ offerts sur prochaine commande",
    triggerEvent: "order_confirmed",
    selectedStates: ["Satisfait"],
    mechanic: "cashback",
    validityDuration: "7_days",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 2,
      maxDiscountPct: 15,
      priority: 40,
    },
  },
  "Contexte": {
    ruleName: "Contexte — Offre spéciale heure creuse",
    triggerEvent: "session_start",
    selectedStates: ["Indécis"],
    mechanic: "fixed_price",
    validityDuration: "session",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 3,
      maxDiscountPct: 15,
      priority: 30,
    },
  },
  "Mix produit": {
    ruleName: "Mix produit — Mettre en avant une catégorie",
    triggerEvent: "category_view",
    selectedStates: ["Indécis"],
    mechanic: "fixed_price",
    validityDuration: "session",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 3,
      maxDiscountPct: 15,
      priority: 50,
    },
  },
  "Service": {
    ruleName: "Service — Aide proactive",
    triggerEvent: "inactivity",
    selectedStates: ["Frustré"],
    mechanic: "message_only",
    validityDuration: "session",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 5,
      maxDiscountPct: 0,
      priority: 80,
    },
  },
  "Réactivation": {
    ruleName: "Réactivation — Retour d'un ancien client",
    triggerEvent: "session_start",
    selectedStates: ["Sur le départ"],
    mechanic: "cashback",
    validityDuration: "7_days",
    showTimer: false,
    safeguards: {
      triggerRate: 100,
      maxPerWeek: 1,
      maxDiscountPct: 15,
      priority: 60,
    },
  },
};

function wizardReducer(state, action) {
  switch (action.type) {
    case "LOAD_RULE":
      return {
        ...initialState,
        ...action.payload,
        ruleId: action.payload._id || action.payload.ruleId || null,
        currentStep: 1,
        nameIsCustomized: true,
        conditions: { ...initialState.conditions, ...(action.payload.conditions || {}) },
        profileConditions: { ...initialState.profileConditions, ...(action.payload.profileConditions || {}) },
        offer: { ...initialState.offer, ...(action.payload.offer || {}) },
        content: { ...initialState.content, ...(action.payload.content || {}) },
        safeguards: { ...initialState.safeguards, ...(action.payload.safeguards || {}) },
      };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_TRACK": {
      const trackName = action.payload;
      const defaults = TRACK_DEFAULTS[trackName] || {};
      const newRuleName = !state.nameIsCustomized ? (defaults.ruleName || state.ruleName) : state.ruleName;
      return {
        ...state,
        track: trackName,
        ruleName: newRuleName,
        triggerEvent: defaults.triggerEvent || state.triggerEvent,
        selectedStates: defaults.selectedStates || state.selectedStates || [],
        validityDuration: defaults.validityDuration || state.validityDuration,
        showTimer: defaults.showTimer !== undefined ? defaults.showTimer : state.showTimer,
        offer: {
          ...state.offer,
          mechanic: defaults.mechanic || state.offer.mechanic
        },
        safeguards: {
          ...state.safeguards,
          ...(defaults.safeguards || {}),
        }
      };
    }
    case "TOGGLE_STATE": {
      const stateItem = action.payload;
      const current = state.selectedStates || [];
      const updated = current.includes(stateItem)
        ? current.filter((s) => s !== stateItem)
        : [...current, stateItem];
      // Ne pas laisser vide
      const finalStates = updated.length > 0 ? updated : [stateItem];
      
      let newRuleName = state.ruleName;
      if (!state.nameIsCustomized && state.track === "Persuasion") {
        newRuleName = `Persuasion — Sauvetage article — ${finalStates.join(" ou ")}`;
      }
      return {
        ...state,
        selectedStates: finalStates,
        ruleName: newRuleName
      };
    }
    case "SET_MECHANIC": {
      const mechId = action.payload;
      let newRuleName = state.ruleName;
      if (!state.nameIsCustomized) {
        const stateStr = (state.selectedStates && state.selectedStates.length) ? state.selectedStates.join(" ou ") : "Sensible au prix";
        const mechLabels = {
          rescue: "Sauvetage article",
          fixed_price: "Prix fixe",
          free_item_threshold: "Article offert",
          cashback: "Cashback différé",
          bogo: "2e article réduit",
          message_only: "Message d'aide",
        };
        const mechLabel = mechLabels[mechId] || mechId;
        newRuleName = `${state.track || "Persuasion"} — ${mechLabel} — ${stateStr}`;
      }
      return {
        ...state,
        ruleName: newRuleName,
        offer: {
          ...state.offer,
          mechanic: mechId,
        },
      };
    }
    case "UPDATE_FIELD": {
      const { path, value } = action.payload;
      const isCustomizingName = path === "ruleName";
      const keys = path.split(".");
      if (keys.length === 1) {
        return {
          ...state,
          [keys[0]]: value,
          ...(isCustomizingName ? { nameIsCustomized: true } : {})
        };
      } else {
        const topKey = keys[0];
        const subKey = keys[1];
        return {
          ...state,
          [topKey]: {
            ...state[topKey],
            [subKey]: value
          }
        };
      }
    }
    case "UPDATE_NESTED_FIELD": {
      const { root, field, val } = action.payload;
      return {
        ...state,
        [root]: {
          ...state[root],
          [field]: val
        }
      };
    }
    case "UPDATE_CONDITION_FAMILY": {
      const { family, field, val } = action.payload;
      const behavior = family === "behavior"
        ? { ...(state.conditions?.behavior || {}), [field]: val }
        : state.conditions?.behavior || {};
      const requiresDirectBehaviorTrigger = family === "behavior" && (
        (field === "inactivitySeconds" && Number(val) === 0 && Number(behavior.oscillationsMin) > 0) ||
        (field === "oscillationsMin" && Number(val) > 0 && Number(behavior.inactivitySeconds) === 0)
      );
      return {
        ...state,
        ...(requiresDirectBehaviorTrigger && state.triggerEvent === "inactivity" ? { triggerEvent: "state_change" } : {}),
        conditions: {
          ...state.conditions,
          [family]: {
            ...(state.conditions?.[family] || {}),
            [field]: val
          }
        }
      };
    }
    default:
      return state;
  }
}

const WizardContext = createContext();

export function WizardProvider({ children, initialRule = null }) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    initialRule,
    (rule) => rule ? wizardReducer(initialState, { type: "LOAD_RULE", payload: rule }) : initialState,
  );

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
