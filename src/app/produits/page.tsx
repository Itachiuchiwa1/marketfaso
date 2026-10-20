"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ShoppingBag, MapPin, SlidersHorizontal } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("categorie") || "";

  const [produits, setProduits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [minPrix, setMinPrix] = useState("");
  const [maxPrix, setMaxPrix] = useState("");
  const [tri, setTri] = useState("nouveautes");

  useEffect(() => {
    async function loadInitial() {
      try {
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCat) params.set("categorie", selectedCat);
        if (minPrix) params.set("minPrix", minPrix);
        if (maxPrix) params.set("maxPrix", maxPrix);
        if (tri) params.set("tri", tri);

        const res = await fetch(`/api/produits?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProduits(data.data);
        }
      } catch (e) {
        console.error("Error fetching filtered products", e);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [query, selectedCat, minPrix, maxPrix, tri]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
          Catalogue des annonces au Burkina Faso
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-soft)] mt-1">
          Trouvez des produits neufs et d'occasion auprès de vendeurs locaux vérifiés.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par mot-clé (solaire, hp, samsung...)"
              className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nom} ({c._count?.produits || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer font-medium"
            >
              <option value="nouveautes">Nouveautés d'abord</option>
              <option value="prix_asc">Prix : croissant</option>
              <option value="prix_desc">Prix : décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[var(--color-faso-green)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[var(--color-ink-soft)] font-semibold">Chargement des produits...</p>
        </div>
      ) : produits.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-3">
          <Search size={40} className="text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-[var(--color-ink)]">Aucun produit ne correspond à votre recherche</h3>
          <p className="text-xs text-[var(--color-ink-soft)] max-w-md mx-auto">
            Essayez de modifier vos filtres ou de rechercher un mot-clé plus général.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCat("");
              setMinPrix("");
              setMaxPrix("");
            }}
            className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg border border-[var(--color-border)] hover:bg-gray-100"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {produits.map((prod) => {
            const photoPrincipale = prod.photos?.find((p: any) => p.estPrincipale)?.url || prod.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop";
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all flex flex-col group"
              >
                <Link href={`/produits/${prod.id}`} className="relative h-48 bg-gray-100 overflow-hidden block">
                  <Image
                    src={photoPrincipale}
                    alt={prod.nom}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[var(--color-ink)]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {prod.categorie?.nom}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-white/90 text-[var(--color-ink)] text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <MapPin size={11} className="text-[var(--color-faso-green)]" />
                    <span>{prod.vendeur?.nomBoutique}</span>
                  </span>
                </Link>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <Link href={`/produits/${prod.id}`}>
                      <h3 className="font-bold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-faso-red)] transition-colors line-clamp-2 leading-snug">
                        {prod.nom}
                      </h3>
                    </Link>
                    <p className="text-xs text-[var(--color-ink-soft)] line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--color-ink-soft)]">Prix</div>
                      <div className="text-base font-bold text-[var(--color-faso-green)]">
                        {formatFCFA(prod.prix)}
                      </div>
                    </div>

                    <Link
                      href={`/produits/${prod.id}`}
                      className="px-3 py-1.5 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ShoppingBag size={14} />
                      <span>Acheter</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] font-semibold">
        Chargement du catalogue...
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
