import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Store, Plus, Package, ShoppingBag, TrendingUp, MapPin, Settings, ExternalLink, Edit, Eye } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default async function VendeurDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/vendeur/connexion");
  }

  const role = (session.user as any).role;
  if (role === "ADMINISTRATEUR") {
    redirect("/admin");
  }
  if (role === "LIVREUR") {
    redirect("/livreur");
  }
  if (role !== "VENDEUR") {
    redirect("/vendeur/connexion");
  }

  const vendeurId = (session.user as any).vendeurId;

  // Fetch seller details & metrics
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: vendeurId },
    include: {
      utilisateur: true,
      produits: {
        include: { photos: { where: { estPrincipale: true } } }
      }
    }
  });

  const totalProduits = vendeur?.produits.length || 0;

  // Fetch seller's received orders
  const commandes = await prisma.commande.findMany({
    where: {
      lignes: {
        some: {
          produit: { vendeurId }
        }
      }
    },
    take: 5,
    orderBy: { dateCreation: "desc" },
    include: {
      lignes: {
        include: { produit: true }
      }
    }
  });

  const totalCommandes = commandes.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--color-ink)] to-[#223d2e] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-faso-green)] text-white text-xs font-bold">
              <Store size={14} /> Espace Vendeur Actif
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-300 bg-white/10 px-2.5 py-1 rounded-full">
              <MapPin size={12} className="text-[var(--color-faso-gold)]" />
              <span>{vendeur?.ville || "Ouagadougou"}{vendeur?.secteur ? ` (${vendeur.secteur})` : ""}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {vendeur?.nomBoutique}
          </h1>
          <p className="text-xs text-gray-300">
            Bienvenue {session.user.name} — Gérez vos annonces, vos coordonnées et préparez vos expéditions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/vendeur/profil"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            title="Modifier le nom, la ville et les informations de la boutique"
          >
            <Settings size={16} />
            <span>Paramètres Boutique</span>
          </Link>

          <Link
            href="/vendeur/produits/nouveau"
            className="px-5 py-3 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Publier un produit</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package size={24} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-ink-soft)] font-medium">Produits en vente</div>
            <div className="text-2xl font-extrabold text-[var(--color-ink)]">{totalProduits}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-[var(--color-faso-green)] flex items-center justify-center font-bold">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-ink-soft)] font-medium">Commandes reçues</div>
            <div className="text-2xl font-extrabold text-[var(--color-ink)]">{totalCommandes}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-[var(--color-faso-gold)] flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-ink-soft)] font-medium">Statut boutique</div>
            <div className="text-xs font-bold text-[var(--color-faso-green)] bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
              Active & Vérifiée
            </div>
          </div>
        </div>
      </div>

      {/* Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Products Quick View */}
        <div className="lg:col-span-7 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h2 className="font-bold text-base text-[var(--color-ink)]">Vos annonces récentes</h2>
            <Link href="/vendeur/produits/nouveau" className="text-xs font-bold text-[var(--color-faso-red)] hover:underline">
              + Ajouter un produit
            </Link>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {vendeur?.produits.length === 0 ? (
              <p className="text-xs text-[var(--color-ink-soft)] py-6 text-center">
                Aucun produit publié pour le moment.
              </p>
            ) : (
              vendeur?.produits.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                      <img
                        src={p.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop"}
                        alt={p.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[var(--color-ink)] block truncate">{p.nom}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[var(--color-ink-soft)]">Stock : {p.stock}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${p.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {p.statut}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-extrabold text-[var(--color-faso-green)] text-xs sm:text-sm">{formatFCFA(p.prix)}</span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/produits/${p.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-[var(--color-ink)] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir la fiche produit"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/vendeur/produits/${p.id}/modifier`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[var(--color-faso-green)] hover:bg-[#135d34] rounded-lg transition-colors shadow-xs"
                      >
                        <Edit size={12} />
                        Modifier
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-base text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3">
            Dernières commandes reçues
          </h2>

          <div className="space-y-3">
            {commandes.length === 0 ? (
              <p className="text-xs text-[var(--color-ink-soft)] py-6 text-center">
                Aucune commande récente.
              </p>
            ) : (
              commandes.map((c) => (
                <div key={c.id} className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{c.numero}</span>
                    <span className="text-[var(--color-faso-green)]">{formatFCFA(c.montantTotal)}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-ink-soft)]">Client : {c.nomAcheteur}</div>
                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-[var(--color-border)]">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">{c.statut}</span>
                    <Link href={`/suivi/${c.numero}`} className="text-[var(--color-faso-green)] hover:underline font-bold">
                      Détails &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
