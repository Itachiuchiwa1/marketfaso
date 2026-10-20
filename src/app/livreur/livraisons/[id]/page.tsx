"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, MapPin, Phone, User, CheckCircle2, Clock, PackageCheck, AlertCircle } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function LivreurLivraisonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [livraison, setLivraison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLivraisonDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/livraisons?filtre=mes_livraisons`);
      const data = await res.json();
      if (data.success) {
        const found = (data.data || []).find((l: any) => l.id === id);
        if (found) {
          setLivraison(found);
        } else {
          setErrorMsg("Livraison non trouvée ou non attribuée à votre compte.");
        }
      } else {
        setErrorMsg("Impossible de charger les détails.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/livreur/connexion");
    } else if (session?.user) {
      fetchLivraisonDetail();
    }
  }, [status, session, id]);

  const handleUpdateStatus = async (nouveauStatut: string) => {
    setUpdating(true);
    setMessage("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/livraisons/${id}/statut`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nouveauStatut })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mise à jour impossible.");
      }

      setMessage(`Statut mis à jour avec succès: ${nouveauStatut}`);
      fetchLivraisonDetail();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)]">
        Chargement des détails de la livraison...
      </div>
    );
  }

  if (errorMsg && !livraison) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500" />
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Erreur de chargement</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">{errorMsg}</p>
        <Link
          href="/livreur"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-faso-green)] hover:underline"
        >
          <ArrowLeft size={16} /> Retour à mon tableau de bord
        </Link>
      </div>
    );
  }

  const commande = livraison.commande;
  const currentStatut = livraison.statut;

  const statutsMapping: { [key: string]: { label: string; bg: string; text: string } } = {
    EN_ATTENTE: { label: "En attente de prise en charge", bg: "bg-gray-100", text: "text-gray-800" },
    ACCEPTEE: { label: "Acceptée par le livreur", bg: "bg-blue-100", text: "text-blue-800" },
    EN_PREPARATION: { label: "Colis en cours de préparation chez le vendeur", bg: "bg-amber-100", text: "text-amber-800" },
    EN_COURS: { label: "Colis récupéré — Livraison en cours", bg: "bg-purple-100", text: "text-purple-800" },
    LIVREE: { label: "Colis remis au client (Livrée)", bg: "bg-green-100", text: "text-green-800" },
    ANNULEE: { label: "Livraison annulée", bg: "bg-red-100", text: "text-red-800" }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/livreur"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft size={16} /> Retour à la liste des courses
      </Link>

      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-ink-soft)]">
              Fiche de livraison
            </span>
            <h1 className="text-xl font-bold font-mono text-[var(--color-faso-red)]">
              {commande?.numero || "MF-CMD"}
            </h1>
            <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
              Créée le {new Date(livraison.dateCreation).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statutsMapping[currentStatut]?.bg} ${statutsMapping[currentStatut]?.text}`}>
            {statutsMapping[currentStatut]?.label || currentStatut}
          </div>
        </div>

        {/* Action Messages */}
        {message && (
          <div className="p-3 bg-green-100 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Status Updater Buttons */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-2">
            <PackageCheck size={16} className="text-[var(--color-faso-green)]" />
            Mettre à jour l'état de la course :
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleUpdateStatus("EN_PREPARATION")}
              disabled={updating || currentStatut === "LIVREE"}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                currentStatut === "EN_PREPARATION"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-amber-400"
              }`}
            >
              1. En préparation
            </button>

            <button
              onClick={() => handleUpdateStatus("EN_COURS")}
              disabled={updating || currentStatut === "LIVREE"}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                currentStatut === "EN_COURS"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-400"
              }`}
            >
              2. En cours de livraison
            </button>

            <button
              onClick={() => handleUpdateStatus("LIVREE")}
              disabled={updating || currentStatut === "LIVREE"}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                currentStatut === "LIVREE"
                  ? "bg-[var(--color-faso-green)] text-white border-[var(--color-faso-green)] shadow-xs"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-400"
              }`}
            >
              3. Marquer comme Livrée
            </button>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-2">
              Coordonnées Client Destinataire
            </h2>
            <div className="space-y-2 text-xs text-[var(--color-ink)]">
              <div className="flex items-center gap-2">
                <User size={15} className="text-gray-400" />
                <span className="font-bold">{commande?.nomClient}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-gray-400" />
                <a href={`tel:${commande?.telephoneClient}`} className="font-mono text-[var(--color-faso-green)] hover:underline font-bold">
                  {commande?.telephoneClient}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold">{livraison.adresseLivraison}</p>
                  <p className="text-gray-500">{livraison.ville} — Secteur {livraison.secteur || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-2">
              Résumé de la commande
            </h2>
            <div className="space-y-2 text-xs">
              {commande?.lignes?.map((ligne: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-gray-700">
                  <span>{ligne.quantite}x {ligne.produit?.nom}</span>
                  <span className="font-bold font-mono">{formatFCFA(ligne.prixTotal)}</span>
                </div>
              ))}
              <div className="border-t border-[var(--color-border)] pt-2 flex items-center justify-between font-bold text-sm text-[var(--color-ink)]">
                <span>Montant Total</span>
                <span className="text-[var(--color-faso-red)] font-mono">{formatFCFA(commande?.montantTotal || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
