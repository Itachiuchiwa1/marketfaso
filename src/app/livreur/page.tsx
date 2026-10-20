"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, LogOut, RefreshCw } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function LivreurDashboardPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"disponibles" | "mes_livraisons">("disponibles");
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchLivraisons = async (filtreType: string) => {
    setLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/livraisons?filtre=${filtreType}`);
      const data = await res.json();
      if (data.success) {
        setLivraisons(data.data || []);
      } else {
        setActionError(data.error || "Impossible de charger les livraisons.");
      }
    } catch (err) {
      setActionError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/livreur/connexion");
    } else if (session?.user) {
      const role = (session.user as any).role;
      if (role === "ADMINISTRATEUR") {
        router.push("/admin");
        return;
      }
      if (role === "VENDEUR") {
        router.push("/vendeur");
        return;
      }
      fetchLivraisons(activeTab);
    }
  }, [status, session, activeTab, router]);

  const handleAcceptDelivery = async (id: string) => {
    setActionError("");
    setActionSuccess("");
    setAcceptingId(id);

    try {
      const res = await fetch(`/api/livraisons/${id}/accept`, {
        method: "POST"
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible d'accepter cette livraison.");
      }

      setActionSuccess("Livraison acceptée avec succès ! Vous pouvez maintenant la gérer dans 'Mes Livraisons'.");
      fetchLivraisons("disponibles");
    } catch (err: any) {
      setActionError(err.message || "Erreur lors de l'attribution.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-xs text-[var(--color-ink-soft)] animate-pulse">Chargement de votre espace livreur...</p>
      </div>
    );
  }

  const userStatut = (session?.user as any)?.statut;
  const isPending = userStatut === "EN_ATTENTE";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] rounded-2xl flex items-center justify-center font-bold text-xl">
            <Truck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-ink)]">{session?.user?.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isPending ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
              }`}>
                {isPending ? "EN ATTENTE DE VALIDATION" : "LIVREUR ACTIF"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
              {session?.user?.email} • Zone: Ouagadougou
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/livreur/connexion" })}
          className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

      {/* Warning banner if account is pending */}
      {isPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <AlertTriangle size={18} />
            <span>Compte en cours de vérification administrateur</span>
          </div>
          <p>
            Votre dossier de candidature est en cours d'examen. Vous pouvez consulter les offres de livraison disponibles, mais l'acceptation de missions nécessite l'activation de votre compte par l'équipe administrative de MarketFaso.
          </p>
        </div>
      )}

      {/* Feedback Messages */}
      {actionError && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-xl text-green-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("disponibles")}
            className={`pb-2 text-xs font-bold transition-colors relative ${
              activeTab === "disponibles"
                ? "text-[var(--color-faso-green)] border-b-2 border-[var(--color-faso-green)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            Offres Disponibles (Course)
          </button>
          <button
            onClick={() => setActiveTab("mes_livraisons")}
            className={`pb-2 text-xs font-bold transition-colors relative ${
              activeTab === "mes_livraisons"
                ? "text-[var(--color-faso-green)] border-b-2 border-[var(--color-faso-green)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            Mes Livraisons Attribuées
          </button>
        </div>

        <button
          onClick={() => fetchLivraisons(activeTab)}
          className="p-2 text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] flex items-center gap-1"
          title="Rafraîchir"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-ink-soft)]">
          Chargement des missions...
        </div>
      ) : livraisons.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-3">
          <Truck size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {activeTab === "disponibles"
              ? "Aucune nouvelle offre de livraison disponible pour le moment."
              : "Vous n'avez aucune livraison attribuée en cours."}
          </p>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Revenez régulièrement pour saisir les opportunités de livraison dans votre zone.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {livraisons.map((livraison) => (
            <div
              key={livraison.id}
              className="bg-white border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-xs hover:border-[var(--color-faso-green)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--color-faso-red)] bg-red-50 px-2.5 py-1 rounded-md">
                    {livraison.commande?.numero || "MF-CMD"}
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(livraison.dateCreation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                    <MapPin size={15} className="text-[var(--color-faso-green)] shrink-0" />
                    <span>{livraison.adresseLivraison}, {livraison.ville} ({livraison.secteur || "Centre"})</span>
                  </div>
                  <p className="text-xs text-[var(--color-ink-soft)] pl-5">
                    Client: <strong className="text-[var(--color-ink)]">{livraison.commande?.nomClient}</strong> ({livraison.commande?.telephoneClient})
                  </p>
                </div>

                <div className="bg-[var(--color-surface)] p-3 rounded-xl space-y-1 text-xs">
                  <p className="font-semibold text-[var(--color-ink)]">Articles à livrer :</p>
                  <ul className="text-gray-600 space-y-0.5 list-disc list-inside text-[11px]">
                    {livraison.commande?.lignes?.map((ligne: any, idx: number) => (
                      <li key={idx}>
                        {ligne.quantite}x {ligne.produit?.nom} ({formatFCFA(ligne.prixUnitaire)})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[var(--color-ink-soft)]">Total Commande :</span>
                  <span className="font-bold text-sm text-[var(--color-ink)]">
                    {formatFCFA(livraison.commande?.montantTotal || 0)}
                  </span>
                </div>
              </div>

              {activeTab === "disponibles" ? (
                <button
                  onClick={() => handleAcceptDelivery(livraison.id)}
                  disabled={acceptingId === livraison.id || isPending}
                  className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isPending
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[var(--color-faso-green)] hover:bg-[#008030] text-white shadow-xs"
                  }`}
                >
                  {acceptingId === livraison.id ? (
                    "Attribution..."
                  ) : isPending ? (
                    "Attente activation admin"
                  ) : (
                    <>
                      <span>Accepter cette course</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={`/livreur/livraisons/${livraison.id}`}
                  className="w-full py-2.5 px-4 bg-[var(--color-ink)] hover:bg-black text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Gérer la livraison & statut</span>
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
