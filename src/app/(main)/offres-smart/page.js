"use client";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import { getRules, createOrUpdateRule, getUserProfiles, getOffersHistory, triggerScan, getCronStatus, toggleCron, getSmartOfferHediStats, createSmartOfferHediPayout, getMonitoringStats } from "@/services/PersonalizedOffersServices";
import { getCategories, getMenuItems } from "@/services/MenuItemServices";
import { FaEdit, FaCog, FaHistory, FaUserFriends, FaCheckCircle, FaRegClock, FaChartBar, FaEye, FaShoppingBag, FaBolt, FaPercentage, FaFire, FaPowerOff } from "react-icons/fa";
import { dateToDDMMYYYYHHMM } from "@/utils/dateFormatters";

const OffresSmart = () => {
  const [activeTab, setActiveTab] = useState("rules"); // "rules", "profiles", "history", "stats"
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isCronEnabled, setIsCronEnabled] = useState(true);
  const [isTogglingCron, setIsTogglingCron] = useState(false);
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
    freeItems: [],
    notificationTitle: "",
    notificationBody: "",
    isActive: true,
  });

  const [toastData, setToastData] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [tempFreeItem, setTempFreeItem] = useState("");
  const [tempFreeItemSize, setTempFreeItemSize] = useState("");

  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  // Profiles Tab State
  const [profilesPage, setProfilesPage] = useState(1);
  const [profilesPages, setProfilesPages] = useState(1);
  const [profilesTotal, setProfilesTotal] = useState(0);
  const [profilesNavigaTo, setProfilesNavigaTo] = useState("");
  const [isProfilesLoading, setIsProfilesLoading] = useState(false);

  // History Tab State
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyNavigaTo, setHistoryNavigaTo] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Stats Tab State
  const [monitoringStats, setMonitoringStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Hedi Royalties Modal State
  const [showHediModal, setShowHediModal] = useState(false);
  const [hediStats, setHediStats] = useState({
    totalCredits: 0,
    totalPayouts: 0,
    balance: 0,
    totalOrdersCount: 0,
    payouts: [],
  });
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDate, setPayoutDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [payoutNote, setPayoutNote] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, catRes, itemsRes, cronRes] = await Promise.all([
        getRules(),
        getCategories(),
        getMenuItems(),
        getCronStatus(),
      ]);

      if (rulesRes.status) setRules(rulesRes.data);
      if (catRes.status) setCategories(catRes.data);
      if (itemsRes.status) setMenuItems(itemsRes.data);
      if (cronRes?.status) setIsCronEnabled(Boolean(cronRes.isEnabled));
    } catch (err) {
      console.error("Error loading smart offers data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setProfilesPage(1);
  }, [searchUserQuery]);

  useEffect(() => {
    setHistoryPage(1);
  }, [searchHistoryQuery]);

  // Fetch Profiles when tab is active or page/search/refresh changes
  useEffect(() => {
    if (activeTab === "profiles") {
      const fetchProfilesData = async () => {
        setIsProfilesLoading(true);
        const res = await getUserProfiles({ page: profilesPage, limit: 20, search: searchUserQuery });
        if (res?.status) {
          setProfiles(res.data.profiles || []);
          setProfilesPages(res.data.pages || 1);
          setProfilesTotal(res.data.total || 0);
        }
        setIsProfilesLoading(false);
      };
      fetchProfilesData();
    }
  }, [activeTab, profilesPage, searchUserQuery, refresh]);

  // Fetch History when tab is active or page/search/refresh changes
  useEffect(() => {
    if (activeTab === "history") {
      const fetchHistoryData = async () => {
        setIsHistoryLoading(true);
        const res = await getOffersHistory({ page: historyPage, limit: 20, search: searchHistoryQuery });
        if (res?.status) {
          setHistory(res.data.history || []);
          setHistoryPages(res.data.pages || 1);
          setHistoryTotal(res.data.total || 0);
        }
        setIsHistoryLoading(false);
      };
      fetchHistoryData();
    }
  }, [activeTab, historyPage, searchHistoryQuery, refresh]);

  // Fetch Stats when tab is active or refresh changes
  useEffect(() => {
    if (activeTab === "stats") {
      const fetchStatsData = async () => {
        setIsStatsLoading(true);
        const res = await getMonitoringStats();
        if (res?.status) {
          setMonitoringStats(res.data);
        }
        setIsStatsLoading(false);
      };
      fetchStatsData();
    }
  }, [activeTab, refresh]);

  useEffect(() => {
    if (!showHediModal) return undefined;

    const refreshHediStats = async () => {
      const res = await getSmartOfferHediStats();
      if (res?.status) {
        setHediStats(res.data);
      }
    };

    const intervalId = window.setInterval(refreshHediStats, 10000);
    return () => window.clearInterval(intervalId);
  }, [showHediModal]);

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

  const handleToggleCron = async () => {
    try {
      setIsTogglingCron(true);
      const nextStatus = !isCronEnabled;
      const res = await toggleCron(nextStatus);
      if (res?.status) {
        setIsCronEnabled(Boolean(res.isEnabled));
        showToast(res.isEnabled ? "success" : "warning", res.message || (res.isEnabled ? "Le Cron a été activé." : "Le Cron a été désactivé."));
      } else {
        showToast("error", res.message || "Erreur lors de la modification du statut du Cron.");
      }
    } catch (err) {
      showToast("error", "Une erreur est survenue.");
    } finally {
      setIsTogglingCron(false);
    }
  };

  const handleOpenHediModal = async () => {
    setShowHediModal(true);
    const res = await getSmartOfferHediStats();
    if (res?.status) {
      setHediStats(res.data);
    }
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      showToast("error", "Veuillez entrer un montant valide.");
      return;
    }
    setIsSubmittingPayout(true);
    const res = await createSmartOfferHediPayout({
      amount: Number(payoutAmount),
      paidAt: payoutDate,
      note: payoutNote,
    });
    setIsSubmittingPayout(false);
    if (res?.status) {
      showToast("success", "Paiement enregistré avec succès !");
      setPayoutAmount("");
      setPayoutNote("");
      setHediStats(res.data);
    } else {
      showToast("error", res?.message || "Erreur lors de l'enregistrement du paiement.");
    }
  };

  const showToast = (type, message) => {
    setToastData({ show: true, type, message });
    setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleOpenConfig = (rule) => {
    setSelectedRule(rule);
    setFormData({
      strategyId: rule.strategyId,
      group: rule.group,
      segment: rule.segment,
      cooldownDays: rule.cooldownDays,
      validityHours: rule.validityHours,
      offerType: rule.offerType,
      discountValue: rule.discountValue,
      bonusThreshold: rule.bonusThreshold || 0,
      targetCategory: rule.targetCategory?._id || rule.targetCategory || "",
      targetMenuItem: rule.targetMenuItem?._id || rule.targetMenuItem || "",
      freeItem: rule.freeItem?._id || rule.freeItem || "",
      freeItems: rule.freeItems?.map(f => ({
        item: f.item?._id || f.item,
        size: f.size
      })) || [],
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
      used: { bg: "bg-purple-100 text-purple-800 border-purple-200", label: "Utilisé" },
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
      discount_order: "Réduction sur commande",
      free_delivery: "Livraison gratuite",
    };
    return types[type] || type;
  };

  const getStrategyLabel = (strategyId, score) => {
    if (!strategyId && !score) return <span className="text-gray-400">Non dispo.</span>;
    const strategies = {
      1: "Dernière commande >= 30j",
      2: "Dernière commande 21-29j",
      3: "Dernière commande 14-20j",
      4: ">= 8 cmd / 30j (Super Fidélité)",
      5: "5-7 cmd / 30j (Fidélité)",
      6: "Panier moyen < 20$",
      7: "Panier moyen 20-35$",
      8: "Panier moyen 35-50$",
      9: "Panier moyen > 50$",
      10: "Catégorie favorite >= 60%",
      11: "Découverte catégorie"
    };
    return (
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-gray-800 text-[13px]">{strategies[strategyId] || `Stratégie ${strategyId}`}</span>
        <span className="text-[10px] text-gray-400 font-mono font-medium">Score : {score || 0}</span>
      </div>
    );
  };

  const getDayName = (dayNum) => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[dayNum] || dayNum;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-[#f5f7fb]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] min-h-screen max-h-screen overflow-y-auto font-roboto">
      <ToastNotification type={toastData.type} message={toastData.message} show={toastData.show} />

      {/* Configuration Modal */}
      {showHediModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto font-roboto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaFire className="text-emerald-500" /> Solde Royalties Smart Offers (5%)
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                onClick={() => setShowHediModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Solde actuel
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {Number(hediStats.balance || 0).toFixed(2)} $
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Crédit total (5%)
                </p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
                  {Number(hediStats.totalCredits || 0).toFixed(2)} $
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Sur {hediStats.totalOrdersCount || 0} commande(s) Smart Offer
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Déjà payé / retiré
                </p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
                  {Number(hediStats.totalPayouts || 0).toFixed(2)} $
                </p>
              </div>
            </div>

            <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <h4 className="text-sm font-bold text-gray-800">
                Ajouter un paiement / retrait (sortie)
              </h4>
              <form onSubmit={handleCreatePayout} className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Montant ($)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    placeholder="Ex: 50.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Note</label>
                  <input
                    type="text"
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    placeholder="Ex: Virement Interac"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPayout}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
                  >
                    {isSubmittingPayout ? "Enregistrement..." : "Enregistrer le paiement"}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-800 mb-3">
                Historique des retraits / paiements
              </h4>
              {hediStats.payouts && hediStats.payouts.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {hediStats.payouts.map((entry) => (
                    <div key={entry._id} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50 transition">
                      <div>
                        <p className="font-bold text-gray-800">
                          {Number(entry.amount || 0).toFixed(2)} $
                        </p>
                        {entry.note ? (
                          <p className="text-gray-500 mt-0.5">{entry.note}</p>
                        ) : null}
                      </div>
                      <span className="text-gray-400 font-medium">
                        {entry.paidAt
                          ? new Date(entry.paidAt).toLocaleDateString("fr-CA")
                          : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                  Aucun retrait enregistré pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto font-roboto">
            <div className="bg-gradient-to-r from-pr to-[#111827] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-semibold">Configurer le segment : {getSegmentBadge(formData.segment)}</h2>
              <button onClick={() => setShowConfigModal(false)} className="text-white hover:text-white/80 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 flex flex-col gap-4 text-sm text-gray-700">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type d&apos;Offre</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none font-semibold text-gray-800"
                  value={formData.offerType}
                  onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                >
                  <option value="bonus_basket">Bonus panier / Panier moyen ($ de rabais dès X$ d&apos;achat)</option>
                  <option value="discount_order">Réduction sur tout le panier (%)</option>
                  <option value="discount_category">Réduction sur catégorie (%)</option>
                  <option value="discount_product">Réduction sur article (%)</option>
                  <option value="free_item">Article / Dessert offert</option>
                  <option value="free_delivery">Livraison gratuite</option>
                </select>
              </div>

              {formData.offerType === "bonus_basket" && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-800 mb-1">Valeur ($ Off)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-800 mb-1">Seuil minimal panier ($)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 35"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.bonusThreshold}
                      onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {formData.offerType === "discount_order" && (
                <div className="grid grid-cols-2 gap-4 bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                  <div>
                    <label className="block text-xs font-bold uppercase text-purple-800 mb-1">Valeur (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ex: 15"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-purple-800 mb-1">Seuil minimal panier ($ - Optionnel)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ex: 0"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.bonusThreshold}
                      onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {formData.offerType === "discount_category" && (
                <div className="grid grid-cols-2 gap-4 bg-green-50/50 p-3 rounded-lg border border-green-100">
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-800 mb-1">Valeur (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-green-800 mb-1">Catégorie cible</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.targetCategory}
                      onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
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
                <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Valeur (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-amber-800 mb-1">Article cible</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.targetMenuItem}
                      onChange={(e) => setFormData({ ...formData, targetMenuItem: e.target.value })}
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
                <div className="flex flex-col gap-4 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-orange-800 mb-1">Catégorie cible (Titre affiché)</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                        value={formData.targetCategory}
                        onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-orange-800 mb-1">Seuil minimal panier ($ - Optionnel)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 40"
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                        value={formData.bonusThreshold}
                        onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  {formData.targetCategory && (
                    <div className="border-t border-orange-200 pt-3 mt-1">
                      <label className="block text-xs font-bold uppercase text-orange-800 mb-2">Ajouter des articles offerts</label>
                      <div className="flex flex-col md:flex-row gap-2 items-start">
                        <select
                          className="flex-1 border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                          value={tempFreeItem}
                          onChange={(e) => {
                            setTempFreeItem(e.target.value);
                            setTempFreeItemSize("");
                          }}
                        >
                          <option value="">Sélectionner un article</option>
                          {menuItems.filter(item => String(item.category?._id || item.category) === String(formData.targetCategory)).map((item) => (
                            <option key={item._id} value={item._id}>{item.name}</option>
                          ))}
                        </select>
                        
                        {tempFreeItem && (
                          <select
                            className="flex-1 border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                            value={tempFreeItemSize}
                            onChange={(e) => setTempFreeItemSize(e.target.value)}
                          >
                            <option value="">Sélectionner une taille</option>
                            {menuItems.find(i => i._id === tempFreeItem)?.prices?.map((p, idx) => (
                              <option key={idx} value={p.size}>{p.size} ({p.price}$)</option>
                            ))}
                          </select>
                        )}
                        
                        <button
                          type="button"
                          disabled={!tempFreeItem || !tempFreeItemSize}
                          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              freeItems: [...prev.freeItems, { item: tempFreeItem, size: tempFreeItemSize }]
                            }));
                            setTempFreeItem("");
                            setTempFreeItemSize("");
                          }}
                        >
                          Ajouter
                        </button>
                      </div>
                      
                      {formData.freeItems && formData.freeItems.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          <label className="block text-[10px] font-bold uppercase text-orange-600">Liste des choix proposés :</label>
                          {formData.freeItems.map((fi, idx) => {
                            const foundItem = menuItems.find(i => i._id === fi.item);
                            return (
                              <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-orange-100 text-sm">
                                <span>{foundItem?.name || "Article inconnu"} - <span className="font-semibold text-gray-500">{fi.size}</span></span>
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 font-bold"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    freeItems: prev.freeItems.filter((_, i) => i !== idx)
                                  }))}
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {formData.offerType === "free_delivery" && (
                <div className="bg-cyan-50/50 p-3 rounded-lg border border-cyan-100">
                  <label className="block text-xs font-bold uppercase text-cyan-800 mb-1">Seuil minimal panier ($ - Optionnel)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 30"
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                    value={formData.bonusThreshold}
                    onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cooldown (Jours)</label>
                  {/* Toggle: offre unique à vie (valeur interne = 9999) */}
                  <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-pr"
                      checked={formData.cooldownDays === 9999}
                      onChange={(e) =>
                        setFormData({ ...formData, cooldownDays: e.target.checked ? 9999 : 7 })
                      }
                    />
                    <span className="text-xs text-gray-600 font-medium">Offre unique (jamais répétée)</span>
                  </label>
                  {formData.cooldownDays !== 9999 && (
                    <input
                      type="number"
                      min="0"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                      value={formData.cooldownDays}
                      onChange={(e) => setFormData({ ...formData, cooldownDays: Number(e.target.value) })}
                    />
                  )}
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
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Titre de la notification Push</label>
                <input
                  type="text"
                  placeholder="Ex: Une surprise vous attend !"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:border-pr focus:ring-1 focus:ring-pr outline-none"
                  value={formData.notificationTitle}
                  onChange={(e) => setFormData({ ...formData, notificationTitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Contenu de la notification Push</label>
                <textarea
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
            <div className="flex flex-col gap-2 items-stretch sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleCron}
                  disabled={isTogglingCron}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                    isTogglingCron
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-80"
                      : isCronEnabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.03] active:scale-[0.97]"
                      : "bg-rose-600 hover:bg-rose-700 text-white hover:scale-[1.03] active:scale-[0.97]"
                  }`}
                  title={isCronEnabled ? "Cliquez pour désactiver le scan automatique de minuit" : "Cliquez pour activer le scan automatique de minuit"}
                >
                  {isTogglingCron ? <Spinner size="small" /> : <FaPowerOff />}
                  <span>Cron {isCronEnabled ? "Activé" : "Désactivé"}</span>
                </button>
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                    isScanning
                      ? "bg-gray-400 text-[#111827] cursor-not-allowed opacity-80"
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
              <button
                onClick={handleOpenHediModal}
                className="px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-[1.03] active:scale-[0.97]"
              >
                <FaFire /> Royalties Hedi (5%)
              </button>
            </div>
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
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === "stats" ? "bg-pr text-[#0f172a] shadow-sm" : "text-gray-500 hover:text-[#0f172a] hover:bg-gray-50"
            }`}
          >
            <FaChartBar /> Monitoring & Stats
          </button>
        </div>

        {/* Rules View */}
        {activeTab === "rules" && (
          <div className="flex flex-col gap-6 w-full font-roboto text-gray-700">
            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-[#1D4ED8] p-4 rounded-r-xl shadow-sm text-sm text-[#1D4ED8] flex flex-col gap-1">
              <span className="font-bold">Moteur d&apos;Évaluation Comportementale (Dynamic Score Engine) :</span>
              <p>
                Chaque nuit, l&apos;algorithme calcule les indicateurs comportementaux (récence, fréquence, panier moyen, écart-type, favoris) et évalue <strong>toutes les stratégies</strong> simultanément pour chaque client. Les scores sont calculés dynamiquement — un client inactif à fort historique aura un score de réactivation bien plus élevé qu&apos;un client inactif récent. <strong>Cliquez sur ⚙️ Configurer</strong> pour modifier les paramètres d&apos;une règle.
              </p>
            </div>

            {/* Strategies Interactive Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Les 18 Stratégies d&apos;évaluation comportementale</h2>
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-100 text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Stratégie</th>
                      <th className="px-3 py-2.5 text-center">Type d&apos;Offre</th>
                      <th className="px-3 py-2.5 text-center">Récompense</th>
                      <th className="px-3 py-2.5 text-center">Durée</th>
                      <th className="px-3 py-2.5 text-center">Groupe</th>
                      <th className="px-3 py-2.5 text-center">Statut</th>
                      <th className="px-3 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { strategyId: 2, name: "Rabais 2e commande", condition: "1 commande passée", offerType: "discount_order", offerDesc: "15% de rabais dès 20$", validityHours: 72, baseScore: 98, group: "HABITUDE", segment: "normal", scoreColor: "text-blue-600 bg-blue-50" },
                      { strategyId: 3, name: "5$ pour la 3e commande", condition: "2 commandes passées", offerType: "bonus_basket", offerDesc: "5$ de rabais", validityHours: 72, baseScore: 96, group: "HABITUDE", segment: "normal", scoreColor: "text-blue-600 bg-blue-50" },
                      { strategyId: 4, name: "Extra gratuit 4e commande", condition: "3 commandes (30j)", offerType: "free_item", offerDesc: "Dessert offert", validityHours: 72, baseScore: 88, group: "HABITUDE", segment: "loyal", scoreColor: "text-blue-600 bg-blue-50" },
                      { strategyId: 5, name: "Presque fidèle", condition: "4 commandes (30j)", offerType: "bonus_basket", offerDesc: "7$ de rabais dès 35$", validityHours: 72, baseScore: 82, group: "FIDELITE", segment: "loyal", scoreColor: "text-orange-600 bg-orange-50" },
                      { strategyId: 6, name: "Fidélité active", condition: "5 à 7 commandes (30j)", offerType: "free_item", offerDesc: "Boisson/dessert offert", validityHours: 72, baseScore: 55, group: "FIDELITE", segment: "loyal", scoreColor: "text-orange-600 bg-orange-50" },
                      { strategyId: 7, name: "VIP", condition: "≥ 8 commandes (30j)", offerType: "free_item", offerDesc: "VIP offert", validityHours: 72, baseScore: 40, group: "FIDELITE", segment: "very_active", scoreColor: "text-orange-600 bg-orange-50" },
                      { strategyId: 8, name: "Inactif récent", condition: "10-17 jours inactif", offerType: "free_delivery", offerDesc: "Livraison offerte", validityHours: 48, baseScore: 68, group: "REACTIVATION", segment: "normal", scoreColor: "text-red-600 bg-red-50" },
                      { strategyId: 9, name: "À risque", condition: "18-29 jours inactif", offerType: "bonus_basket", offerDesc: "5$ de rabais", validityHours: 48, baseScore: 78, group: "REACTIVATION", segment: "normal", scoreColor: "text-red-600 bg-red-50" },
                      { strategyId: 10, name: "Perdu", condition: "30-59 jours inactif", offerType: "discount_order", offerDesc: "20% de rabais", validityHours: 48, baseScore: 92, group: "REACTIVATION", segment: "inactive", scoreColor: "text-red-600 bg-red-50" },
                      { strategyId: 11, name: "Très perdu", condition: "60-89 jours inactif", offerType: "discount_order", offerDesc: "25% de rabais", validityHours: 72, baseScore: 94, group: "REACTIVATION", segment: "reactivate", scoreColor: "text-red-600 bg-red-50" },
                      { strategyId: 12, name: "Ancien client", condition: "≥ 90 jours inactif", offerType: "bonus_basket", offerDesc: "10$ de rabais dès 30$", validityHours: 72, baseScore: 97, group: "REACTIVATION", segment: "reactivate", scoreColor: "text-red-600 bg-red-50" },
                      { strategyId: 13, name: "Panier 20-30$", condition: "Panier moyen 20-30$", offerType: "bonus_basket", offerDesc: "5$ dès 30$", validityHours: 48, baseScore: 45, group: "PANIER", segment: "normal", scoreColor: "text-purple-600 bg-purple-50" },
                      { strategyId: 14, name: "Panier 30-40$", condition: "Panier moyen 30-40$", offerType: "free_item", offerDesc: "Extra offert dès 35$", validityHours: 48, baseScore: 40, group: "PANIER", segment: "normal", scoreColor: "text-purple-600 bg-purple-50" },
                      { strategyId: 15, name: "Panier 40-55$", condition: "Panier moyen 40-55$", offerType: "bonus_basket", offerDesc: "7$ dès 50$", validityHours: 48, baseScore: 30, group: "PANIER", segment: "normal", scoreColor: "text-purple-600 bg-purple-50" },
                      { strategyId: 16, name: "Panier > 55$", condition: "Panier moyen > 55$", offerType: "bonus_basket", offerDesc: "10$ dès 65$", validityHours: 48, baseScore: 25, group: "PANIER", segment: "normal", scoreColor: "text-purple-600 bg-purple-50" },
                      { strategyId: 17, name: "Affinité — Catégorie favorite", condition: "Catégorie dominante ≥60% des achats (90j)", offerType: "discount_category", offerDesc: "10% sur la catégorie favorite", validityHours: 48, baseScore: 50, group: "AFFINITE", segment: "normal", scoreColor: "text-green-600 bg-green-50" },
                      { strategyId: 18, name: "Découverte — Catégorie top resto", condition: "N'a jamais commandé dans la catégorie #1 du resto", offerType: "discount_category", offerDesc: "15% sur la catégorie #1", validityHours: 48, baseScore: 35, group: "DECOUVERTE", segment: "normal", scoreColor: "text-gray-600 bg-gray-50" },
                    ].map((strat) => {
                      const rule = rules.find((r) => r.strategyId === strat.strategyId);
                      return (
                        <tr key={strat.strategyId} className="hover:bg-gray-50/50 transition">
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 text-sm">S{strat.strategyId.toString().padStart(2, '0')} - {strat.name}</span>
                              <span className="text-gray-500 text-[11px] mt-0.5">{strat.condition}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-gray-700 font-medium text-xs">
                                {rule?.offerType || strat.offerType}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-gray-600 text-xs">{rule ? (rule.discountValue + (rule.offerType === 'discount_category' || rule.offerType === 'discount_product' || rule.offerType === 'discount_order' ? '%' : '$')) : strat.offerDesc}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-gray-600 text-xs">{rule?.validityHours || strat.validityHours} h</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-current ${strat.scoreColor}`}>
                              {strat.group}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {rule && rule.isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">Actif</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">Non configuré</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              onClick={() => handleOpenConfig({
                                ...(rule || {}),
                                strategyId: strat.strategyId,
                                group: strat.group,
                                segment: strat.segment,
                                cooldownDays: rule?.cooldownDays || 7,
                                validityHours: rule?.validityHours || strat.validityHours,
                                offerType: strat.offerType,
                                discountValue: rule?.discountValue || 10,
                                bonusThreshold: rule?.bonusThreshold || 0,
                                targetCategory: rule?.targetCategory || "",
                                targetMenuItem: rule?.targetMenuItem || "",
                                freeItem: rule?.freeItem || "",
                                notificationTitle: rule?.notificationTitle || `Une offre spéciale pour vous, {name} !`,
                                notificationBody: rule?.notificationBody || strat.offerDesc,
                                isActive: rule?.isActive !== undefined ? rule.isActive : false,
                              })}
                              className="px-2.5 py-1.5 bg-gray-50 hover:bg-pr/10 hover:text-[#0f172a] border border-gray-200 hover:border-pr/30 rounded-lg text-gray-600 font-semibold text-[11px] transition flex items-center gap-1 mx-auto"
                            >
                              <FaEdit size={10} /> Configurer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 italic">
                * Le score final est calculé dynamiquement. La colonne &quot;Score de base&quot; est le plancher de départ auquel s&apos;ajoutent les métriques du client (fréquence, panier moyen, écart-type, fidélité catégorie).
              </p>
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
                  {isProfilesLoading ? (
                    <tr>
                      <td colSpan="11" className="py-12 text-center">
                        <Spinner />
                      </td>
                    </tr>
                  ) : profiles.length > 0 ? (
                    profiles.map((p) => (
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

            {/* Profiles Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setProfilesPage((prev) => Math.max(1, prev - 1))}
                className={`px-4 py-2 rounded-md font-semibold text-xs ${
                  profilesPage <= 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-pr text-white hover:brightness-95"
                }`}
                disabled={profilesPage <= 1}
              >
                Précédent
              </button>

              {profilesPages > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    className="w-20 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-pr text-center bg-white"
                    placeholder="Aller à"
                    onChange={(e) => setProfilesNavigaTo(e.target.value)}
                    value={profilesNavigaTo}
                    type="number"
                    min={1}
                    max={profilesPages}
                  />
                  <button
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:border-pr font-semibold"
                    onClick={() => {
                      const p = parseInt(profilesNavigaTo);
                      if (p >= 1 && p <= profilesPages) {
                        setProfilesPage(p);
                        setProfilesNavigaTo("");
                      }
                    }}
                  >
                    Aller
                  </button>
                  <span className="font-semibold text-gray-700 ml-1">
                    {"Page " + profilesPage + (profilesPages > 0 ? " / " + profilesPages : "")} ({profilesTotal} profils)
                  </span>
                </div>
              )}

              <button
                onClick={() => setProfilesPage((prev) => prev + 1)}
                className={`px-4 py-2 rounded-md font-semibold text-xs ${
                  profilesPage >= profilesPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-pr text-white hover:brightness-95"
                }`}
                disabled={profilesPage >= profilesPages}
              >
                Suivant
              </button>
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
                    <th className="px-4 py-3">Score & Décision</th>
                    <th className="px-4 py-3">Valeur / Cible</th>
                    <th className="px-4 py-3">Notification</th>
                    <th className="px-4 py-3">Notification planifiée</th>
                    <th className="px-4 py-3">Fin de validité</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isHistoryLoading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center">
                        <Spinner />
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((h) => (
                      <tr key={h._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800">{h.user?.name || "N/A"}</td>
                        <td className="px-4 py-3 font-medium text-gray-600">{getOfferTypeLabel(h.offerType)}</td>
                        <td className="px-4 py-3">{getStrategyLabel(h.strategyId, h.score)}</td>
                        <td className="px-4 py-3 font-semibold">
                          {h.offerType === "free_item"
                            ? `${h.targetCategory?.name ? `Au choix (${h.targetCategory.name})` : (h.freeItem?.name || "Article gratuit")}${h.bonusThreshold > 0 ? ` (Seuil: ${h.bonusThreshold}$)` : ""}`
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
                      <td colSpan="8" className="py-8 text-center text-gray-400">Aucune offre trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* History Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                className={`px-4 py-2 rounded-md font-semibold text-xs ${
                  historyPage <= 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-pr text-white hover:brightness-95"
                }`}
                disabled={historyPage <= 1}
              >
                Précédent
              </button>

              {historyPages > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    className="w-20 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-pr text-center bg-white"
                    placeholder="Aller à"
                    onChange={(e) => setHistoryNavigaTo(e.target.value)}
                    value={historyNavigaTo}
                    type="number"
                    min={1}
                    max={historyPages}
                  />
                  <button
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:border-pr font-semibold"
                    onClick={() => {
                      const p = parseInt(historyNavigaTo);
                      if (p >= 1 && p <= historyPages) {
                        setHistoryPage(p);
                        setHistoryNavigaTo("");
                      }
                    }}
                  >
                    Aller
                  </button>
                  <span className="font-semibold text-gray-700 ml-1">
                    {"Page " + historyPage + (historyPages > 0 ? " / " + historyPages : "")} ({historyTotal} offres)
                  </span>
                </div>
              )}

              <button
                onClick={() => setHistoryPage((prev) => prev + 1)}
                className={`px-4 py-2 rounded-md font-semibold text-xs ${
                  historyPage >= historyPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-pr text-white hover:brightness-95"
                }`}
                disabled={historyPage >= historyPages}
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Monitoring & Stats View */}
        {activeTab === "stats" && (() => {
          if (isStatsLoading || !monitoringStats) {
            return (
              <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <Spinner />
              </div>
            );
          }

          const {
            totalProfilesCount = 0,
            totalOffers = 0,
            notifClickedOffers = 0,
            usedOffers = 0,
            clickedOffers = 0,
            viewedOffers = 0,
            notifClickRate = 0,
            conversionRate = 0,
            engagementRate = 0,
            clickRate = 0,
            offerTypesMap = {},
            segmentsMap = {},
          } = monitoringStats;

          return (
            <div className="flex flex-col gap-6 w-full font-roboto text-gray-700 animate-fadeIn">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2.5 text-pr">
                    <FaChartBar className="text-pr" /> Monitoring & Performance des Offres
                  </h2>
                  <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                    Vue globale en temps réel des performances des offres intelligentes, de la réactivité des segments et du retour sur investissement.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block uppercase font-mono">Total Clients Profilés</span>
                    <span className="text-2xl font-black text-white">{totalProfilesCount}</span>
                  </div>
                  <FaUserFriends className="text-3xl text-pr" />
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50/80 to-white border border-blue-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Offres Générées</span>
                    <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{totalOffers}</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">Toutes campagnes</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-xl shadow-inner">
                    <FaBolt />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Clics Notif Push</span>
                    <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{notifClickRate}%</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">{notifClickedOffers} clic(s) push</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-xl shadow-inner">
                    <FaFire />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50/80 to-white border border-cyan-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider block">Ouverture (App)</span>
                    <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{engagementRate}%</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">{viewedOffers} vue(s)</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 text-xl shadow-inner">
                    <FaEye />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 to-white border border-amber-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Activation</span>
                    <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{clickRate}%</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">{clickedOffers} clic(s) client</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 text-xl shadow-inner">
                    <FaPercentage />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50/80 to-white border border-purple-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Taux de Conversion</span>
                    <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{conversionRate}%</span>
                    <span className="text-[11px] text-gray-500 mt-1 block">{usedOffers} commande(s)</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 text-xl shadow-inner">
                    <FaShoppingBag />
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-800 mb-1">Entonnoir de Conversion des Offres (Funnel d&apos;Efficacité)</h3>
                <p className="text-xs text-gray-500 mb-5">Suivez la progression de vos offres depuis leur génération par le moteur RFM jusqu&apos;à leur encaissement en commande.</p>

                <div className="flex flex-col gap-4">
                  {/* Step 1 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>1. Offres Générées & Envoyées</span>
                      <span>{totalOffers} (100%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>2. Clics sur la Notification Push (Push Click)</span>
                      <span>{notifClickedOffers} ({notifClickRate}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${notifClickRate}%` }}></div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>3. Vues par le client dans l&apos;application (Modal ou Bannière)</span>
                      <span>{viewedOffers} ({engagementRate}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${engagementRate}%` }}></div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>4. Cliquées & Activées par le client (&quot;Activer l&apos;offre&quot;)</span>
                      <span>{clickedOffers} ({clickRate}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${clickRate}%` }}></div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>5. Commandes Validées & Encaissement</span>
                      <span>{usedOffers} ({conversionRate}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${conversionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid: Breakdown by Offer Type & Breakdown by RFM Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Offer Type Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Performance par Type d&apos;Offre</h3>
                    <p className="text-xs text-gray-500 mb-4">Découvrez quels types de réductions incitent le plus à l&apos;achat.</p>
                    
                    <div className="flex flex-col gap-3.5">
                      {Object.entries(offerTypesMap).map(([key, data]) => {
                        const rate = data.count > 0 ? Math.round((data.used / data.count) * 100) : 0;
                        return (
                          <div key={key} className="border-b border-gray-50 pb-2.5 last:border-none last:pb-0">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-semibold text-gray-700">{data.label}</span>
                              <span className="text-gray-500 font-medium">{data.used} / {data.count} ({rate}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RFM Segment Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">Efficacité par Segment RFM</h3>
                    <p className="text-xs text-gray-500 mb-4">Mesurez la réactivité de chaque segment comportemental face aux offres.</p>
                    
                    <div className="flex flex-col gap-3.5">
                      {Object.entries(segmentsMap).map(([key, data]) => {
                        const rate = data.offers > 0 ? Math.round((data.used / data.offers) * 100) : 0;
                        return (
                          <div key={key} className="border-b border-gray-50 pb-2.5 last:border-none last:pb-0">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">{data.label}</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{data.users} client(s)</span>
                              </div>
                              <span className="text-gray-500 font-medium">{data.used} / {data.offers} offre(s) ({rate}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${rate}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default OffresSmart;
