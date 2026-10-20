"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Search, Filter, RefreshCw, ExternalLink, MapPin } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function AdminProduitsPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TOUS");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/produits");
      const data = await res.json();
      if (data.success) {
        setProduits(data.data || []);
      } else {
        setErrorMsg(data.error || "Impossible de charger les produits.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
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
      fetchProduits();
    }
  }, [status, session]);

  const categoriesUniques = Array.from(
    new Set(produits.map((p) => p.categorie?.nom).filter(Boolean))
  );

  const filteredProduits = produits.filter((p) => {
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.vendeur?.nomBoutique.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchCat = categoryFilter === "TOUS" || p.categorie?.nom === categoryFilter;

    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={16} /> Retour au tableau de bord Admin
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[var(--color-ink)] rounded-xl transition-colors"
        >
          <ExternalLink size={14} /> Voir le site public
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Supervision des Produits & Stocks</h1>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Consultez l'ensemble des annonces, stocks en réserve et prix sur la plateforme
          </p>
        </div>

        <button
          onClick={fetchProduits}
          className="px-3 py-1.5 bg-white border border-[var(--color-border)] hover:bg-gray-50 rounded-xl text-xs font-semibold text-[var(--color-ink)] flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de produit ou boutique..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          >
            <option value="TOUS">Toutes les catégories</option>
            {categoriesUniques.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-ink-soft)]">
          Chargement des produits...
        </div>
      ) : filteredProduits.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-ink-soft)]">
          Aucun produit ne correspond à la recherche.
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Vendeur / Boutique</th>
                  <th className="py-3 px-4">Prix (FCFA)</th>
                  <th className="py-3 px-4">Quantité en Stock</th>
                  <th className="py-3 px-4">Date de Création</th>
                  <th className="py-3 px-4 text-right">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-xs">
                {filteredProduits.map((prod) => {
                  const photoUrl = prod.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop";
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                            <Image src={photoUrl} alt={prod.nom} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--color-ink)]">{prod.nom}</div>
                            <div className="text-[10px] text-gray-400 line-clamp-1">{prod.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-semibold text-gray-700">
                          {prod.categorie?.nom || "N/A"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--color-faso-green)] flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{prod.vendeur?.nomBoutique}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {prod.vendeur?.utilisateur?.prenom} {prod.vendeur?.utilisateur?.nom}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-[var(--color-ink)]">
                        {formatFCFA(prod.prix)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          prod.stock > 5 ? "bg-green-100 text-green-800" :
                          prod.stock > 0 ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {prod.stock} unité{prod.stock > 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {new Date(prod.dateCreation).toLocaleDateString("fr-FR")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/produits/${prod.id}`}
                          target="_blank"
                          className="p-1.5 text-[var(--color-faso-green)] hover:bg-green-50 rounded-lg inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          Fiche <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
