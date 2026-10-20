"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import { getCart, formatFCFA, CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("Ouagadougou");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const FRAIS_LIVRAISON = 1500;

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      router.push("/panier");
    } else {
      setItems(cart);
    }
  }, [router]);

  const totalArticles = items.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  const totalGeneral = totalArticles + FRAIS_LIVRAISON;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nom.trim() || !telephone.trim() || !adresse.trim()) {
      setErrorMsg("Veuillez remplir vos coordonnées complètes de livraison.");
      return;
    }

    setSubmitting(true);

    try {
      const adresseComplete = `${adresse.trim()}, ${ville}`;
      const payload = {
        nomAcheteur: nom.trim(),
        telephoneAcheteur: telephone.trim(),
        adresseLivraison: adresseComplete,
        articles: items.map(i => ({
          produitId: i.produitId,
          quantite: i.quantite,
          nom: i.nom
        })),
        fraisLivraison: FRAIS_LIVRAISON
      };

      const res = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to payment step with created order ID
        router.push(`/paiement?commandeId=${data.data.id}`);
      } else {
        setErrorMsg(data.error || "Impossible de créer la commande.");
      }
    } catch (err) {
      setErrorMsg("Erreur de connexion au serveur. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/panier"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-faso-red)] transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          <span>Retour au panier</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
          Validation de la livraison
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-ink-soft)] mt-1">
          Achat rapide sans compte — Renseignez votre adresse pour le livreur.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Guest Address Form */}
        <div className="lg:col-span-7 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
            <User size={18} className="text-[var(--color-faso-green)]" />
            <span>Coordonnées du destinataire</span>
          </h2>

          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Nom & Prénom <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Wendyam Ouédraogo"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
                />
                <User size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Numéro de Téléphone (Mobile Money) <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: +226 70 12 34 56"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
                />
                <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
              <span className="text-[11px] text-[var(--color-ink-soft)] mt-1 block">
                Ce numéro sera utilisé par le livreur pour vous contacter à l'arrivée.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Ville de livraison <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer"
              >
                <option value="Ouagadougou">Ouagadougou</option>
                <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                <option value="Koudougou">Koudougou</option>
                <option value="Ouahigouya">Ouahigouya</option>
                <option value="Banfora">Banfora</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Adresse précise & Repères visuels <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Quartier Koulouba, derrière la station Total, maison avec portail bleu..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
                />
                <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Confirm Action */}
        <div className="lg:col-span-5 bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-5 shadow-xs">
          <h2 className="text-base font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3">
            Récapitulatif des articles
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((it) => (
              <div key={it.produitId} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[var(--color-ink)] block">{it.nom}</span>
                  <span className="text-[11px] text-[var(--color-ink-soft)]">Quantité : {it.quantite}</span>
                </div>
                <span className="font-bold text-[var(--color-ink)]">{formatFCFA(it.prix * it.quantite)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-[var(--color-ink-soft)]">
              <span>Articles ({items.length})</span>
              <span>{formatFCFA(totalArticles)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-ink-soft)]">
              <span>Frais de livraison moto</span>
              <span>{formatFCFA(FRAIS_LIVRAISON)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[var(--color-faso-green)] border-t border-dashed pt-2">
              <span>Total à payer</span>
              <span>{formatFCFA(totalGeneral)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[var(--color-faso-red)] hover:bg-[#d02430] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Vérification de la commande...</span>
            ) : (
              <>
                <span>Continuer vers le paiement Mobile Money</span>
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
