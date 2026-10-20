"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { getCart, updateCartQuantity, clearCart, formatFCFA, CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const FRAIS_LIVRAISON = 1500; // Fixed delivery fee in FCFA

  useEffect(() => {
    setIsClient(true);
    setItems(getCart());

    const handleUpdate = () => setItems(getCart());
    window.addEventListener("marketfaso_cart_updated", handleUpdate);
    return () => window.removeEventListener("marketfaso_cart_updated", handleUpdate);
  }, []);

  if (!isClient) return null;

  const totalArticles = items.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const totalGeneral = totalArticles > 0 ? totalArticles + FRAIS_LIVRAISON : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/produits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-faso-red)] transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          <span>Continuer mes achats</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] flex items-center gap-3">
          <ShoppingBag className="text-[var(--color-faso-red)]" />
          <span>Mon Panier d'achat</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[var(--color-faso-red)] flex items-center justify-center mx-auto">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">Votre panier est vide</h2>
          <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">
            Découvrez nos meilleures annonces solaires, smartphones, véhicules et équipements disponibles au Burkina Faso.
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <span>Parcourir les annonces</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-8 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">
                Produits ({items.length})
              </span>
              <button
                onClick={() => clearCart()}
                className="text-xs text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Vider le panier</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <div key={item.produitId} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
                      <Image
                        src={item.photoUrl}
                        alt={item.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link href={`/produits/${item.produitId}`} className="font-bold text-sm text-[var(--color-ink)] hover:text-[var(--color-faso-red)] transition-colors line-clamp-1">
                        {item.nom}
                      </Link>
                      <span className="text-xs text-[var(--color-ink-soft)] block">Vendeur : {item.nomBoutique}</span>
                      <span className="text-sm font-extrabold text-[var(--color-faso-green)] block mt-1">
                        {formatFCFA(item.prix)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                      <button
                        onClick={() => updateCartQuantity(item.produitId, item.quantite - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold">{item.quantite}</span>
                      <button
                        onClick={() => updateCartQuantity(item.produitId, item.quantite + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[var(--color-ink)] block">
                        {formatFCFA(item.prix * item.quantite)}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.produitId, 0)}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-xs sticky top-24">
            <h2 className="text-base font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3">
              Récapitulatif de la commande
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[var(--color-ink-soft)]">
                <span>Sous-total articles</span>
                <span className="font-bold text-[var(--color-ink)]">{formatFCFA(totalArticles)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-ink-soft)]">
                <span>Frais de livraison (estimés)</span>
                <span className="font-bold text-[var(--color-ink)]">{formatFCFA(FRAIS_LIVRAISON)}</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between text-sm">
                <span className="font-bold text-[var(--color-ink)]">Montant Total</span>
                <span className="font-extrabold text-lg text-[var(--color-faso-green)]">{formatFCFA(totalGeneral)}</span>
              </div>
            </div>

            <Link
              href="/commande"
              className="w-full py-4 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Valider la commande</span>
              <ArrowRight size={18} />
            </Link>

            <div className="bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] space-y-2 text-[11px] text-[var(--color-ink-soft)]">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--color-ink)]">
                <ShieldCheck size={14} className="text-[var(--color-faso-green)]" />
                <span>Paiement par Mobile Money</span>
              </div>
              <p>Orange Money & Moov Money acceptés après validation de votre adresse.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
