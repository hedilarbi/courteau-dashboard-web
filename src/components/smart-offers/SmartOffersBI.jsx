"use client";
// BI & ROI des smart offers V2 : chiffres réels calculés par le serveur (GET /smart-offers-v2/bi).
// Lecture en 3 niveaux : santé globale (tuiles) → où se perdent les clients (entonnoir, évolution)
// → performance par règle et par offre (tableau, clic = détail).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaInfoCircle,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { getToken } from "@/actions";
import Spinner from "@/components/spinner/Spinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Palette de référence validée (2 séries, fond clair) + statuts réservés aux verdicts.
const COLORS = {
  sent: "#2a78d6",
  used: "#eb6834",
  grid: "#ece9e2",
  axis: "#8a867c",
  textPrimary: "#1c1b19",
  textSecondary: "#52514e",
};
const VERDICT_STYLES = {
  good: { color: "#0ca30c", bg: "bg-green-50", border: "border-green-200", Icon: FaCheckCircle },
  watch: { color: "#b07a00", bg: "bg-amber-50", border: "border-amber-200", Icon: FaExclamationTriangle },
  bad: { color: "#d03b3b", bg: "bg-red-50", border: "border-red-200", Icon: FaTimesCircle },
  pending: { color: "#6b6a64", bg: "bg-gray-50", border: "border-gray-200", Icon: FaHourglassHalf },
};

const PRESETS = [
  { key: "7", label: "7 jours", days: 7 },
  { key: "30", label: "30 jours", days: 30 },
  { key: "90", label: "90 jours", days: 90 },
];

const money = (value) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Number(value) || 0);
const moneyPrecise = (value) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(Number(value) || 0);
const isoDate = (date) => date.toISOString().slice(0, 10);
const formatRoi = (roi, cost) => (roi === null || roi === undefined ? (cost > 0 ? "—" : "∞") : `× ${roi.toLocaleString("fr-CA")}`);
const formatDelay = (hours) => {
  if (hours === null || hours === undefined) return "—";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} j`;
};
const signedPct = (value) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toLocaleString("fr-CA")} %`;
// Panier commandé (avant rabais) comparé à l'habitude des mêmes clients.
const basketSummary = (row) => {
  if (!row.orders) return "—";
  if (!row.usualBasket) return `commandé ${moneyPrecise(row.avgOrdered)} · pas d'historique sans offre`;
  return `leur habitude ${moneyPrecise(row.usualBasket)} · payé après rabais ${moneyPrecise(row.avgBasket)}`;
};
const shortDay = (key) => {
  const [, m, d] = String(key).split("-");
  return `${d}/${m}`;
};

const VerdictBadge = ({ verdict, withReason = false }) => {
  if (!verdict) return null;
  const style = VERDICT_STYLES[verdict.level] || VERDICT_STYLES.pending;
  const { Icon } = style;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${style.bg} ${style.border}`}>
      <Icon style={{ color: style.color }} aria-hidden />
      <span className="text-gray-800">{verdict.label}</span>
      {withReason && verdict.reason ? <span className="font-normal text-gray-600">· {verdict.reason}</span> : null}
    </span>
  );
};

const Delta = ({ current, previous, suffix = "%", invert = false, points = false }) => {
  if (previous === null || previous === undefined || !Number.isFinite(previous)) return null;
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">= période préc.</span>;
  const diff = points ? current - previous : previous > 0 ? ((current - previous) / previous) * 100 : null;
  if (diff === null) return <span className="text-xs text-gray-400">nouveau</span>;
  const up = diff > 0;
  const good = invert ? !up : up;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${diff === 0 ? "text-gray-400" : good ? "text-green-700" : "text-red-600"}`}>
      {diff !== 0 && (up ? <FaArrowUp aria-hidden /> : <FaArrowDown aria-hidden />)}
      {Math.abs(Math.round(diff * 10) / 10).toLocaleString("fr-CA")}
      {points ? " pt" : suffix} vs période préc.
    </span>
  );
};

const StatTile = ({ label, value, sub, delta, hint }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4" title={hint}>
    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    <div className="mt-1 min-h-[18px]">{delta}</div>
  </div>
);

