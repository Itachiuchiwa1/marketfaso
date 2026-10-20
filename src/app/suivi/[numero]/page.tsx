"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, CheckCircle2, Clock, MapPin, Phone, User, Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function OrderTrackingPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = use(params);
  const [commande, setCommande] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadCommande() {
      try {
        const res = await fetch(`/api/commandes/${numero}`);
        const data = await res.json();
        if (data.success) {
          setCommande(data.data);
        } else {
          setErrorMsg(data.error || "Commande introuvable.");
        }
      } catch (e) {
        setErrorMsg("Erreur lors de la recherche de la commande.");
      } finally {
        setLoading(false);
      }
    }

    loadCommande();
  }, [numero]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--color-faso-green)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[var(--color-ink-soft)] font-semibold">Recherche de la commande N° {numero}...</p>
      </div>
    );
  }

  if (errorMsg || !commande) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Clock size={48} className="text-orange-500 mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Commande non trouvée</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Aucune commande ne correspond au numéro <strong className="text-[var(--color-ink)]">{numero}</strong>.
        </p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-[var(--color-faso-green)] text-white text-xs font-bold rounded-lg">
          &larr; Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Define 5 key timeline steps
  const steps = [
    { key: "PAYEE", label: "Commande Payée", desc: "Paiement Mobile Money validé" },
    { key: "EN_PREPARATION", label: "En Préparation", desc: "Le vendeur prépare votre colis" },
    { key: "PRETE_A_LIVRER", label: "Prête à livrer", desc: "Attribution du livreur en cours" },
    { key: "EN_LIVRAISON", label: "En Livraison", desc: "Livreur en route vers votre adresse" },
    { key: "LIVREE", label: "Livrée", desc: "Colis remis en main propre" }
  ];

  const getStepIndex = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE_PAIEMENT": return -1;
      case "PAYEE": return 0;
      case "EN_PREPARATION": return 1;
      case "PRETE_A_LIVRER": return 2;
      case "EN_LIVRAISON": return 3;
      case "LIVREE": return 4;
      case "ANNULEE": return -2;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(commande.statut);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-faso-red)] transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          <span>Retour au site</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-xs text-[var(--color-faso-green)] font-bold uppercase tracking-wider">Suivi en direct</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
              Commande N° {commande.numero}
            </h1>
          </div>
          <div className="text-xs text-[var(--color-ink-soft)]">
            Passée le : <strong className="text-[var(--color-ink)]">{new Date(commande.dateCreation).toLocaleDateString("fr-FR")}</strong>
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-[var(--color-ink)]">Progression de votre livraison</h2>

        <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
          {steps.map((st, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={st.key} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 relative z-10 text-left md:text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-[var(--color-faso-green)] text-white shadow-md ring-4 ring-green-100"
                      : "bg-gray-100 text-gray-400 border border-[var(--color-border)]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCurrent ? "text-[var(--color-faso-red)] font-extrabold" : "text-[var(--color-ink)]"}`}>
                    {st.label}
                  </h4>
                  <p className="text-[11px] text-[var(--color-ink-soft)] max-w-xs">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Info Card (if assigned) */}
      {commande.livraison?.livreur ? (
        <div className="bg-gradient-to-r from-green-900 to-[var(--color-ink)] text-white p-6 rounded-2xl space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-xs text-[var(--color-faso-gold)] font-bold">
            <Truck size={16} />
            <span>Livreur Partenaire Attribué</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {commande.livraison.livreur.utilisateur?.prenom} {commande.livraison.livreur.utilisateur?.nom}
              </h3>
              <p className="text-xs text-gray-300">
                Véhicule : <strong className="text-white">{commande.livraison.livreur.typeVehicule}</strong>
              </p>
            </div>
            <a
              href={`tel:${commande.livraison.livreur.utilisateur?.telephone}`}
              className="px-4 py-2.5 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <Phone size={15} />
              <span>Appeler le livreur ({commande.livraison.livreur.utilisateur?.telephone})</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
          <Clock size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold block">Recherche du livreur le plus proche...</span>
            <span>Un livreur certifié prendra en charge votre colis dès que le vendeur aura terminé la préparation.</span>
          </div>
        </div>
      )}

      {/* Order Details & Items */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Lignes de commande */}
        <div className="md:col-span-8 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-2">
            Articles commandés ({commande.lignes?.length || 0})
          </h3>
          <div className="divide-y divide-[var(--color-border)]">
            {commande.lignes?.map((l: any) => (
              <div key={l.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                    <Image
                      src={l.produit?.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop"}
                      alt={l.produit?.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-[var(--color-ink)] block">{l.produit?.nom}</span>
                    <span className="text-[11px] text-[var(--color-ink-soft)]">Quantité : {l.quantite}</span>
                  </div>
                </div>
                <span className="font-bold text-[var(--color-ink)]">{formatFCFA(l.prixUnitaire * l.quantite)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coordonnées */}
        <div className="md:col-span-4 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs text-xs">
          <h3 className="text-sm font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-2">
            Adresse de livraison
          </h3>
          <div className="space-y-2 text-[var(--color-ink-soft)]">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[var(--color-faso-green)]" />
              <span className="font-bold text-[var(--color-ink)]">{commande.nomAcheteur}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--color-faso-green)]" />
              <span>{commande.telephoneAcheteur}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-[var(--color-border)]">
              <MapPin size={14} className="text-[var(--color-faso-green)] flex-shrink-0 mt-0.5" />
              <span>{commande.adresseLivraison}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex justify-between font-bold text-sm text-[var(--color-ink)]">
            <span>Total payé :</span>
            <span className="text-[var(--color-faso-green)]">{formatFCFA(commande.montantTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
