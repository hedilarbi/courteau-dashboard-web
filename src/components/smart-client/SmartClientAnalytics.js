"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaExclamationTriangle, FaRedo, FaSpinner } from "react-icons/fa";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";

const API_URL = SMART_CLIENT_API_URL;
const COLORS = ["#F7A600", "#2563EB", "#10B981", "#EF4444", "#8B5CF6", "#64748B"];

const formatDuration = (milliseconds = 0) => {
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${seconds % 60} s`;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-CA", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const EVENT_LABELS = {
  app_opened: "Application ouverte",
  app_resumed: "Application reprise",
  app_backgrounded: "Application en arrière-plan",
  screen_entered: "Écran ouvert",
  screen_view: "Écran consulté",
  screen_duration: "Temps passé sur l’écran",
  screen_idle: "Inactivité sur l’écran",
  tappable_clicked: "Clic",
  cart_changed: "Panier modifié",
  cart_total_viewed: "Sous-total du panier consulté",
  checkout_returned_to_cart: "Retour du paiement vers le panier",
  state_changed: "État comportemental modifié",
  smart_offer_triggered: "Offre Smart Client proposée",
  smart_offer_accepted: "Offre Smart Client acceptée",
  smart_offer_refused: "Offre Smart Client refusée",
  order_confirmed: "Commande confirmée",
  app_heartbeat: "Application toujours active",
};
const TRACK_LABELS = {
  add_to_cart_btn: "Ajouter ou enregistrer l’article",
  menu_item_select_btn: "Ouvrir un article du menu",
  menu_category_btn: "Changer de catégorie",
  main_tab_btn: "Changer d’onglet principal",
  accept_smart_offer_btn: "Accepter l’offre Smart Client",
  close_smart_offer_btn: "Fermer l’offre Smart Client",
  checkout_btn: "Passer la commande",
  size_selector: "Modifier la taille",
};
const money = (value) => `${Number(value || 0).toFixed(2)} $`;
const itemLabel = (item = {}) => [item.itemName || item.itemId || "Article", item.size ? `(${item.size})` : ""].filter(Boolean).join(" ");
const describeEvent = (event) => {
  const payload = event.payload || {};
  if (event.event === "cart_changed") {
    if (payload.addedItems?.length) return `Ajout : ${payload.addedItems.map(itemLabel).join(", ")} · ${money(payload.previousTotal)} → ${money(payload.total)}`;
    if (payload.removedItems?.length) return `Retrait : ${payload.removedItems.map(itemLabel).join(", ")} · ${money(payload.previousTotal)} → ${money(payload.total)}`;
    if (payload.modifiedItems?.length) {
      const changes = payload.modifiedItems.map(({ before, after }) => `${itemLabel(before)} → ${itemLabel(after)} (${money(before.price)} → ${money(after.price)})`);
      return `Modification : ${changes.join(", ")}`;
    }
    if (payload.action === "basket/addOfferToBasket") return `Ancien flux : remise ajoutée comme offre panier (${money(payload.delta)})`;
    return `${payload.operation || payload.action || "Modification"} · ${money(payload.previousTotal)} → ${money(payload.total)}`;
  }
  if (event.event === "cart_total_viewed") return `${money(payload.total)} · ${payload.lines || 0} article(s)`;
  if (event.event === "checkout_returned_to_cart") return `${payload.from || "Checkout"} → ${payload.to || "Panier"}`;
  if (event.event === "tappable_clicked") {
    const target = TRACK_LABELS[payload.trackId] || payload.trackId || "élément non identifié";
    const operation = payload.operation === "modify" ? "Modification" : payload.operation === "add" ? "Ajout" : null;
    const customizationNames = (payload.customizations || []).map((item) => item.name || item.id).filter(Boolean).join(", ");
    return [target, operation, payload.itemName, payload.categoryName, payload.tabName, payload.size, payload.price != null ? money(payload.price) : null, customizationNames ? `Options : ${customizationNames}` : null].filter(Boolean).join(" · ");
  }
  if (["screen_entered", "screen_view"].includes(event.event)) return payload.screen ? `Écran : ${payload.screen}` : "";
  if (event.event === "screen_duration") return `${payload.screen || "Écran"} · ${formatDuration(payload.durationMs)}`;
  if (event.event === "screen_idle") return `${payload.screen || "Écran"} · inactif ${formatDuration(payload.idleMs)}`;
  if (event.event === "state_changed") return `${payload.previous || "—"} → ${payload.current || "—"}${payload.source === "server" ? " (serveur)" : ""}`;
  if (event.event === "smart_offer_triggered") return `Règle ${payload.ruleId || "—"} · exposition ${payload.exposureId || "—"}`;
  if (event.event === "smart_offer_accepted") return `Règle ${payload.ruleId || "—"}`;
  return Object.keys(payload).length ? JSON.stringify(payload) : "";
};

const TimelineEvent = ({ event, index }) => {
  const payload = event.payload || {};
  const hasPayload = Object.keys(payload).length > 0;
  return (
    <div className="grid gap-2 rounded-lg border p-3 text-xs md:grid-cols-[145px_190px_120px_1fr]" key={`${event._id || event.timestamp}-${index}`}>
      <span>{formatDate(event.timestamp)}</span>
      <strong title={event.event}>{EVENT_LABELS[event.event] || event.event}</strong>
      <span>{event.state || "—"}</span>
      <div className="min-w-0 text-gray-600">
        <p className="break-words font-medium text-gray-700">{describeEvent(event) || "—"}</p>
        {hasPayload && <details className="mt-1"><summary className="cursor-pointer text-gray-400">Détails techniques</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2">{JSON.stringify(payload, null, 2)}</pre></details>}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, detail }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-2 text-2xl font-black text-gray-800">{value}</p>
    {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
  </div>
);

export default function SmartClientAnalytics() {
  const [periodDays, setPeriodDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionDetail, setSessionDetail] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const to = new Date();
      const from = new Date(to.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
      const headers = await getSmartClientAuthHeaders();
      const [summaryResponse, sessionsResponse] = await Promise.all([
        fetch(`${API_URL}/smart-client/analytics/summary?${query}`, { headers }),
        fetch(`${API_URL}/smart-client/analytics/sessions?${query}&limit=50`, { headers }),
      ]);

      const [summaryJson, sessionsJson] = await Promise.all([
        summaryResponse.json(),
        sessionsResponse.json(),
      ]);
      if (!summaryResponse.ok || !summaryJson.success) {
        throw new Error(summaryJson.message || "Impossible de charger les analytics.");
      }
      if (!sessionsResponse.ok || !sessionsJson.success) {
        throw new Error(sessionsJson.message || "Impossible de charger les sessions.");
      }

      setSummary(summaryJson.data);
      setSessions(sessionsJson.data?.sessions || []);
    } catch (loadError) {
      setError(loadError.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const openSession = async (session) => {
    setSessionDetail({ session, events: null });
    try {
      const response = await fetch(`${API_URL}/smart-client/analytics/sessions/${encodeURIComponent(session.sessionId)}/events`, { headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Détail indisponible.");
      setSessionDetail({ session, events: json.data || [] });
    } catch (detailError) { setSessionDetail({ session, events: [], error: detailError.message }); }
  };

  const exportCsv = () => {
    const rows = [
      ["type", "nom", "valeur", "valeur_2"],
      ...(summary?.states || []).map((item) => ["etat", item.state, item.count, ""]),
      ...(summary?.screens || []).map((item) => ["ecran", item.screen, item.visits, item.averageDurationMs]),
      ...(summary?.tappables || []).map((item) => ["interaction", item.trackId, item.count, ""]),
      ...(summary?.rulePerformance || []).map((item) => ["regle", item.ruleName || item.ruleId, item.acceptanceRate, item.conversionRate]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `smart-client-${periodDays}j.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  if (loading && !summary) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <FaSpinner className="mr-3 animate-spin text-pr" /> Chargement des analytics…
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <FaExclamationTriangle className="mb-3 text-3xl text-red-500" />
        <p className="font-bold text-gray-800">Analytics indisponibles</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button onClick={loadAnalytics} className="mt-4 rounded-lg bg-pr px-4 py-2 font-bold text-white">
          Réessayer
        </button>
      </div>
    );
  }

  const overview = summary?.overview || {};
  const offers = summary?.offers || {};
  const stateData = summary?.states || [];
  const hasData = (overview.totalEvents || 0) > 0;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-800">Comportement des utilisateurs</h2>
          <p className="text-sm text-gray-500">Mesures collectées par le moteur Smart Client.</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriodDays(days)}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${periodDays === days ? "bg-pr text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {days} jours
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            disabled={loading}
            title="Actualiser"
            className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-pr disabled:opacity-50"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={exportCsv} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600">Exporter CSV</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Événements" value={overview.totalEvents || 0} />
        <StatCard label="Sessions" value={overview.totalSessions || 0} />
        <StatCard label="Utilisateurs" value={overview.uniqueAuthenticatedUsers || 0} detail="authentifiés" />
        <StatCard label="Durée moyenne" value={formatDuration(overview.averageSessionDurationMs)} />
        <StatCard label="Checkout" value={`${overview.checkoutIntentRate || 0} %`} detail={`${overview.checkoutIntentSessions || 0} sessions`} />
        <StatCard label="Abandon" value={`${overview.abandonmentRate || 0} %`} detail={`${overview.abandonedSessions || 0} sessions`} />
        <StatCard label="Frustration" value={`${overview.frustrationRate || 0} %`} detail={`${overview.frustratedSessions || 0} sessions`} />
        <StatCard label="Acceptation" value={`${offers.acceptanceRate || 0} %`} detail={`${offers.accepted || 0}/${offers.triggered || 0} offres`} />
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <p className="font-bold text-gray-700">Aucune donnée sur cette période</p>
          <p className="mt-1 text-sm text-gray-500">Les sessions apparaîtront ici après réception des événements de l’application.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Sessions et événements par jour</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={summary.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#F7A600" strokeWidth={3} />
                  <Line type="monotone" dataKey="events" name="Événements" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">États détectés</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stateData} dataKey="count" nameKey="state" innerRadius={55} outerRadius={95} label>
                    {stateData.map((entry, index) => <Cell key={entry.state} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Temps moyen par écran</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(summary.screens || []).slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tickFormatter={(value) => `${Math.round(value / 1000)}s`} />
                  <YAxis type="category" dataKey="screen" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatDuration(value)} />
                  <Bar dataKey="averageDurationMs" name="Durée moyenne" fill="#F7A600" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Interactions les plus fréquentes</h3>
              <div className="max-h-[300px] overflow-y-auto">
                {(summary.tappables || []).map((item, index) => (
                  <div key={item.trackId} className="flex items-center justify-between border-b border-gray-100 py-3">
                    <span className="text-sm text-gray-700"><span className="mr-2 text-gray-400">#{index + 1}</span>{item.trackId}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">{item.count} clics</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h3 className="font-bold text-gray-800">Dernières sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Début</th><th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Durée</th><th className="px-4 py-3">Événements</th>
                    <th className="px-4 py-3">Dernier état</th><th className="px-4 py-3">Signaux</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.sessionId} onClick={() => openSession(session)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50" title="Voir la chronologie">
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(session.startedAt)}</td>
                      <td className="max-w-[220px] truncate px-4 py-3" title={`${session.userName || ""} ${session.userEmail || ""} ${session.userId || ""}`}>
                        {session.userName || session.userEmail || "Anonyme"}
                        {session.userName && session.userEmail ? <span className="block text-xs text-gray-400">{session.userEmail}</span> : null}
                      </td>
                      <td className="px-4 py-3">{formatDuration(session.durationMs)}</td>
                      <td className="px-4 py-3 font-bold">{session.eventCount}</td>
                      <td className="px-4 py-3">{session.lastState || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {session.checkoutIntent && <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">Checkout</span>}
                          {session.abandoned && <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">Abandon</span>}
                          {session.frustrated && <span className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-700">Frustration</span>}
                          {session.offerAccepted && <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">Offre acceptée</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {(summary.rulePerformance || []).length > 0 && <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b p-4"><h3 className="font-bold">Performance par règle et groupe</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Règle</th><th className="p-3">Groupe</th><th className="p-3">Affichées</th><th className="p-3">Acceptation</th><th className="p-3">Conversion</th><th className="p-3">Revenu</th><th className="p-3">Coût</th><th className="p-3">ROI</th></tr></thead><tbody>{summary.rulePerformance.map((item) => <tr key={`${item.ruleId}-${item.group}`} className="border-t"><td className="p-3 font-bold">{item.ruleName || item.ruleId}</td><td className="p-3">{item.group}</td><td className="p-3">{item.displayed}</td><td className="p-3">{item.acceptanceRate}%</td><td className="p-3">{item.conversionRate}%</td><td className="p-3">{item.revenue}$</td><td className="p-3">{item.discountCost}$</td><td className="p-3">{item.roi == null ? "—" : item.roi}</td></tr>)}</tbody></table></div></div>}
          {sessionDetail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSessionDetail(null)}>
            <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b p-5"><div><h3 className="text-lg font-bold">Chronologie de session</h3><p className="text-xs text-gray-500">{sessionDetail.session.sessionId}</p></div><button onClick={() => setSessionDetail(null)} className="text-2xl">×</button></div>
              <div className="max-h-[70vh] overflow-y-auto p-5">
                {sessionDetail.error && <p className="rounded bg-red-50 p-3 text-red-700">{sessionDetail.error}</p>}
                {!sessionDetail.events && <p className="text-gray-500">Chargement…</p>}
                <div className="space-y-2">{(sessionDetail.events || []).map((event, index) => <TimelineEvent event={event} index={index} key={`${event._id || event.timestamp}-${index}`} />)}</div>
              </div>
            </div>
          </div>}
        </>
      )}
    </div>
  );
}
