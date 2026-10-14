"use client";

import React from "react";
import { useWizard } from "../WizardContext";

const LOCATIONS = [
  { id: "home", label: "Accueil" },
  { id: "category", label: "Page catégorie" },
  { id: "product", label: "Fiche produit" },
  { id: "cart_banner", label: "Bannière panier" },
  { id: "checkout", label: "Feuille checkout" },
  { id: "confirmation", label: "Écran de confirmation" },
  { id: "in_app", label: "Partout dans l’app" },
];

const LOCATION_LABELS = Object.fromEntries(LOCATIONS.map(({ id, label }) => [id, label]));

function getDynamicDefaults(state) {
  const mechanic = state.offer?.mechanic || "rescue";
  switch (mechanic) {
    case "rescue":
      return {
        title: "Garde ta poutine — 2 $ de moins",
        text: "Offre valable pendant 10 min pour conserver votre poutine Classique.",
        buttonLabel: "Garder pour 2 $ de moins",
      };
    case "free_delivery":
      return {
        title: "Livraison offerte sur ce panier",
        text: "Finalisez votre commande maintenant pour en profiter sans frais.",
        buttonLabel: "Profiter de la livraison gratuite",
      };
    case "free_item":
      return {
        title: "Poutine format régulier offerte",
        text: "Ajoutez un plat principal et recevez un accompagnement offert.",
        buttonLabel: "Ajouter à ma commande",
      };
    case "fixed_discount":
    case "discount_percent":
      return {
        title: "Rabais instantané de 15 %",
        text: "Ne laissez pas refroidir votre commande : profitez de −15 % immédiatement.",
        buttonLabel: "Appliquer −15 %",
      };
    case "cashback":
      return {
        title: "5 $ crédités sur votre prochaine commande",
        text: "Validez maintenant et recevez 5 $ applicables durant 7 jours.",
        buttonLabel: "Activer mes 5 $",
      };
    default:
      if (state.track === "Persuasion") {
        return {
          title: "Garde ta poutine — 2 $ de moins",
          text: "Offre flash active pendant 10 min sur votre panier en cours.",
          buttonLabel: "Garder mon article",
        };
      }
      return {
        title: "Offre spéciale Le Courteau",
        text: "Profitez de cette offre exclusive valable sur votre commande en cours.",
        buttonLabel: "En profiter",
      };
  }
}