const FunnelBars = ({ steps }) => {
  const max = steps[0]?.value || 1;
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const prev = index > 0 ? steps[index - 1].value : null;
        const conv = prev ? Math.round((step.value / prev) * 1000) / 10 : null;
        return (
          <div key={step.key}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-gray-800">{step.label}</span>
              <span className="text-gray-700">
                <strong>{step.value.toLocaleString("fr-CA")}</strong>
                {conv !== null && <span className="ml-2 text-xs text-gray-500">({conv} % de l&apos;étape préc.)</span>}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded bg-gray-100">
              <div
                className="h-full rounded-r"
                style={{ width: `${Math.max(step.value > 0 ? 1 : 0, (step.value / max) * 100)}%`, backgroundColor: COLORS.sent }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SORTS = {
  revenue: (a, b) => b.revenue - a.revenue,
  useRate: (a, b) => b.useRate - a.useRate,
  roi: (a, b) => (b.roi ?? (b.cost > 0 ? -1 : 1e9)) - (a.roi ?? (a.cost > 0 ? -1 : 1e9)),
  sent: (a, b) => b.sent - a.sent,
  cost: (a, b) => b.cost - a.cost,
};

const MetricCells = ({ row }) => (
  <>
    <td className="px-3 py-2.5 text-right tabular-nums">{row.sent}</td>
    <td className="px-3 py-2.5 text-right tabular-nums">
      {row.used} <span className="text-gray-500">({row.useRate} %)</span>
    </td>
    <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{money(row.revenue)}</td>
    <td className="px-3 py-2.5 text-right tabular-nums">{money(row.cost)}</td>
    <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{formatRoi(row.roi, row.cost)}</td>
    <td className="px-3 py-2.5 text-right tabular-nums" title={row.orders ? basketSummary(row) : undefined}>
      {row.orders ? moneyPrecise(row.avgOrdered) : "—"}
      {row.orderedLift !== null && row.orders > 0 && (
        <span className={`block text-xs ${row.orderedLift >= 0 ? "text-green-700" : "text-red-600"}`}>
          {signedPct(row.orderedLift)} vs leur habitude
        </span>
      )}
    </td>
  </>
);

const DetailPanel = ({ item, onClose }) => {
  if (!item) return null;
  const funnel = [
    { key: "sent", label: "Envoyées", value: item.sent },
    { key: "viewed", label: "Vues", value: item.viewed },
    { key: "clicked", label: "Cliquées", value: item.clicked },
    { key: "used", label: "Utilisées", value: item.used },
  ];
  const cb = item.costBreakdown || {};
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="Détail de l'offre"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{item.ruleName}</p>
            <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Fermer">
            <FaTimes />
          </button>
        </div>
        <div className="mt-3">
          <VerdictBadge verdict={item.verdict} withReason />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatTile label="CA généré" value={money(item.revenue)} sub={`montant de ${item.orders} commande(s) avec cette offre`} />
          <StatTile
            label="ROI"
            value={formatRoi(item.roi, item.cost)}
            sub={item.roi ? `1 $ offert = ${moneyPrecise(item.roi)} de commandes (coût ${moneyPrecise(item.cost)})` : `coût ${moneyPrecise(item.cost)}`}
          />
          <StatTile
            label="Panier commandé"
            value={item.orders ? moneyPrecise(item.avgOrdered) : "—"}
            sub={basketSummary(item)}
            delta={
              item.orderedLift !== null && item.orders > 0 ? (
                <span className={`text-xs font-semibold ${item.orderedLift >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {signedPct(item.orderedLift)} vs leur habitude
                </span>
              ) : null
            }
          />
          <StatTile label="Délai avant commande" value={formatDelay(item.medianDelayHours)} sub="médiane, depuis l'envoi" />
        </div>

        <h4 className="mt-6 mb-3 text-sm font-black text-gray-800">Parcours des clients</h4>
        <FunnelBars steps={funnel} />

        <h4 className="mt-6 mb-2 text-sm font-black text-gray-800">De quoi est fait le coût</h4>
        <table className="w-full text-sm">
          <tbody>
            {[
              ["Rabais appliqués", cb.discount],
              ["Articles offerts", cb.gifts],
              ["Livraisons offertes", cb.delivery],
              ["Points bonus (10 pts = 1 $)", cb.points],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-1.5 text-gray-600">{label}</td>
                <td className="py-1.5 text-right tabular-nums">{moneyPrecise(value)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-1.5 font-bold">Total</td>
              <td className="py-1.5 text-right font-bold tabular-nums">{moneyPrecise(item.cost)}</td>
            </tr>
          </tbody>
        </table>

        <h4 className="mt-6 mb-2 text-sm font-black text-gray-800">Dernières commandes</h4>
        {item.recentOrders?.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="py-1">Commande</th>
                <th className="py-1">Client</th>
                <th className="py-1 text-right">CA</th>
                <th className="py-1 text-right">Coût</th>
              </tr>
            </thead>
            <tbody>
              {item.recentOrders.map((order) => (
                <tr key={`${order.code}-${order.date}`} className="border-t border-gray-100">
                  <td className="py-1.5">
                    #{order.code}
                    <span className="block text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString("fr-CA")}
                      {order.isCashbackReward ? " · récompense cashback" : ""}
                    </span>
                  </td>
                  <td className="py-1.5">{order.customer}</td>
                  <td className="py-1.5 text-right tabular-nums">{moneyPrecise(order.revenue)}</td>
                  <td className="py-1.5 text-right tabular-nums">{moneyPrecise(order.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Aucune commande avec cette offre sur la période.</p>
        )}
      </aside>
    </div>
  );
};

export default function SmartOffersBI() {
  const [preset, setPreset] = useState("30");
  const [customFrom, setCustomFrom] = useState(isoDate(new Date(Date.now() - 30 * 86400000)));
  const [customTo, setCustomTo] = useState(isoDate(new Date()));
  const [campaignId, setCampaignId] = useState("");
  const [includeTests, setIncludeTests] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState("revenue");
  const [openRules, setOpenRules] = useState({});
  const [detail, setDetail] = useState(null);
  const [showMethod, setShowMethod] = useState(false);

  const range = useMemo(() => {
    if (preset === "custom") return { from: customFrom, to: customTo };
    const days = PRESETS.find((p) => p.key === preset)?.days || 30;
    return { from: isoDate(new Date(Date.now() - days * 86400000)), to: isoDate(new Date()) };
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/smart-offers-v2/campaigns`, { headers: { Authorization: `Bearer ${token?.value}` } });
        if (res.ok) setCampaigns(await res.json());
      } catch {}
    })();
  }, []);

  const fetchBI = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const params = new URLSearchParams({ from: range.from, to: range.to });
      if (campaignId) params.set("campaignId", campaignId);
      if (includeTests) params.set("includeTests", "1");
      const res = await fetch(`${API_URL}/smart-offers-v2/bi?${params}`, { headers: { Authorization: `Bearer ${token?.value}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors du chargement des statistiques");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, campaignId, includeTests]);

  useEffect(() => {
    fetchBI();
  }, [fetchBI]);

  // Règles supprimées (historique) toujours en bas, quel que soit le tri.
  const rules = useMemo(
    () => [...(data?.rules || [])].sort((a, b) => Number(a.isDeleted || 0) - Number(b.isDeleted || 0) || SORTS[sortKey](a, b)),
    [data, sortKey],
  );

  const k = data?.kpis;
  const p = data?.previousKpis;

  const SortHeader = ({ id, children, align = "right", hint }) => (
    <th className={`px-3 py-2 ${align === "right" ? "text-right" : "text-left"}`} title={hint}>
      <button
        type="button"
        onClick={() => setSortKey(id)}
        className={`text-xs font-bold uppercase tracking-wide ${sortKey === id ? "text-gray-900 underline" : "text-gray-500 hover:text-gray-800"}`}
      >
        {children}
      </button>
    </th>
  );

  return (
    <div className="space-y-6 pb-10 text-gray-800">
      {/* Filtres : une seule ligne au-dessus de tout */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">
          {[...PRESETS, { key: "custom", label: "Personnalisé" }].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setPreset(option.key)}
              className={`px-3 py-1.5 text-sm font-semibold ${preset === option.key ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-2 text-sm">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="rounded border border-gray-300 px-2 py-1" />
            <span>→</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="rounded border border-gray-300 px-2 py-1" />
          </div>
        )}
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm"
          aria-label="Campagne"
        >
          <option value="">Toutes les campagnes</option>
          {campaigns.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={includeTests} onChange={(e) => setIncludeTests(e.target.checked)} />
          Inclure les campagnes de test
        </label>
        <button
          type="button"
          onClick={() => setShowMethod((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <FaInfoCircle /> Comment sont calculés ces chiffres
        </button>
      </div>

      {showMethod && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-gray-700">
          <p>
            <strong>Offres analysées :</strong> les offres smart offers V2 <em>envoyées</em> pendant la période. Leurs
            commandes comptent même si elles sont passées après la fin de la période.
          </p>
          <p className="mt-1">
            <strong>Utilisée :</strong> au moins une commande confirmée et non annulée l&apos;a utilisée.
          </p>
          <p className="mt-1">
            <strong>CA généré :</strong> sous-total après rabais (avant taxes) de ces commandes. C&apos;est le CA{" "}
            <em>des</em> commandes avec offre, pas un CA supplémentaire : certains clients auraient commandé sans offre.
          </p>
          <p className="mt-1">
            <strong>Coût :</strong> rabais réellement appliqués + valeur des articles offerts + livraisons offertes +
            points bonus (10 points = 1 $). La part Hedi n&apos;est pas comptée. Cashback : le rabais utilisé à la commande
            suivante est compté sur l&apos;offre cashback d&apos;origine.
          </p>
          <p className="mt-1">
            <strong>ROI :</strong> CA généré ÷ coût. × 5 = chaque dollar offert accompagne 5 $ de commandes.
          </p>
          <p className="mt-1">
            <strong>Panier commandé :</strong> panier moyen <em>avant rabais</em> des clients qui ont utilisé l&apos;offre,
            comparé à leurs propres commandes sans offre (leur habitude). Il montre si l&apos;offre les fait commander plus.
            Le montant <em>payé</em> (après rabais) est indiqué à côté.
          </p>
          <p className="mt-1">
            <strong>Verdict :</strong> ⏳ Trop tôt pour juger tant que l&apos;offre n&apos;a pas{" "}
            {data?.settings?.verdict?.minDays ?? 7} jours et {data?.settings?.verdict?.minResolved ?? 20} offres terminées
            (utilisées, ignorées ou expirées) · 🟢 Rentable si ROI ≥ {data?.settings?.verdict?.goodRoi ?? 3} et au moins{" "}
            {data?.settings?.verdict?.goodRate ?? 15} % d&apos;offres utilisées · 🔴 À revoir si elle coûte plus
            qu&apos;elle ne rapporte, si ROI &lt; {data?.settings?.verdict?.badRoi ?? 1.5} ou moins de{" "}
            {data?.settings?.verdict?.badRate ?? 5} % d&apos;utilisation · 🟡 À surveiller entre les deux.
          </p>
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-red-600">Erreur : {error}</div>
      ) : (
        k && (
          <div className={`space-y-6 ${loading ? "opacity-60" : ""}`}>
            {/* ① Santé globale */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-lg font-black text-gray-900">Vue d&apos;ensemble</h2>
                <VerdictBadge verdict={k.verdict} withReason />
              </div>
              <p className="mb-3 text-sm leading-relaxed text-gray-700">
                En résumé : <strong>{k.sent.toLocaleString("fr-CA")}</strong> clients ont reçu une offre,{" "}
                <strong>{k.used.toLocaleString("fr-CA")}</strong> l&apos;ont utilisée sur une commande
                {k.orders > 0 && (
                  <>
                    {" "}pour <strong>{money(k.revenue)}</strong> de commandes. Les offres ont coûté <strong>{money(k.cost)}</strong>
                    {k.roi ? <> : chaque 1 $ offert a accompagné <strong>{moneyPrecise(k.roi)}</strong> de commandes</> : null}
                  </>
                )}
                .
              </p>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <StatTile
                  label="Offres envoyées"
                  value={k.sent.toLocaleString("fr-CA")}
                  sub="clients qui ont reçu une offre"
                  delta={<Delta current={k.sent} previous={p?.sent} />}
                />
                <StatTile
                  label="Utilisées"
                  value={`${k.used.toLocaleString("fr-CA")}`}
                  sub={`${k.useRate} % des offres envoyées ont servi à une commande`}
                  delta={<Delta current={k.useRate} previous={p?.useRate} points />}
                />
                <StatTile
                  label="CA généré"
                  value={money(k.revenue)}
                  sub={`montant de ${k.orders} commande(s) avec offre, avant taxes`}
                  delta={<Delta current={k.revenue} previous={p?.revenue} />}
                />
                <StatTile
                  label="Coût total"
                  value={money(k.cost)}
                  sub="ce que les offres ont coûté : rabais, cadeaux, livraison, points"
                  delta={<Delta current={k.cost} previous={p?.cost} invert />}
                />
                <StatTile
                  label="ROI"
                  value={formatRoi(k.roi, k.cost)}
                  sub={k.roi ? `1 $ offert = ${moneyPrecise(k.roi)} de commandes (ce n'est pas un profit)` : "aucun coût sur la période"}
                />
                <StatTile
                  label="Panier commandé avec offre"
                  value={k.orders ? moneyPrecise(k.avgOrdered) : "—"}
                  sub={basketSummary(k)}
                  delta={
                    k.orderedLift !== null && k.orders > 0 ? (
                      <span className={`text-xs font-semibold ${k.orderedLift >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {signedPct(k.orderedLift)} vs leur habitude
                      </span>
                    ) : null
                  }
                />
              </div>
            </section>

            {/* ② Entonnoir + ③ évolution */}
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-base font-black text-gray-900">Où se perdent les clients</h3>
                <p className="mb-4 text-xs text-gray-500">
                  Chaque barre : nombre d&apos;offres qui atteignent l&apos;étape. « Vues » ne compte que les ouvertures dans
                  l&apos;app : une offre lue dans un courriel n&apos;y apparaît pas.
                </p>
                <FunnelBars steps={data.funnel} />
                <p className="mt-4 text-xs text-gray-500">
                  Non utilisées : {data.outcomes.expired} expirées · {data.outcomes.ignored} ignorées (commande passée sans l&apos;offre)
                  {k.medianDelayHours !== null && <> · délai médian avant commande : {formatDelay(k.medianDelayHours)}</>}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-base font-black text-gray-900">Évolution jour par jour</h3>
                <p className="mb-2 text-xs text-gray-500">Offres envoyées et commandes avec offre, par jour (heure de Toronto).</p>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.series} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                      <CartesianGrid stroke={COLORS.grid} vertical={false} />
                      <XAxis dataKey="date" tickFormatter={shortDay} tick={{ fill: COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
                      <YAxis allowDecimals={false} tick={{ fill: COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        labelFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
                        formatter={(value, name) => [value, name]}
                        contentStyle={{ borderRadius: 8, borderColor: "#e5e3dc", fontSize: 12 }}
                      />
                      <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: COLORS.textSecondary }} />
                      <Line type="monotone" dataKey="sent" name="Offres envoyées" stroke={COLORS.sent} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="used" name="Commandes avec offre" stroke={COLORS.used} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* ④ Performance par règle et par offre */}
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-baseline justify-between gap-2 p-5 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Performance par règle et par offre</h3>
                  <p className="text-xs text-gray-500">Cliquez sur une règle pour voir ses offres, puis sur une offre pour son détail. Cliquez sur un titre de colonne pour trier.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead className="border-y border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Règle / offre</th>
                      <SortHeader id="sent" hint="Nombre de clients qui ont reçu l'offre">Envoyées</SortHeader>
                      <SortHeader id="useRate" hint="Offres qui ont servi à une commande (et en % des envoyées)">Utilisées</SortHeader>
                      <SortHeader id="revenue" hint="Montant des commandes passées avec l'offre, avant taxes">CA</SortHeader>
                      <SortHeader id="cost" hint="Ce que l'offre t'a coûté : rabais, articles offerts, livraison, points">Coût</SortHeader>
                      <SortHeader id="roi" hint="CA ÷ coût : × 3 = chaque 1 $ offert a accompagné 3 $ de commandes">ROI</SortHeader>
                      <th
                        className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-gray-500"
                        title="Panier moyen avant rabais des clients qui ont utilisé l'offre, comparé à leurs commandes habituelles sans offre"
                      >
                        Panier commandé
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-10 text-center text-gray-500">
                          Aucune offre envoyée sur cette période.
                        </td>
                      </tr>
                    )}
                    {rules.map((rule) => {
                      const open = Boolean(openRules[rule.id]);
                      return (
                        <React.Fragment key={rule.id}>
                          <tr
                            className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${rule.isDeleted ? "text-gray-500" : ""}`}
                            onClick={() => setOpenRules((prev) => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                          >
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-2 font-bold text-gray-900">
                                {open ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
                                {rule.name}
                              </span>
                              <span className="ml-6 block text-xs text-gray-500">
                                {rule.isDeleted
                                  ? `Offres envoyées par des règles supprimées depuis · détail par type d'offre`
                                  : `${rule.campaign} · ${rule.offers.length} offre(s) · méthode : ${data.byMethod.find((m) => m.id === rule.method)?.name || rule.method}`}
                              </span>
                            </td>
                            <MetricCells row={rule} />
                            <td className="px-3 py-2.5">
                              <VerdictBadge verdict={rule.verdict} />
                            </td>
                          </tr>
                          {open &&
                            rule.offers.map((offer) => (
                              <tr
                                key={offer.id}
                                className="cursor-pointer border-b border-gray-100 bg-gray-50/60 hover:bg-blue-50/50"
                                onClick={() => setDetail({ ...offer, ruleName: rule.name })}
                              >
                                <td className="py-2 pl-10 pr-3 text-gray-800">
                                  {offer.name}
                                  <span className="ml-2 text-xs text-blue-700 underline">détail</span>
                                </td>
                                <MetricCells row={offer} />
                                <td className="px-3 py-2">
                                  <VerdictBadge verdict={offer.verdict} />
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Comparaisons */}
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 text-base font-black text-gray-900">Quel type d&apos;offre marche le mieux</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="py-1">Type</th>
                      <th className="py-1">Utilisation</th>
                      <th className="py-1 text-right">CA</th>
                      <th className="py-1 text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byType.map((t) => (
                      <tr key={t.id} className="border-t border-gray-100">
                        <td className="py-2 pr-2 font-semibold">{t.name}</td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded bg-gray-100">
                              <div className="h-full rounded-r" style={{ width: `${Math.min(100, t.useRate)}%`, backgroundColor: COLORS.sent }} />
                            </div>
                            <span className="tabular-nums text-gray-700">{t.useRate} %</span>
                            <span className="text-xs text-gray-400">({t.used}/{t.sent})</span>
                          </div>
                        </td>
                        <td className="py-2 text-right tabular-nums">{money(t.revenue)}</td>
                        <td className="py-2 text-right tabular-nums">{formatRoi(t.roi, t.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="mb-3 text-base font-black text-gray-900">Par méthode de distribution</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-1">Méthode</th>
                        <th className="py-1 text-right">Envoyées</th>
                        <th className="py-1 text-right">Utilisation</th>
                        <th className="py-1 text-right">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byMethod.map((m) => (
                        <tr key={m.id} className="border-t border-gray-100">
                          <td className="py-2 font-semibold">{m.name}</td>
                          <td className="py-2 text-right tabular-nums">{m.sent}</td>
                          <td className="py-2 text-right tabular-nums">{m.useRate} %</td>
                          <td className="py-2 text-right tabular-nums">{formatRoi(m.roi, m.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="mb-1 text-base font-black text-gray-900">À quelle heure les offres sont utilisées</h3>
                  <p className="mb-2 text-xs text-gray-500">Commandes avec offre, par heure (Toronto).</p>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.usageHours.map((value, hour) => ({ hour: `${hour}h`, value }))} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                        <CartesianGrid stroke={COLORS.grid} vertical={false} />
                        <XAxis dataKey="hour" tick={{ fill: COLORS.axis, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                        <YAxis allowDecimals={false} tick={{ fill: COLORS.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => [value, "Commandes"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,.04)" }} />
                        <Bar dataKey="value" fill={COLORS.sent} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )
      )}

      <DetailPanel item={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
