"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Smartphone, CheckCircle, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { formatFCFA, clearCart } from "@/lib/cart";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commandeId = searchParams.get("commandeId");

  const [commande, setCommande] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [moyenPaiement, setMoyenPaiement] = useState<"ORANGE_MONEY" | "MOOV_MONEY">("ORANGE_MONEY");
  const [telephonePayment, setTelephonePayment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!commandeId) {
      router.push("/panier");
      return;
    }

    async function loadCommande() {
      try {
        const res = await fetch(`/api/commandes/${commandeId}`);
        const data = await res.json();
        if (data.success) {
          setCommande(data.data);
          setTelephonePayment(data.data.telephoneAcheteur);
        } else {
          setErrorMsg("Commande introuvable.");
        }
      } catch (e) {
        setErrorMsg("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    }

    loadCommande();
  }, [commandeId, router]);

  const handlePayNow = async () => {
    setErrorMsg("");
    setProcessing(true);

    try {
      // 1. Initiate payment request
      const initRes = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commandeId: commande.id,
          moyenPaiement,
          telephonePaiement: telephonePayment
        })
      });

      const initData = await initRes.json();
      if (!initData.success) {
        setErrorMsg(initData.error || "Paiement rejeté.");
        setProcessing(false);
        return;
      }

      // 2. Simulate Webhook confirmation from Mobile Money operator
      setTimeout(async () => {
        const webhookRes = await fetch("/api/paiements/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referenceTransaction: initData.data.referenceTransaction,
            commandeId: commande.id,
            statutPaiement: "CONFIRME"
          })
        });

        const webhookData = await webhookRes.json();
        if (webhookData.success) {
          clearCart(); // Clear cart in browser
          setPaymentSuccess(true);
          setProcessing(false);
        } else {
          setErrorMsg("La confirmation du paiement a échoué.");
          setProcessing(false);
        }
      }, 2000);
    } catch (err) {
      setErrorMsg("Erreur lors de la transaction Mobile Money.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--color-faso-red)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[var(--color-ink-soft)] font-semibold">Préparation du paiement...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-[var(--color-faso-green)] rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">
            Paiement confirmé par Mobile Money !
          </h1>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Votre commande <strong className="text-[var(--color-ink)]">{commande.numero}</strong> a été enregistrée avec succès.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] text-left space-y-3 text-xs shadow-xs">
          <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
            <span className="text-[var(--color-ink-soft)]">Montant payé :</span>
            <span className="font-extrabold text-[var(--color-faso-green)] text-sm">{formatFCFA(commande.montantTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
            <span className="text-[var(--color-ink-soft)]">Adresse de livraison :</span>
            <span className="font-bold text-[var(--color-ink)]">{commande.adresseLivraison}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-ink-soft)]">Statut commande :</span>
            <span className="font-bold text-[var(--color-faso-green)]">PAYÉE & En cours de préparation</span>
          </div>
        </div>

        <Link
          href={`/suivi/${commande.numero}`}
          className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          <span>Suivre ma livraison en temps réel</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <Smartphone size={14} />
          <span>Paiement sécurisé Burkina Faso</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          Paiement par Mobile Money
        </h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Commande N° <strong className="text-[var(--color-ink)]">{commande?.numero}</strong> — Montant : <strong className="text-[var(--color-faso-green)]">{formatFCFA(commande?.montantTotal || 0)}</strong>
        </p>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-xs">
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Operator Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[var(--color-ink)]">
            Choisissez votre opérateur Mobile Money :
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMoyenPaiement("ORANGE_MONEY")}
              className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                moyenPaiement === "ORANGE_MONEY"
                  ? "border-orange-500 bg-orange-50 text-orange-900 shadow-sm"
                  : "border-[var(--color-border)] hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs">
                OM
              </div>
              <span>Orange Money</span>
            </button>

            <button
              type="button"
              onClick={() => setMoyenPaiement("MOOV_MONEY")}
              className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                moyenPaiement === "MOOV_MONEY"
                  ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                  : "border-[var(--color-border)] hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                Moov
              </div>
              <span>Moov Money</span>
            </button>
          </div>
        </div>

        {/* Phone number entry */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--color-ink)]">
            Numéro de compte {moyenPaiement === "ORANGE_MONEY" ? "Orange Money" : "Moov Money"} :
          </label>
          <input
            type="tel"
            value={telephonePayment}
            onChange={(e) => setTelephonePayment(e.target.value)}
            placeholder="Ex: +226 70 12 34 56"
            className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handlePayNow}
          disabled={processing}
          className="w-full py-4 bg-[var(--color-faso-red)] hover:bg-[#d02430] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Attente de validation USSD / Push sur votre téléphone...</span>
            </>
          ) : (
            <>
              <span>Payer {formatFCFA(commande?.montantTotal || 0)}</span>
              <ShieldCheck size={18} />
            </>
          )}
        </button>

        <div className="bg-[var(--color-surface)] p-3 rounded-xl text-[11px] text-[var(--color-ink-soft)] space-y-1">
          <div className="font-semibold text-[var(--color-ink)] flex items-center gap-1">
            <ShieldCheck size={13} className="text-[var(--color-faso-green)]" />
            <span>Sécurité des paiements MarketFaso</span>
          </div>
          <p>
            Vous recevrez une notification Push ou un message USSD sur votre téléphone pour entrer votre code secret Mobile Money.
          </p>
        </div>
      </div>
    </div>
  );
}


export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] font-semibold">
        Chargement du paiement...
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
