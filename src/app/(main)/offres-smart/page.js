"use client";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import { getRules, createOrUpdateRule, getUserProfiles, getOffersHistory, triggerScan } from "@/services/PersonalizedOffersServices";
import { getCategories, getMenuItems } from "@/services/MenuItemServices";
import { FaEdit, FaCog, FaHistory, FaUserFriends, FaCheckCircle, FaRegClock } from "react-icons/fa";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";

const OffresSmart = () => {
  const [activeTab, setActiveTab] = useState("rules"); // "rules", "profiles", "history"
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [rules, setRules] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [refresh, setRefresh] = useState(0);

  // Form / Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    segment: "",
    cooldownDays: 7,
    validityHours: 24,
    offerType: "discount_category",
    discountValue: 0,
    bonusThreshold: 0,
    targetCategory: "",
    targetMenuItem: "",
    freeItem: "",
    notificationTitle: "",
    notificationBody: "",
    isActive: true,
  });

  const [toastData, setToastData] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, profilesRes, historyRes, catRes, itemsRes] = await Promise.all([
        getRules(),
        getUserProfiles(),
        getOffersHistory(),
        getCategories(),
        getMenuItems(),
      ]);

      if (rulesRes.status) setRules(rulesRes.data);
      if (profilesRes.status) setProfiles(profilesRes.data);
      if (historyRes.status) setHistory(historyRes.data);
      if (catRes.status) setCategories(catRes.data);
      if (itemsRes.status) setMenuItems(itemsRes.data);
    } catch (err) {
      console.error("Error loading smart offers data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    showToast("info", "Scan RFM et génération des offres en cours...");
    try {
      const res = await triggerScan();
      if (res.status) {
        showToast("success", res.message || "Le scan RFM s'est terminé avec succès !");
        setRefresh((prev) => prev + 1); // reload data
      } else {
        showToast("error", res.message || "Échec du lancement du scan RFM.");
      }
    } catch (err) {
      showToast("error", "Une erreur est survenue lors du scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const showToast = (type, message) => {
    setToastData({ show: true, type, message });
    setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleOpenConfig = (rule) => {
    setSelectedRule(rule);
    setFormData({
      segment: rule.segment,
      cooldownDays: rule.cooldownDays,
      validityHours: rule.validityHours,
      offerType: rule.offerType,
      discountValue: rule.discountValue,
      bonusThreshold: rule.bonusThreshold || 0,
      targetCategory: rule.targetCategory?._id || rule.targetCategory || "",
      targetMenuItem: rule.targetMenuItem?._id || rule.targetMenuItem || "",
      freeItem: rule.freeItem?._id || rule.freeItem || "",
      notificationTitle: rule.notificationTitle,
      notificationBody: rule.notificationBody,
      isActive: rule.isActive !== undefined ? rule.isActive : true,
    });
    setShowConfigModal(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const response = await createOrUpdateRule(formData);
      if (response.status) {
        showToast("success", "Règle configurée avec succès !");
        setShowConfigModal(false);
        setRefresh((prev) => prev + 1);
      } else {
        showToast("error", response.message || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      showToast("error", "Une erreur est survenue.");
    }
  };

  // Helper labels
  const getSegmentBadge = (segment) => {
    const badges = {
      very_active: { bg: "bg-green-100 text-green-800 border-green-200", label: "Très Actif" },
      normal: { bg: "bg-blue-100 text-blue-800 border-blue-200", label: "Normal" },
      loyal: { bg: "bg-purple-100 text-purple-800 border-purple-200", label: "Fidèle" },
      inactive: { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Inactif" },
      reactivate: { bg: "bg-red-100 text-red-800 border-red-200", label: "À Réactiver" },
    };
    const info = badges[segment] || { bg: "bg-gray-100 text-gray-800 border-gray-200", label: segment };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      prepared: { bg: "bg-gray-100 text-gray-800 border-gray-200", label: "Planifié (Cron)" },
      active: { bg: "bg-green-100 text-green-800 border-green-200", label: "Actif" },
      viewed: { bg: "bg-cyan-100 text-cyan-800 border-cyan-200", label: "Vu" },
      clicked: { bg: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Cliqué" },
      applied: { bg: "bg-purple-100 text-purple-800 border-purple-200", label: "Utilisé" },
      expired: { bg: "bg-red-100 text-red-800 border-red-200", label: "Expiré" },
    };
    const info = badges[status] || { bg: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const getOfferTypeLabel = (type) => {
    const types = {
      discount_category: "Réduction sur catégorie",
      discount_product: "Réduction sur article",
      free_item: "Article gratuit",
      bonus_basket: "Bonus panier",
    };
    return types[type] || type;
  };

  const getDayName = (dayNum) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[dayNum] || dayNum;
  };

  // Filter clients
  const filteredProfiles = profiles.filter((p) => {
    const query = searchUserQuery.toLowerCase().trim();
    if (!query) return true;
    const name = String(p.user?.name || "").toLowerCase();
    const phone = String(p.user?.phone_number || "").toLowerCase();
    const email = String(p.user?.email || "").toLowerCase();
    return name.includes(query) || phone.includes(query) || email.includes(query) || p.segment.includes(query);
  });

  // Filter history
  const filteredHistory = history.filter((h) => {
    const query = searchHistoryQuery.toLowerCase().trim();
    if (!query) return true;
    const name = String(h.user?.name || "").toLowerCase();
    const phone = String(h.user?.phone_number || "").toLowerCase();
    const title = String(h.notificationTitle || "").toLowerCase();
    return name.includes(query) || phone.includes(query) || title.includes(query) || h.status.includes(query);
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-[#f5f7fb]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-screen overflow-y-auto font-roboto">
      <ToastNotification type={toastData.type} message={toastData.message} show={toastData.show} />

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto font-roboto">
            <div className="bg-gradient-to-r from-pr to-[#111827] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-semibold">Configurer le segment : {getSegmentBadge(formData.segment)}</h2>
              <button onClick={() => setShowConfigModal(false)} className="text-white hover:text-white/80 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 flex flex-col gap-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cooldown (Jours)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                    value={formData.cooldownDays}
                    onChange={(e) => setFormData({ ...formData, cooldownDays: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Validité de l&apos;offre (Heures)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                    value={formData.validityHours}
                    onChange={(e) => setFormData({ ...formData, validityHours: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type d&apos;Offre</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                  value={formData.offerType}
                  onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                >
                  <option value="discount_category">Réduction sur catégorie (%)</option>
                  <option value="discount_product">Réduction sur article (%)</option>
                  <option value="free_item">Article gratuit</option>
                  <option value="bonus_basket">Bonus panier (Flat $)</option>
                </select>
              </div>

              {formData.offerType === "discount_category" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valeur (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Catégorie cible</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.targetCategory}
                      onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.offerType === "discount_product" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valeur (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Article cible</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.targetMenuItem}
                      onChange={(e) => setFormData({ ...formData, targetMenuItem: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un article</option>
                      {menuItems.map((item) => (
                        <option key={item._id} value={item._id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.offerType === "free_item" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Article offert</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                    value={formData.freeItem}
                    onChange={(e) => setFormData({ ...formData, freeItem: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner l&apos;article gratuit</option>
                    {menuItems.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.offerType === "bonus_basket" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valeur ($ Off)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Seuil minimal panier ($)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.bonusThreshold}
                      onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Titre de la notification Push</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Une surprise vous attend !"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                  value={formData.notificationTitle}
                  onChange={(e) => setFormData({ ...formData, notificationTitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contenu de la notification Push</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Ex: Profitez de 15% de rabais sur votre prochaine commande !"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                  value={formData.notificationBody}
                  onChange={(e) => setFormData({ ...formData, notificationBody: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  className="w-4 h-4 text-pr border-gray-300 rounded focus:ring-pr"
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="font-bold text-gray-700 select-none">Règle active</label>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pr text-[#0f172a] font-bold rounded-md hover:brightness-95 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Container */}
      <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col gap-4 font-roboto">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold flex items-center gap-2">
                <FaCog className="animate-spin-slow text-[#F7A600]" /> Moteur d&apos;Offres Personnalisées (Smart Offers)
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Générez des offres adaptées aux habitudes d&apos;achat de vos clients, pilotées par un Cron automatique ou déclenchées manuellement.
              </p>
            </div>
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                isScanning
                  ? "bg-gray-400 text-white cursor-not-allowed opacity-80"
                  : "bg-[#F7A600] hover:bg-[#ffb72b] text-[#111827] hover:scale-[1.03] active:scale-[0.97]"
              }`}
            >
              {isScanning ? (
                <>
                  <Spinner size="small" /> Scan en cours...
                </>
              ) : (
                <>
                  <FaCog className="animate-spin" /> Lancer Scan RFM
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "rules" ? "bg-pr text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-[#0f172a] hover:bg-gray-50"
            }`}
          >
            <FaCog /> Règles par Segment
          </button>
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "profiles" ? "bg-pr text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-[#0f172a] hover:bg-gray-50"
            }`}
          >
            <FaUserFriends /> Profils Comportementaux
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "history" ? "bg-pr text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-[#0f172a] hover:bg-gray-50"
            }`}
          >
            <FaHistory /> Historique des Offres
          </button>
        </div>

        {/* Rules View */}
        {activeTab === "rules" && (
          <div className="flex flex-col gap-6 w-full font-roboto text-gray-700">
            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-[#1D4ED8] p-4 rounded-r-xl shadow-sm text-sm text-[#1D4ED8] flex flex-col gap-1">
              <span className="font-bold">Moteur d&apos;Évaluation d&apos;Offres (Score Engine) :</span>
              <p>
                Chaque nuit, l&apos;algorithme calcule les indicateurs comportementaux des clients (récence, fréquence, panier moyen, favoris). Il évalue l&apos;éligibilité de chacune des 11 stratégies ci-dessous, puis génère <strong>l&apos;unique offre</strong> ayant obtenu le score le plus élevé pour chaque client. Les cooldowns ci-dessous restent configurables par segment.
              </p>
            </div>

            {/* Strategies List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Les 11 Stratégies d&apos;évaluation comportementale</h2>
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-100 text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-2">Stratégie</th>
                      <th className="px-3 py-2">Condition</th>
                      <th className="px-3 py-2">Type d&apos;Offre</th>
                      <th className="px-3 py-2">Durée</th>
                      <th className="px-3 py-2 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">1. Réactivation longue</td>
                      <td className="px-3 py-2.5">Dernière commande &ge; 30 jours</td>
                      <td className="px-3 py-2.5">15% de rabais sur la commande</td>
                      <td className="px-3 py-2.5">72 heures</td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600 bg-red-50">100</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">2. Réactivation moyenne</td>
                      <td className="px-3 py-2.5">Dernière commande entre 21 et 29 jours</td>
                      <td className="px-3 py-2.5">10% de rabais sur la commande</td>
                      <td className="px-3 py-2.5">72 heures</td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600 bg-red-50">90</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">3. Réactivation courte</td>
                      <td className="px-3 py-2.5">Dernière commande entre 14 et 20 jours</td>
                      <td className="px-3 py-2.5">Frais de livraison offerts</td>
                      <td className="px-3 py-2.5">48 heures</td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600 bg-red-50">80</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">4. Fidélité Super-Active</td>
                      <td className="px-3 py-2.5">&ge; 8 commandes sur les 30 derniers jours</td>
                      <td className="px-3 py-2.5">Dessert offert dès panier moyen + 5$</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-orange-600 bg-orange-50">75</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">5. Fidélité Active</td>
                      <td className="px-3 py-2.5">5 à 7 commandes sur les 30 derniers jours</td>
                      <td className="px-3 py-2.5">Boisson offerte dès panier moyen + 5$</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-orange-600 bg-orange-50">70</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">6. Panier moyen faible</td>
                      <td className="px-3 py-2.5">Panier moyen &lt; 20$</td>
                      <td className="px-3 py-2.5">5$ de rabais dès 25$ d&apos;achat</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-blue-600 bg-blue-50">65</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">7. Panier moyen moyen</td>
                      <td className="px-3 py-2.5">Panier moyen [20$ - 35$]</td>
                      <td className="px-3 py-2.5">5$ de rabais dès panier moyen + 8$</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-blue-600 bg-blue-50">64</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">8. Panier moyen élevé</td>
                      <td className="px-3 py-2.5">Panier moyen [35$ - 50$]</td>
                      <td className="px-3 py-2.5">Dessert offert dès panier moyen + 5$</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-blue-600 bg-blue-50">63</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">9. Panier moyen très élevé</td>
                      <td className="px-3 py-2.5">Panier moyen &gt; 50$</td>
                      <td className="px-3 py-2.5">Dessert offert dès panier moyen + 10$</td>
                      <td className="px-3 py-2.5">7 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-blue-600 bg-blue-50">62</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">10. Catégorie favorite</td>
                      <td className="px-3 py-2.5">La catégorie préférée &ge; 60% des achats</td>
                      <td className="px-3 py-2.5">10% de réduction sur cette catégorie</td>
                      <td className="px-3 py-2.5">5 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-green-600 bg-green-50">50</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">11. Découverte catégorie</td>
                      <td className="px-3 py-2.5">Jamais commandé dans une catégorie populaire</td>
                      <td className="px-3 py-2.5">15% de rabais sur cette catégorie</td>
                      <td className="px-3 py-2.5">5 jours</td>
                      <td className="px-3 py-2.5 text-center font-bold text-green-600 bg-green-50">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-base font-semibold text-gray-800 mt-2">Paramètres de Cooldown par Segment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["very_active", "normal", "inactive", "reactivate", "loyal"].map((segment) => {
              const rule = rules.find((r) => r.segment === segment) || {
                segment,
                cooldownDays: 7,
                validityHours: 24,
                offerType: "discount_category",
                discountValue: 15,
                isActive: false,
                notificationTitle: "Une surprise vous attend !",
                notificationBody: "Profitez de réductions exceptionnelles !",
              };

              return (
                <div
                  key={segment}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden ${
                    !rule.isActive ? "opacity-75" : ""
                  }`}
                >
                  {!rule.isActive && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-200">
                      Inactif
                    </div>
                  )}
                  {rule.isActive && (
                    <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                      <FaCheckCircle size={10} /> Actif
                    </div>
                  )}

                  <div>
                    <div className="mb-4">{getSegmentBadge(segment)}</div>
                    <div className="space-y-2 mt-4 text-sm text-gray-600">
                      <div className="flex justify-between border-b pb-1.5 border-gray-50">
                        <span className="text-gray-400">Cooldown:</span>
                        <span className="font-bold text-gray-800">{rule.cooldownDays} jours</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-gray-50">
                        <span className="text-gray-400">Validité:</span>
                        <span className="font-bold text-gray-800">{rule.validityHours} heures</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-gray-50">
                        <span className="text-gray-400">Offre:</span>
                        <span className="font-bold text-pr">{getOfferTypeLabel(rule.offerType)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-gray-50">
                        <span className="text-gray-400">Valeur:</span>
                        <span className="font-bold text-gray-800">
                          {rule.offerType === "free_item"
                            ? rule.freeItem?.name || "Article"
                            : rule.offerType === "discount_category"
                            ? `${rule.discountValue}% (${rule.targetCategory?.name || "Catégorie"})`
                            : rule.offerType === "discount_product"
                            ? `${rule.discountValue}% (${rule.targetMenuItem?.name || "Article"})`
                            : `${rule.discountValue}$ (Seuil: ${rule.bonusThreshold}$)`}
                        </span>
                      </div>
                      <div className="pt-2">
                        <span className="text-xs font-bold uppercase text-gray-400 block mb-1">Push Notification:</span>
                        <span className="text-xs font-bold text-gray-800 block">{rule.notificationTitle}</span>
                        <span className="text-xs text-gray-500 block truncate">{rule.notificationBody}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenConfig(rule)}
                    className="mt-6 w-full py-2 bg-gray-50 hover:bg-pr/10 hover:text-[#0f172a] rounded-lg text-gray-700 font-semibold text-xs border border-gray-200 hover:border-pr/30 transition flex items-center justify-center gap-1"
                  >
                    <FaEdit /> Configurer la règle
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Profiles View */}
        {activeTab === "profiles" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Habitudes de commande des clients</h2>
              <input
                type="text"
                placeholder="Rechercher un client ou segment..."
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm max-w-sm w-full outline-none focus:border-pr"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Segment</th>
                    <th className="px-4 py-3">Heure préf.</th>
                    <th className="px-4 py-3">Jour préf.</th>
                    <th className="px-4 py-3">Dernière cmd.</th>
                    <th className="px-4 py-3 text-center">Cmd. Total</th>
                    <th className="px-4 py-3 text-center">30j</th>
                    <th className="px-4 py-3 text-center">60j</th>
                    <th className="px-4 py-3">Panier Moyen</th>
                    <th className="px-4 py-3">Écart-type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800">{p.user?.name || "Client sans nom"}</td>
                        <td className="px-4 py-3 text-gray-600">{p.user?.phone_number || "N/A"}</td>
                        <td className="px-4 py-3">{getSegmentBadge(p.segment)}</td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {String(p.preferredHour).padStart(2, "0")}:00
                        </td>
                        <td className="px-4 py-3 text-gray-600">{getDayName(p.preferredDay)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {p.lastOrderAt ? dateToDDMMYYYYHHMM(p.lastOrderAt) : "Jamais"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-center text-[#F7A600]">{p.orderCount}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700">{p.ordersCount30d || 0}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-700">{p.ordersCount60d || 0}</td>
                        <td className="px-4 py-3 font-bold text-green-700">{p.averageBasketSize ? `${p.averageBasketSize}$` : "0$"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.basketSizeStdDev ? `${p.basketSizeStdDev}$` : "0$"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="py-8 text-center text-gray-400">Aucun profil client ne correspond à votre recherche.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History View */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col gap-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Historique des offres préparées et envoyées</h2>
              <input
                type="text"
                placeholder="Rechercher une offre ou client..."
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm max-w-sm w-full outline-none focus:border-pr"
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Type d&apos;offre</th>
                    <th className="px-4 py-3">Valeur / Cible</th>
                    <th className="px-4 py-3">Notification</th>
                    <th className="px-4 py-3">Notification planifiée</th>
                    <th className="px-4 py-3">Fin de validité</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((h) => (
                      <tr key={h._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800">{h.user?.name || "N/A"}</td>
                        <td className="px-4 py-3 font-medium text-gray-600">{getOfferTypeLabel(h.offerType)}</td>
                        <td className="px-4 py-3 font-semibold">
                          {h.offerType === "free_item"
                            ? h.freeItem?.name || "Article gratuit"
                            : h.offerType === "discount_category"
                            ? `${h.discountValue}% (${h.targetCategory?.name || "Catégorie"})`
                            : h.offerType === "discount_product"
                            ? `${h.discountValue}% (${h.targetMenuItem?.name || "Article"})`
                            : `${h.discountValue}$ (Seuil: ${h.bonusThreshold}$)`}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <span className="font-semibold block truncate text-xs">{h.notificationTitle}</span>
                          <span className="text-[11px] text-gray-400 block truncate">{h.notificationBody}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{dateToDDMMYYYYHHMM(h.scheduledNotifyAt)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{h.validUntil ? dateToDDMMYYYYHHMM(h.validUntil) : "Non activée"}</td>
                        <td className="px-4 py-3">{getStatusBadge(h.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">Aucune offre trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffresSmart;