export default function Step5Where() {
  const { state, dispatch } = useWizard();

  const handleLocationChange = (locId) => {
    dispatch({ type: "UPDATE_FIELD", payload: { path: "location", value: locId } });
  };

  const handleNext = () => dispatch({ type: "SET_STEP", payload: 6 });
  const handleBack = () => dispatch({ type: "SET_STEP", payload: 4 });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Où et combien de temps ?</h2>
        <p className="text-gray-500 mt-2">
          Définissez l&apos;emplacement d&apos;affichage et la personnalisation visuelle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Formulaire de configuration */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-3">Emplacement</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => {
                const isSelected = state.location === loc.id;
                
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => handleLocationChange(loc.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium border transition-colors
                      ${isSelected ? "bg-pr text-white border-pr" : "bg-white text-gray-700 border-gray-200"}
                      hover:border-pr
                    `}
                  >
                    {loc.label}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Durée de validité</label>
              <select 
                value={state.validityDuration || "15min"}
                onChange={(e) => dispatch({ type: "UPDATE_FIELD", payload: { path: "validityDuration", value: e.target.value } })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white text-sm font-medium"
              >
                <option value="15min">15 min avec chrono (Recommandé en Persuasion)</option>
                <option value="10min">10 min (Flash)</option>
                <option value="30min">30 min</option>
                <option value="session">Fin de session</option>
                <option value="24h">24 h</option>
                <option value="48h">48 h</option>
                <option value="7_days">7 jours</option>
                <option value="weekend">Jusqu&apos;à dimanche</option>
              </select>
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={Boolean(state.showTimer)}
                  onChange={(e) => dispatch({ type: "UPDATE_FIELD", payload: { path: "showTimer", value: e.target.checked } })}
                  className="rounded text-pr w-4 h-4" 
                />
                <span className="text-sm font-medium text-gray-700">Afficher un chronomètre visuel (badge compte à rebours)</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
             <label className="block text-sm font-bold text-gray-700">Contenu et texte</label>
             
             <div>
               <input 
                 type="text" 
                 value={state.content?.title || ""}
                 onChange={(e) => dispatch({ type: "UPDATE_NESTED_FIELD", payload: { root: "content", field: "title", val: e.target.value } })}
                 placeholder={`Titre (par défaut: ${getDynamicDefaults(state).title})`} 
                 maxLength={40} 
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-pr focus:ring-1 focus:ring-pr outline-none" 
               />
               <div className="text-right text-xs text-gray-400 mt-1">≤ 40 caractères</div>
             </div>
             
             <div>
               <textarea 
                 value={state.content?.text || ""}
                 onChange={(e) => dispatch({ type: "UPDATE_NESTED_FIELD", payload: { root: "content", field: "text", val: e.target.value } })}
                 placeholder={`Texte d'explication (par défaut: ${getDynamicDefaults(state).text})`} 
                 maxLength={90} 
                 rows={2} 
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-pr focus:ring-1 focus:ring-pr outline-none"
               ></textarea>
               <div className="text-right text-xs text-gray-400 mt-1">≤ 90 caractères</div>
             </div>
             
             <div>
               <input 
                 type="text" 
                 value={state.content?.buttonLabel || ""}
                 onChange={(e) => dispatch({ type: "UPDATE_NESTED_FIELD", payload: { root: "content", field: "buttonLabel", val: e.target.value } })}
                 placeholder={`Bouton (par défaut: ${getDynamicDefaults(state).buttonLabel})`} 
                 className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-pr focus:ring-1 focus:ring-pr outline-none" 
               />
             </div>

             <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
               Variables disponibles : <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">{'{prenom}'}</code>, <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">{'{article}'}</code>, <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">{'{montant_restant}'}</code>
             </div>
          </div>
        </div>

        {/* Live Preview Faux Téléphone */}
        <div className="flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200 p-8">
           <div className="w-[300px] h-[600px] bg-white border-[8px] border-gray-800 rounded-[2.5rem] shadow-xl overflow-hidden relative flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-xl w-32 mx-auto z-20"></div>
              
              {/* Mock App Header */}
              <div className="h-16 bg-white border-b flex items-end pb-3 px-4 shadow-sm z-10">
                <div className="font-bold text-lg text-gray-800">
                  {LOCATION_LABELS[state.location] || "Emplacement non défini"}
                </div>
              </div>

              {/* Mock App Content */}
              <div className="flex-1 bg-gray-50 p-4 space-y-4">
                 <div className="h-24 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col justify-center">
                   <div className="w-1/2 h-3 bg-gray-200 rounded mb-2"></div>
                   <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                 </div>

                 {/* The injected Offer UI : généré dynamiquement selon la mécanique */}
                 {(() => {
                   const defaults = getDynamicDefaults(state);
                   const title = state.content?.title?.trim() || defaults.title;
                   const text = state.content?.text?.trim() || defaults.text;
                   const buttonLabel = state.content?.buttonLabel?.trim() || defaults.buttonLabel;

                   return (
                     <div className="bg-white border-2 border-pr rounded-xl p-4 shadow-md animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        {state.showTimer && (
                          <div className="absolute top-0 right-0 bg-pr text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                            <span>OFFRE LIMITÉE</span>
                            <span>⏱️ 14:59</span>
                          </div>
                        )}
                        <h4 className={`font-bold text-gray-800 text-sm ${state.showTimer ? "pr-24" : ""}`}>
                          {title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {text}
                        </p>
                        <button className="w-full mt-3 bg-pr hover:bg-pr/95 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">
                          {buttonLabel}
                        </button>
                     </div>
                   );
                 })()}
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors">
          ← Retour
        </button>
        <button onClick={handleNext} className="bg-pr hover:bg-pr/90 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm">
          Suivant : Garde-fous →
        </button>
      </div>
    </div>
  );
}
