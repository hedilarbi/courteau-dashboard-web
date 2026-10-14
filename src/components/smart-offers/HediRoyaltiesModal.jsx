"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaCrown, FaMoneyBillWave, FaHistory, FaCheckCircle } from "react-icons/fa";
import { getSmartOfferHediStats, createSmartOfferHediPayout } from "@/services/PersonalizedOffersServices";
import Spinner from "@/components/spinner/Spinner";
import ToastNotification from "@/components/ToastNotification";

export default function HediRoyaltiesModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payout Form
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [payoutNote, setPayoutNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [toastData, setToastData] = useState({ show: false, type: "", message: "" });

  const fetchStats = async () => {
    setIsLoading(true);
    const res = await getSmartOfferHediStats();
    if (res.status && res.data) {
      setStats(res.data);
    } else {
      setToastData({ show: true, type: "error", message: "Erreur lors de la récupération des statistiques" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      setToastData({ show: true, type: "error", message: "Veuillez entrer un montant valide." });
      return;
    }

    setIsSaving(true);
    const res = await createSmartOfferHediPayout({
      amount,
      paidAt: payoutDate,
      note: payoutNote || "Paiement Hedi (Smart Offers)"
    });

    if (res.status) {
      setToastData({ show: true, type: "success", message: "Paiement enregistré avec succès !" });
      setPayoutAmount("");
      setPayoutNote("");
      await fetchStats(); // Refresh
    } else {
      setToastData({ show: true, type: "error", message: res.message || "Erreur lors du paiement" });
    }
    setIsSaving(false);
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-white shrink-0">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4 shadow-sm border border-yellow-200">
              <FaCrown className="text-2xl text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Gestion des Royautés</h2>
              <p className="text-yellow-600 font-semibold text-sm">Gains générés via les Smart Offers V2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20"><Spinner /></div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <FaMoneyBillWave className="w-24 h-24 text-green-400" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wide">Solde Actuel</p>
                  <h3 className="text-3xl font-black text-white">{formatMoney(stats?.balance)}</h3>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col justify-center">
                  <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wide">Crédit Total Généré</p>
                  <h3 className="text-2xl font-black text-gray-800">{formatMoney(stats?.totalCredits)}</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col justify-center">
                  <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wide">Déjà Retiré</p>
                  <h3 className="text-2xl font-black text-gray-800">{formatMoney(stats?.totalPayouts)}</h3>
                </div>
              </div>

              {/* Action de Retrait */}
              <div className="bg-yellow-50/50 rounded-xl p-5 border border-yellow-200 mb-8">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-green-600" /> Enregistrer un retrait (Sortie)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Montant ($)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                      placeholder="Ex: 150"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                      value={payoutDate}
                      onChange={(e) => setPayoutDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Note (Optionnel)</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                      placeholder="Ex: Virement Septembre"
                      value={payoutNote}
                      onChange={(e) => setPayoutNote(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleWithdraw}
                    disabled={isSaving}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Traitement..." : "Enregistrer le paiement"}
                  </button>
                </div>
              </div>

              {/* Historique */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaHistory className="mr-2 text-gray-500" /> Historique des retraits
                </h4>
                {(stats?.payouts || []).length > 0 ? (
                  <div className="space-y-3">
                    {stats.payouts.map((item) => (
                      <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500" title="Complété" />
                          <div>
                            <p className="font-bold text-gray-800">{item.note || "Paiement Hedi"}</p>
                            <p className="text-xs text-gray-500">{formatDate(item.paidAt)}</p>
                          </div>
                        </div>
                        <span className="font-black text-gray-800 text-lg">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">Aucun historique de retrait.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {toastData.show && (
        <ToastNotification 
          type={toastData.type} 
          message={toastData.message} 
          onClose={() => setToastData({ show: false, type: "", message: "" })} 
        />
      )}
    </div>
  );
}
