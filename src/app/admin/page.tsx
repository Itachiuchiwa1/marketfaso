"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users, ShoppingBag, Truck, DollarSign, ArrowRight, UserCheck, BarChart3, LogOut, FolderPlus, Package, ExternalLink } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function AdminDashboardPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/connexion");
    } else if (session?.user) {
      if ((session.user as any).role !== "ADMINISTRATEUR") {
        const userRole = (session.user as any).role;
        if (userRole === "VENDEUR") router.push("/vendeur");
        else if (userRole === "LIVREUR") router.push("/livreur");
        else router.push("/");
        return;
      }

      fetch("/api/admin/stats?periode=tout")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStats(data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] animate-pulse">
        Chargement de l'administration MarketFaso...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Navigation */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--color-faso-gold)]/20 text-amber-700 rounded-2xl flex items-center justify-center font-bold text-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">Tableau de bord Administrateur</h1>
            <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
              Supervision globale de la plateforme MarketFaso ({session?.user?.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> Site Public
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/connexion" })}
            className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--color-ink-soft)] text-xs font-semibold">
            <span>Chiffre d'Affaires Global</span>
            <DollarSign size={18} className="text-[var(--color-faso-green)]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--color-faso-green)]">
            {formatFCFA(stats?.chiffreAffairesFCFA || 0)}
          </p>
          <p className="text-[10px] text-gray-400">Total des ventes validées</p>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--color-ink-soft)] text-xs font-semibold">
            <span>Commandes Passées</span>
            <ShoppingBag size={18} className="text-[var(--color-faso-red)]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--color-ink)]">
            {stats?.totalCommandes || 0}
          </p>
          <p className="text-[10px] text-gray-400">Total toutes périodes</p>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--color-ink-soft)] text-xs font-semibold">
            <span>Vendeurs Partenaires</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--color-ink)]">
            {stats?.totalVendeurs || 0}
          </p>
          <p className="text-[10px] text-gray-400">Boutiques actives</p>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--color-ink-soft)] text-xs font-semibold">
            <span>Livreurs en attente</span>
            <Truck size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">
            {stats?.totalLivreursEnAttente || 0}
          </p>
          <p className="text-[10px] text-amber-800 font-semibold">
            {stats?.totalLivreursActifs || 0} livreurs déjà actifs
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Categories */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Gestion des Catégories</h2>
              <p className="text-xs text-[var(--color-ink-soft)]">Création et administration des catégories de produits</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Créez de nouvelles catégories pour le catalogue (ex: Solaires, Véhicules, Mode) et gérez les catégories existantes.
          </p>
          <Link
            href="/admin/categories"
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
          >
            <span>Créer & Gérer les catégories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card 2: Products Supervision */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Supervision des Produits & Stocks</h2>
              <p className="text-xs text-[var(--color-ink-soft)]">Voir tous les produits, prix et quantités en stock</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Inspectez l'ensemble des annonces publiées par les vendeurs, vérifiez les quantités disponibles en stock et filtrez par boutique.
          </p>
          <Link
            href="/admin/produits"
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
          >
            <span>Inspecter les produits & stocks</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card 3: Users */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Gestion des Utilisateurs & Livreurs</h2>
              <p className="text-xs text-[var(--color-ink-soft)]">Validez les nouveaux livreurs et gérez les rôles</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Consultez la liste de tous les utilisateurs. Activez en 1-clic les livreurs ayant le statut <span className="font-bold text-amber-600 bg-amber-50 px-1 rounded">EN_ATTENTE</span>.
          </p>
          <Link
            href="/admin/utilisateurs"
            className="w-full py-2.5 px-4 bg-[var(--color-ink)] hover:bg-black text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
          >
            <span>Gérer les comptes & validations</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Card 4: Reports */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-[var(--color-faso-green)] flex items-center justify-center font-bold">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-ink)]">Statistiques & Rapports</h2>
              <p className="text-xs text-[var(--color-ink-soft)]">Analyse par période (jour, semaine, mois, tout)</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Analysez les ventes totales, la répartition des commandes par statut, et l'activité des livraisons pour le pilotage stratégique.
          </p>
          <Link
            href="/admin/statistiques"
            className="w-full py-2.5 px-4 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
          >
            <span>Consulter les rapports statistiques</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
