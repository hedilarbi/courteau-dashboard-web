"use client";

import React from "react";

const formatMoney = (value) =>
  `${new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))} $`;

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatRate = (value) => `${toSafeNumber(value, 0)} %`;

const UserStatsPanel = ({ stats }) => {
  const summary = stats?.summary || {};
  const promoOrders = Math.max(0, Math.floor(toSafeNumber(summary.promoOrders, 0)));
  const noPromoOrders = Math.max(
    0,
    Math.floor(toSafeNumber(summary.noPromoOrders, 0)),
  );
  const deliveryOrders = Math.max(
    0,
    Math.floor(toSafeNumber(summary.deliveryOrders, 0)),
  );
  const pickupOrders = Math.max(
    0,
    Math.floor(toSafeNumber(summary.pickupOrders, 0)),
  );
  const otherTypeOrders = Math.max(
    0,
    Math.floor(toSafeNumber(summary.otherTypeOrders, 0)),
  );
  const frequencyPerWeek = summary.frequencyPerWeek;
  const hasFrequency =
    frequencyPerWeek !== null && frequencyPerWeek !== undefined;

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-2xl font-roboto font-semibold">Statistiques</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Panier moyen
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1">
            {formatMoney(summary.averageBasket)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Frequence d&apos;achat
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1">
            {hasFrequency ? `${frequencyPerWeek} / semaine` : "-"}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Heure de commande
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1">
            {summary.preferredOrderHour || "-"}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Jours preferes
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1">
            {summary.preferredOrderDay || "-"}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Produits preferes
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1 break-words">
            {summary.favoriteProduct || "-"}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Utilise promo ou non
          </p>
          <p className="text-base font-semibold text-text-dark-gray mt-1">
            Avec promo: {promoOrders}
          </p>
          <p className="text-base font-semibold text-text-dark-gray">
            Sans promo: {noPromoOrders}
          </p>
          <p className="text-xs text-text-light-gray mt-1">
            Taux d&apos;utilisation: {formatRate(summary.promoUsageRate)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Livraison vs ramassage
          </p>
          <p className="text-base font-semibold text-text-dark-gray mt-1">
            Livraison: {deliveryOrders}
          </p>
          <p className="text-base font-semibold text-text-dark-gray">
            Ramassage: {pickupOrders}
          </p>
          <p className="text-xs text-text-light-gray mt-1">
            Autre: {otherTypeOrders}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-default">
          <p className="text-xs uppercase tracking-wide text-text-light-gray">
            Nombre de commandes
          </p>
          <p className="text-xl font-semibold text-text-dark-gray mt-1">
            {Math.max(0, Math.floor(toSafeNumber(summary.totalOrders, 0)))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPanel;
