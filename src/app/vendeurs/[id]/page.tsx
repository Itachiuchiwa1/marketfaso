"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, MapPin, Phone, Mail, ShoppingBag, ArrowLeft, PackageCheck } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function PublicVendeurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vendeur, setVendeur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadVendeur() {
      try {
        const res = await fetch(`/api/vendeurs/${id}`);
        const data = await res.json();
        if (data.success) {
          setVendeur(data.data);
        } else {
          setErrorMsg("Boutique introuvable.");
        }
      } catch (e) {
        setErrorMsg("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    }
    loadVendeur();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] font-semibold">
        Chargement de la boutique...
      </div>
    );
  }

  if (!vendeur || errorMsg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Store size={48} className="mx-auto text-gray-300" />
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Boutique introuvable</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">La boutique demandée n'existe pas ou n'est plus active.</p>
        <Link href="/produits" className="inline-block px-4 py-2 bg-[var(--color-faso-green)] text-white text-xs font-bold rounded-xl">
          &larr; Retour au catalogue
        </Link>
      </div>
    );
  }

  const produits = vendeur.produits || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/produits"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft size={16} /> Retour au catalogue complet
      </Link>

      {/* Seller Header Banner */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] flex items-center justify-center font-bold text-2xl">
              <Store size={36} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-faso-green)] bg-green-50 px-2.5 py-0.5 rounded-full">
                  <PackageCheck size={12} /> Boutique Vérifiée
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  <MapPin size={11} className="text-[var(--color-faso-green)]" />
                  <span>{vendeur.ville || "Ouagadougou"}{vendeur.secteur ? ` • ${vendeur.secteur}` : ""}</span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--color-ink)]">{vendeur.nomBoutique}</h1>
              <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                Gérant(e) : {vendeur.utilisateur?.prenom} {vendeur.utilisateur?.nom}
                {vendeur.adresse ? ` — ${vendeur.adresse}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col text-xs text-[var(--color-ink-soft)] space-y-1 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
              <Phone size={14} className="text-[var(--color-faso-green)]" />
              <span>{vendeur.telephonePro || vendeur.utilisateur?.telephone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-gray-400" />
              <span>{vendeur.utilisateur?.email}</span>
            </div>
          </div>
        </div>

        {vendeur.description && (
          <div className="pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-ink-soft)] leading-relaxed">
            {vendeur.description}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">
            Toutes les annonces de {vendeur.nomBoutique} ({produits.length})
          </h2>
        </div>

        {produits.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-ink-soft)]">
            Cette boutique n'a aucun produit en vente pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {produits.map((prod: any) => {
              const photoUrl = prod.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop";
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                >
                  <Link href={`/produits/${prod.id}`} className="relative h-48 bg-gray-100 overflow-hidden block">
                    <Image
                      src={photoUrl}
                      alt={prod.nom}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.categorie && (
                      <span className="absolute top-2 left-2 bg-[var(--color-ink)]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {prod.categorie.nom}
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <Link href={`/produits/${prod.id}`}>
                        <h3 className="font-bold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-faso-red)] transition-colors line-clamp-2">
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
                        <span>Voir</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
