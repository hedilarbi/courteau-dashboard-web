"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiEye } from "react-icons/fi";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";
import ModalWrapper from "@/components/modals/ModalWrapper";
import DropDown from "@/components/DropDown";
import { getItemsNames } from "@/services/MenuItemServices";
import {
  createSubscriptionHediPayout,
  getSubscriptionAdminStats,
  getSubscriptionAdminUserDetails,
  updateSubscriptionConfig,
} from "@/services/SubscriptionServices";

const formatMoney = (value) =>
  `${new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} $`;

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatSubscriptionStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "active") return "Actif";
  if (normalized === "trialing") return "Essai";
  if (normalized === "past_due") return "Paiement en retard";
  if (normalized === "unpaid") return "Impayé";
  if (normalized === "canceled") return "Annulé";
  if (normalized === "incomplete") return "Incomplet";
  if (normalized === "incomplete_expired") return "Expiré";
  return normalized ? normalized : "-";
};

const formatPaymentType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "activation") return "Activation";
  if (normalized === "renewal") return "Renouvellement";
  return "Abonnement";
};

const SubscriptionSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [error, setError] = useState("");
  const [toastData, setToastData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [statsData, setStatsData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");

  const [showManageModal, setShowManageModal] = useState(false);
  const [showHediModal, setShowHediModal] = useState(false);
  const [showFreeItemModal, setShowFreeItemModal] = useState(false);
  const [showBirthdayFreeItemModal, setShowBirthdayFreeItemModal] =
    useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState("");
  const [selectedSubscriptionUser, setSelectedSubscriptionUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [monthlyPrice, setMonthlyPrice] = useState("11.99");
  const [freeItemOptions, setFreeItemOptions] = useState([]);
  const [selectedFreeItemOption, setSelectedFreeItemOption] = useState(null);
  const [isSavingFreeItem, setIsSavingFreeItem] = useState(false);
  const [selectedBirthdayFreeItemOption, setSelectedBirthdayFreeItemOption] =
    useState(null);
  const [isSavingBirthdayFreeItem, setIsSavingBirthdayFreeItem] =
    useState(false);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDate, setPayoutDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [payoutNote, setPayoutNote] = useState("");

  const showToast = (type, message) => {
    setToastData({
      show: true,
      type,
      message,
    });
    setTimeout(() => {
      setToastData((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const response = await getSubscriptionAdminStats();
    if (!response.status) {
      setError(response.message || "Erreur lors du chargement.");
      setIsLoading(false);
      return;
    }

    const nextData = response.data || {};
    setStatsData(nextData);
    setMonthlyPrice(Number(nextData?.config?.monthlyPrice ?? 11.99).toFixed(2));

    const currentFreeItem = nextData?.config?.freeItem || null;
    if (currentFreeItem?.menuItemId) {
      setSelectedFreeItemOption({
        value: currentFreeItem.menuItemId,
        label:
          currentFreeItem.menuItemName ||
          `Article ${currentFreeItem.menuItemId}`,
      });
    } else {
      setSelectedFreeItemOption(null);
    }

    const currentBirthdayFreeItem = nextData?.config?.birthdayFreeItem || null;
    if (currentBirthdayFreeItem?.menuItemId) {
      setSelectedBirthdayFreeItemOption({
        value: currentBirthdayFreeItem.menuItemId,
        label:
          currentBirthdayFreeItem.menuItemName ||
          `Article ${currentBirthdayFreeItem.menuItemId}`,
      });
    } else {
      setSelectedBirthdayFreeItemOption(null);
    }
    setIsLoading(false);
  }, []);

  const fetchFreeItemOptions = useCallback(async () => {
    const response = await getItemsNames();
    if (!response?.status || !Array.isArray(response?.data)) {
      showToast(
        "error",
        response?.message || "Impossible de charger les articles.",
      );
      return;
    }

    const normalizedOptions = response.data
      .map((item) => ({
        value: item?._id,
        label: item?.name || "",
      }))
      .filter((option) => option.value && option.label);

    setFreeItemOptions(normalizedOptions);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchFreeItemOptions()]);
    };
    loadData();
  }, [fetchStats, fetchFreeItemOptions]);

  const overview = statsData?.overview || {};
  const config = statsData?.config || {};
  const users = useMemo(() => statsData?.users || [], [statsData?.users]);
  const hedi = statsData?.hedi || {};

  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return users;
    if (statusFilter === "inactive") {
      return users.filter((user) => !user?.isActive);
    }
    return users.filter((user) => Boolean(user?.isActive));
  }, [users, statusFilter]);

  const hasUsers = filteredUsers.length > 0;

  const savePrice = async () => {
    const parsedPrice = Number(monthlyPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      showToast("error", "Le prix doit être un nombre supérieur à 0.");
      return;
    }

    setIsSavingPrice(true);
    const response = await updateSubscriptionConfig({
      monthlyPrice: parsedPrice,
    });
    if (!response.status) {
      showToast("error", response.message || "Erreur lors de la mise à jour.");
      setIsSavingPrice(false);
      return;
    }

    showToast("success", "Prix abonnement mis à jour.");
    setShowManageModal(false);
    setIsSavingPrice(false);
    await fetchStats();
  };

  const saveFreeItem = async () => {
    if (!selectedFreeItemOption?.value) {
      showToast("error", "Sélectionnez un article gratuit.");
      return;
    }

    setIsSavingFreeItem(true);
    const response = await updateSubscriptionConfig({
      freeItemMenuItemId: selectedFreeItemOption.value,
    });

    if (!response.status) {
      showToast(
        "error",
        response.message ||
          "Erreur lors de la mise à jour de l'article gratuit.",
      );
      setIsSavingFreeItem(false);
      return;
    }

    showToast("success", "Article gratuit mis à jour.");
    setShowFreeItemModal(false);
    setIsSavingFreeItem(false);
    await fetchStats();
  };

  const saveBirthdayFreeItem = async () => {
    if (!selectedBirthdayFreeItemOption?.value) {
      showToast("error", "Sélectionnez un article anniversaire.");
      return;
    }

    setIsSavingBirthdayFreeItem(true);
    const response = await updateSubscriptionConfig({
      birthdayFreeItemMenuItemId: selectedBirthdayFreeItemOption.value,
    });

    if (!response.status) {
      showToast(
        "error",
        response.message ||
          "Erreur lors de la mise à jour de l'article anniversaire.",
      );
      setIsSavingBirthdayFreeItem(false);
      return;
    }

    showToast("success", "Article anniversaire mis à jour.");
    setShowBirthdayFreeItemModal(false);
    setIsSavingBirthdayFreeItem(false);
    await fetchStats();
  };

  const addHediPayout = async () => {
    const parsedAmount = Number(payoutAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      showToast("error", "Le montant doit être supérieur à 0.");
      return;
    }

    if (!payoutDate) {
      showToast("error", "La date du paiement est obligatoire.");
      return;
    }

    setIsSavingPayout(true);
    const response = await createSubscriptionHediPayout({
      amount: parsedAmount,
      paidAt: payoutDate,
      note: payoutNote,
    });

    if (!response.status) {
      showToast(
        "error",
        response.message || "Erreur lors de l'enregistrement du paiement.",
      );
      setIsSavingPayout(false);
      return;
    }

    setPayoutAmount("");
    setPayoutNote("");
    showToast("success", "Paiement enregistré et déduit du solde de Hedi.");
    setIsSavingPayout(false);
    await fetchStats();
  };

  const openUserDetails = async (user) => {
    if (!user?._id) return;

    setSelectedSubscriptionUser(user);
    setSelectedUserDetails(null);
    setUserDetailsError("");
    setShowUserDetailsModal(true);
    setIsLoadingUserDetails(true);

    const response = await getSubscriptionAdminUserDetails(user._id);
    if (!response.status) {
      const nextError =
        response.message || "Erreur lors du chargement du détail abonnement.";
      setUserDetailsError(nextError);
      showToast("error", nextError);
      setIsLoadingUserDetails(false);
      return;
    }

    setSelectedUserDetails(response.data || null);
    setIsLoadingUserDetails(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 bg-pr text-white px-4 py-2 rounded-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] h-screen overflow-y-scroll p-5">
      <ToastNotification
        type={toastData.type}
        message={toastData.message}
        show={toastData.show}
      />

      <div className="max-w-[1400px] mx-auto">
        <div className="bg-gradient-to-r from-pr to-[#111827] text-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">CLUB COURTEAU</h1>
              <p className="text-sm opacity-90 mt-1">
                Suivez les abonnements, les revenus et le solde de Hedi.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowManageModal(true)}
                className="bg-white text-[#111827] font-semibold rounded-md px-4 py-2 shadow-sm hover:brightness-95 transition"
              >
                Gérer l&apos;abonnement
              </button>
              <button
                onClick={() => setShowFreeItemModal(true)}
                className="bg-white text-[#111827] font-semibold rounded-md px-4 py-2 shadow-sm hover:brightness-95 transition"
              >
                Article gratuit
              </button>
              <button
                onClick={() => setShowBirthdayFreeItemModal(true)}
                className="bg-white text-[#111827] font-semibold rounded-md px-4 py-2 shadow-sm hover:brightness-95 transition"
              >
                Cadeau anniversaire
              </button>
              <button
                onClick={() => setShowHediModal(true)}
                className="bg-black/40 border border-white/30 text-white font-semibold rounded-md px-4 py-2 hover:bg-black/50 transition"
              >
                Solde de Hedi
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs text-text-light-gray uppercase tracking-wide">
              Revenus abonnement
            </p>
            <p className="text-2xl font-semibold text-text-dark-gray mt-1">
              {formatMoney(overview.totalRevenue)}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs text-text-light-gray uppercase tracking-wide">
              Abonnés actifs
            </p>
            <p className="text-2xl font-semibold text-text-dark-gray mt-1">
              {overview.activeSubscribersCount || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs text-text-light-gray uppercase tracking-wide">
              Paiements total
            </p>
            <p className="text-2xl font-semibold text-text-dark-gray mt-1">
              {overview.totalPaymentsCount || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <p className="text-xs text-text-light-gray uppercase tracking-wide">
              Renouvellements
            </p>
            <p className="text-2xl font-semibold text-text-dark-gray mt-1">
              {overview.totalRenewalsCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs text-text-light-gray uppercase tracking-wide">
            Article gratuit configuré
          </p>
          <p className="text-base font-semibold text-text-dark-gray mt-1">
            {config?.freeItem?.menuItemName || "Aucun article configuré"}
          </p>
        </div>
        <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs text-text-light-gray uppercase tracking-wide">
            Cadeau anniversaire configuré
          </p>
          <p className="text-base font-semibold text-text-dark-gray mt-1">
            {config?.birthdayFreeItem?.menuItemName ||
              "Aucun article configuré"}
          </p>
        </div>

        <div className="mt-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-text-dark-gray">
                Utilisateurs abonnés
              </h2>
              <div className="flex items-center gap-2">
                <label
                  className="text-xs text-text-light-gray"
                  htmlFor="subscription-status-filter"
                >
                  Filtre
                </label>
                <select
                  id="subscription-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-text-dark-gray focus:outline-none focus:border-pr"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="all">Tous</option>
                </select>
                <span className="text-xs text-text-light-gray">
                  {filteredUsers.length}
                  {statusFilter !== "all" ? ` / ${users.length}` : ""}{" "}
                  utilisateur(s)
                </span>
              </div>
            </div>

            {!hasUsers ? (
              <div className="text-sm text-text-light-gray py-10 text-center">
                {statusFilter === "all"
                  ? "Aucun utilisateur abonné pour le moment."
                  : statusFilter === "active"
                    ? "Aucun utilisateur avec un abonnement actif."
                    : "Aucun utilisateur avec un abonnement inactif."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[1.2fr,1fr,0.8fr,0.7fr,0.9fr,0.9fr,0.6fr,0.45fr] bg-gray-50 text-xs uppercase tracking-wide text-text-light-gray px-3 py-2 rounded-md">
                    <span>Utilisateur</span>
                    <span>Contact</span>
                    <span>Total payé</span>
                    <span>Paiements</span>
                    <span>Échéance</span>
                    <span>Renouvellement auto</span>
                    <span>Statut</span>
                    <span className="text-center">Voir</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="grid grid-cols-[1.2fr,1fr,0.8fr,0.7fr,0.9fr,0.9fr,0.6fr,0.45fr] items-center px-3 py-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-text-dark-gray truncate">
                            {user.name || "Sans nom"}
                          </p>
                          <p className="text-xs text-text-light-gray truncate">
                            Membre depuis: {formatDate(user.memberSinceAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-dark-gray truncate">
                            {user.email || "-"}
                          </p>
                          <p className="text-xs text-text-light-gray truncate">
                            {user.phoneNumber || "-"}
                          </p>
                        </div>
                        <p className="font-semibold text-text-dark-gray">
                          {formatMoney(user.amountPaidTotal)}
                        </p>
                        <p className="text-text-dark-gray">
                          {user.paymentsCount || 0}
                        </p>
                        <p className="text-text-dark-gray">
                          {formatDate(user.currentPeriodEnd)}
                        </p>
                        <span
                          className={
                            user.autoRenew
                              ? "inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                              : "inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-text-light-gray"
                          }
                        >
                          {user.autoRenew ? "Oui" : "Non"}
                        </span>
                        <span
                          className={
                            user.isActive
                              ? "inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                              : "inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-text-light-gray"
                          }
                        >
                          {user.isActive ? "Actif" : "Inactif"}
                        </span>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => openUserDetails(user)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-text-dark-gray hover:border-pr hover:text-pr transition"
                            title="Voir le détail abonnement"
                          >
                            <FiEye size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showManageModal && (
        <ModalWrapper zindex={20}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-5 mt-16 md:mt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-dark-gray">
                Gérer l&apos;abonnement
              </h3>
              <button
                className="text-text-light-gray hover:text-text-dark-gray"
                onClick={() => setShowManageModal(false)}
              >
                Fermer
              </button>
            </div>

            <p className="text-sm text-text-light-gray mt-2">
              Modifiez le prix mensuel de CLUB COURTEAU.
            </p>

            <div className="mt-4">
              <label className="text-sm font-semibold text-text-dark-gray">
                Prix mensuel
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-40 border border-gray-300 rounded-md p-2 focus:outline-none focus:border-pr"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                />
                <span className="text-sm font-semibold text-text-light-gray uppercase">
                  {String(config?.currency || "cad")}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                disabled={isSavingPrice}
                onClick={savePrice}
                className={
                  isSavingPrice
                    ? "bg-gray-300 text-white px-4 py-2 rounded-md font-semibold"
                    : "bg-pr text-white px-4 py-2 rounded-md font-semibold hover:brightness-95 transition"
                }
              >
                {isSavingPrice ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {showFreeItemModal && (
        <ModalWrapper zindex={20}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-5 mt-16 md:mt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-dark-gray">
                Article gratuit
              </h3>
              <button
                className="text-text-light-gray hover:text-text-dark-gray"
                onClick={() => setShowFreeItemModal(false)}
              >
                Fermer
              </button>
            </div>

            <p className="text-sm text-text-light-gray mt-2">
              Sélectionnez l&apos;article gratuit mensuel de l&apos;abonnement.
            </p>

            <div className="mt-4">
              <label className="text-sm font-semibold text-text-dark-gray">
                Article
              </label>
              <div className="mt-2">
                <DropDown
                  list={freeItemOptions}
                  value={selectedFreeItemOption}
                  setter={setSelectedFreeItemOption}
                  placeholder="Sélectionner un article"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                disabled={isSavingFreeItem}
                onClick={saveFreeItem}
                className={
                  isSavingFreeItem
                    ? "bg-gray-300 text-white px-4 py-2 rounded-md font-semibold"
                    : "bg-pr text-white px-4 py-2 rounded-md font-semibold hover:brightness-95 transition"
                }
              >
                {isSavingFreeItem ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {showHediModal && (
        <ModalWrapper zindex={20}>
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-5 mt-16 md:mt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-dark-gray">
                Solde de Hedi
              </h3>
              <button
                className="text-text-light-gray hover:text-text-dark-gray"
                onClick={() => setShowHediModal(false)}
              >
                Fermer
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-text-light-gray">
                  Solde actuel
                </p>
                <p className="text-xl font-semibold text-pr mt-1">
                  {formatMoney(hedi.balance)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-text-light-gray">
                  Crédit total
                </p>
                <p className="text-xl font-semibold text-text-dark-gray mt-1">
                  {formatMoney(hedi.totalCredits)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-text-light-gray">
                  Déjà payé
                </p>
                <p className="text-xl font-semibold text-text-dark-gray mt-1">
                  {formatMoney(hedi.totalPayouts)}
                </p>
              </div>
            </div>

            <div className="mt-5 border border-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-text-dark-gray">
                Ajouter un paiement (sortie)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="text-xs text-text-light-gray">
                    Montant
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-pr"
                    placeholder="Ex: 150"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-light-gray">Date</label>
                  <input
                    type="date"
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-pr"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-light-gray">Note</label>
                  <input
                    type="text"
                    value={payoutNote}
                    onChange={(e) => setPayoutNote(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-pr"
                    placeholder="Optionnel"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={addHediPayout}
                  disabled={isSavingPayout}
                  className={
                    isSavingPayout
                      ? "bg-gray-300 text-white px-4 py-2 rounded-md font-semibold"
                      : "bg-pr text-white px-4 py-2 rounded-md font-semibold hover:brightness-95 transition"
                  }
                >
                  {isSavingPayout
                    ? "Enregistrement..."
                    : "Enregistrer le paiement"}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-text-dark-gray mb-2">
                Historique des paiements Hedi
              </h4>
              {(hedi.payouts || []).length === 0 ? (
                <p className="text-sm text-text-light-gray">
                  Aucun paiement enregistré.
                </p>
              ) : (
                <div className="max-h-[240px] overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                  {hedi.payouts.map((entry) => (
                    <div
                      key={entry._id}
                      className="px-3 py-2 text-sm flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-text-dark-gray truncate">
                          {entry.note || "Paiement Hedi"}
                        </p>
                        <p className="text-xs text-text-light-gray">
                          {formatDate(entry.paidAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-text-dark-gray shrink-0">
                        {formatMoney(entry.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {showBirthdayFreeItemModal && (
        <ModalWrapper zindex={20}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-5 mt-16 md:mt-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-text-dark-gray">
                Cadeau anniversaire
              </h3>
              <button
                className="text-text-light-gray hover:text-text-dark-gray"
                onClick={() => setShowBirthdayFreeItemModal(false)}
              >
                Fermer
              </button>
            </div>

            <p className="text-sm text-text-light-gray mt-2">
              Sélectionnez l&apos;article gratuit pour l&apos;anniversaire
              utilisateur.
            </p>

            <div className="mt-4">
              <label className="text-sm font-semibold text-text-dark-gray">
                Article
              </label>
              <div className="mt-2">
                <DropDown
                  list={freeItemOptions}
                  value={selectedBirthdayFreeItemOption}
                  setter={setSelectedBirthdayFreeItemOption}
                  placeholder="Sélectionner un article"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                disabled={isSavingBirthdayFreeItem}
                onClick={saveBirthdayFreeItem}
                className={
                  isSavingBirthdayFreeItem
                    ? "bg-gray-300 text-white px-4 py-2 rounded-md font-semibold"
                    : "bg-pr text-white px-4 py-2 rounded-md font-semibold hover:brightness-95 transition"
                }
              >
                {isSavingBirthdayFreeItem ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {showUserDetailsModal && (
        <ModalWrapper zindex={20}>
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-5 mt-16 md:mt-0 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-text-dark-gray">
                  Détail abonnement
                </h3>
                <p className="text-sm text-text-light-gray mt-1">
                  {selectedUserDetails?.user?.name ||
                    selectedSubscriptionUser?.name ||
                    "Utilisateur"}
                </p>
              </div>
              <button
                className="text-text-light-gray hover:text-text-dark-gray"
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedSubscriptionUser(null);
                  setSelectedUserDetails(null);
                  setUserDetailsError("");
                }}
              >
                Fermer
              </button>
            </div>

            {isLoadingUserDetails ? (
              <div className="py-12 flex justify-center items-center flex-1">
                <Spinner />
              </div>
            ) : userDetailsError ? (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {userDetailsError}
              </div>
            ) : (
              <div className="mt-4 overflow-y-auto pr-1">
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-text-light-gray">
                      Statut
                    </p>
                    <p className="text-base font-semibold text-text-dark-gray mt-1">
                      {formatSubscriptionStatus(selectedUserDetails?.summary?.status)}
                    </p>
                    <p className="text-xs text-text-light-gray mt-1">
                      {selectedUserDetails?.summary?.isActive
                        ? "Abonnement actif"
                        : "Abonnement inactif"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-text-light-gray">
                      Renouvellement auto
                    </p>
                    <p className="text-base font-semibold text-text-dark-gray mt-1">
                      {selectedUserDetails?.summary?.autoRenew ? "Oui" : "Non"}
                    </p>
                    <p className="text-xs text-text-light-gray mt-1">
                      Échéance:{" "}
                      {formatDateTime(selectedUserDetails?.summary?.currentPeriodEnd)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-text-light-gray">
                      Total payé
                    </p>
                    <p className="text-base font-semibold text-text-dark-gray mt-1">
                      {formatMoney(selectedUserDetails?.summary?.amountPaidTotal)}
                    </p>
                    <p className="text-xs text-text-light-gray mt-1">
                      Paiements: {selectedUserDetails?.summary?.paymentsCount || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-text-light-gray">
                      Membre depuis
                    </p>
                    <p className="text-base font-semibold text-text-dark-gray mt-1">
                      {formatDateTime(selectedUserDetails?.summary?.memberSinceAt)}
                    </p>
                    <p className="text-xs text-text-light-gray mt-1">
                      Réabonnement:{" "}
                      {formatDateTime(
                        selectedUserDetails?.summary?.lastReSubscribedAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-dark-gray">
                      Paiements
                    </h4>
                    {(selectedUserDetails?.history?.payments || []).length === 0 ? (
                      <p className="text-sm text-text-light-gray mt-3">
                        Aucun paiement enregistré.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-[260px] overflow-y-auto divide-y divide-gray-100">
                        {selectedUserDetails.history.payments.map((entry) => (
                          <div
                            key={entry._id}
                            className="py-3 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-text-dark-gray">
                                {formatPaymentType(entry.paymentType)}
                              </p>
                              <p className="text-xs text-text-light-gray mt-1">
                                {formatDateTime(entry.paidAt)}
                              </p>
                              <p className="text-xs text-text-light-gray mt-1 truncate">
                                Facture: {entry.stripeInvoiceId || "-"}
                              </p>
                            </div>
                            <p className="font-semibold text-text-dark-gray shrink-0">
                              {formatMoney(entry.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-dark-gray">
                      Dates d&apos;échec de paiement
                    </h4>
                    {(selectedUserDetails?.history?.failedPayments || []).length ===
                    0 ? (
                      <p className="text-sm text-text-light-gray mt-3">
                        Aucun échec enregistré.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-[260px] overflow-y-auto divide-y divide-gray-100">
                        {selectedUserDetails.history.failedPayments.map((entry) => (
                          <div key={entry._id} className="py-3">
                            <p className="font-semibold text-text-dark-gray">
                              {formatDateTime(entry.occurredAt)}
                            </p>
                            <p className="text-xs text-text-light-gray mt-1">
                              Facture: {entry.stripeInvoiceId || "-"}
                            </p>
                            <p className="text-xs text-text-light-gray mt-1">
                              Grâce jusqu&apos;au: {formatDateTime(entry.graceEndsAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-dark-gray">
                      Suspensions
                    </h4>
                    {(selectedUserDetails?.history?.suspensions || []).length ===
                    0 ? (
                      <p className="text-sm text-text-light-gray mt-3">
                        Aucune suspension enregistrée.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-[260px] overflow-y-auto divide-y divide-gray-100">
                        {selectedUserDetails.history.suspensions.map((entry) => (
                          <div key={entry._id} className="py-3">
                            <p className="font-semibold text-text-dark-gray">
                              {formatDateTime(entry.occurredAt)}
                            </p>
                            <p className="text-xs text-text-light-gray mt-1">
                              Raison: {entry.reason || "-"}
                            </p>
                            <p className="text-xs text-text-light-gray mt-1">
                              Facture liée: {entry.stripeInvoiceId || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-text-dark-gray">
                      Réabonnements
                    </h4>
                    {(selectedUserDetails?.history?.resubscriptions || []).length ===
                    0 ? (
                      <p className="text-sm text-text-light-gray mt-3">
                        Aucun réabonnement enregistré.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-[260px] overflow-y-auto divide-y divide-gray-100">
                        {selectedUserDetails.history.resubscriptions.map((entry) => (
                          <div
                            key={entry._id}
                            className="py-3 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-text-dark-gray">
                                {formatDateTime(entry.occurredAt)}
                              </p>
                              <p className="text-xs text-text-light-gray mt-1 truncate">
                                Facture: {entry.stripeInvoiceId || "-"}
                              </p>
                            </div>
                            <p className="font-semibold text-text-dark-gray shrink-0">
                              {formatMoney(entry.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default SubscriptionSettingsPage;
