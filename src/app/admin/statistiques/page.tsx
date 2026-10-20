"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Calendar, DollarSign, ShoppingBag, Truck, RefreshCw } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function AdminStatistiquesPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [periode, setPeriode] = useState<"jour" | "semaine" | "mois" | "tout">("tout");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?periode=${p}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/connexion");
    } else if (session?.user) {
      if ((session.user as any).role !== "ADMINISTRATEUR") {
        router.push("/");
        return;
      }
      fetchStats(periode);
    }
  }, [status, session, periode]);

  const statutCommandeLabels: { [key: string]: string } = {
    EN_ATTENTE: "En attente de paiement",
    PAYEE: "Payée (En attente d'attribution)",
    EN_PREPARATION: "En préparation vendeur",
    PRETE_A_LIVRER: "Prête à livrer",
    EN_LIVRAISON: "En cours de livraison",
    LIVREE: "Livrée avec succès",
    ANNULEE: "Annulée"
  };

  const statutLivraisonLabels: { [key: string]: string } = {
    EN_ATTENTE: "Offres non attribuées",
    ACCEPTEE: "Course acceptée",
    EN_PREPARATION: "Prise en charge",
    EN_COURS: "Sur la route",
    LIVREE: "Colis remis",
    ANNULEE: "Annulée"
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft size={16} /> Retour au tableau de bord Admin
      </Link>

      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Statistiques & Reporting Activité</h1>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Analyse des performances commerciales et opérationnelles
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-[var(--color-border)] p-1 rounded-xl shadow-xs text-xs font-semibold">
          <button
            onClick={() => setPeriode("jour")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periode === "jour" ? "bg-[var(--color-faso-green)] text-white font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setPeriode("semaine")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periode === "semaine" ? "bg-[var(--color-faso-green)] text-white font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => setPeriode("mois")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periode === "mois" ? "bg-[var(--color-faso-green)] text-white font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            30 derniers jours
          </button>
          <button
            onClick={() => setPeriode("tout")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periode === "tout" ? "bg-[var(--color-faso-green)] text-white font-bold" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tout l'historique
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--color-ink-soft)] animate-pulse">
          Calcul des statistiques pour la période...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[var(--color-ink-soft)] font-semibold flex items-center gap-1">
                <DollarSign size={16} className="text-[var(--color-faso-green)]" /> Chiffre d'Affaires
              </span>
              <p className="text-2xl font-bold font-mono text-[var(--color-faso-green)]">
                {formatFCFA(stats?.chiffreAffairesFCFA || 0)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-mono">Période: {periode}</p>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[var(--color-ink-soft)] font-semibold flex items-center gap-1">
                <ShoppingBag size={16} className="text-[var(--color-faso-red)]" /> Total Commandes
              </span>
              <p className="text-2xl font-bold font-mono text-[var(--color-ink)]">
                {stats?.totalCommandes || 0}
              </p>
              <p className="text-[10px] text-gray-400">Commandes enregistrées</p>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[var(--color-ink-soft)] font-semibold flex items-center gap-1">
                <Truck size={16} className="text-blue-600" /> Livreurs Actifs
              </span>
              <p className="text-2xl font-bold font-mono text-blue-600">
                {stats?.totalLivreursActifs || 0}
              </p>
              <p className="text-[10px] text-gray-400">{stats?.totalLivreursEnAttente || 0} en attente</p>
            </div>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Commandes Breakdown */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <ShoppingBag size={18} className="text-[var(--color-faso-red)]" />
                Répartition des Commandes par Statut
              </h2>

              <div className="space-y-3 text-xs">
                {stats?.commandesParStatut?.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aucune donnée de commande pour cette période.</p>
                ) : (
                  stats?.commandesParStatut?.map((c: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--color-surface)] rounded-xl">
                      <span className="font-semibold text-[var(--color-ink)]">
                        {statutCommandeLabels[c.statut] || c.statut}
                      </span>
                      <span className="font-bold font-mono px-2.5 py-0.5 bg-white border border-[var(--color-border)] rounded-md">
                        {c._count?.statut || 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Livraisons Breakdown */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <Truck size={18} className="text-[var(--color-faso-green)]" />
                Répartition des Livraisons par Statut
              </h2>

              <div className="space-y-3 text-xs">
                {stats?.livraisonsParStatut?.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aucune donnée de livraison pour cette période.</p>
                ) : (
                  stats?.livraisonsParStatut?.map((l: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[var(--color-surface)] rounded-xl">
                      <span className="font-semibold text-[var(--color-ink)]">
                        {statutLivraisonLabels[l.statut] || l.statut}
                      </span>
                      <span className="font-bold font-mono px-2.5 py-0.5 bg-white border border-[var(--color-border)] rounded-md">
                        {l._count?.statut || 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
