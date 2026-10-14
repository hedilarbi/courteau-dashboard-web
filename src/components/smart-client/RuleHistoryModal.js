"use client";

import React, { useEffect, useState } from "react";
import { FaHistory, FaTimes } from "react-icons/fa";
import { getSmartClientAuthHeaders, SMART_CLIENT_API_URL } from "@/services/SmartClientServices";

export default function RuleHistoryModal({ rule, onClose, onRestored }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const response = await fetch(`${SMART_CLIENT_API_URL}/smart-client/${rule.id}/versions`, { headers: await getSmartClientAuthHeaders() });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || "Historique indisponible.");
        setVersions(json.data || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [rule.id]);

  const restore = async (version) => {
    if (!confirm(`Restaurer la version ${version} ? Une nouvelle version sera créée.`)) return;
    try {
      const response = await fetch(`${SMART_CLIENT_API_URL}/smart-client/${rule.id}/versions/${version}/restore`, { method: "POST", headers: await getSmartClientAuthHeaders() });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message || "Restauration impossible.");
      onRestored?.();
      onClose();
    } catch (restoreError) { setError(restoreError.message); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b p-5"><div><h2 className="flex items-center gap-2 text-xl font-bold"><FaHistory /> Historique</h2><p className="text-sm text-gray-500">{rule.name}</p></div><button onClick={onClose}><FaTimes /></button></div>
      <div className="max-h-[60vh] overflow-y-auto p-5">
        {loading && <p className="text-gray-500">Chargement…</p>}{error && <p className="mb-3 rounded bg-red-50 p-3 text-red-700">{error}</p>}
        <div className="space-y-3">{versions.map((item) => <div key={item._id} className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-bold">Version {item.version}</p><p className="text-xs text-gray-500">{item.action} · {new Date(item.createdAt).toLocaleString("fr-CA")}</p></div><button onClick={() => restore(item.version)} className="rounded-lg border border-pr px-3 py-2 text-sm font-bold text-pr">Restaurer</button></div>)}</div>
        {!loading && !versions.length && <p className="text-gray-500">Aucune version enregistrée.</p>}
      </div>
    </div>
  </div>;
}
