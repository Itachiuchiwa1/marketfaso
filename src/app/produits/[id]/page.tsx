"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, Check, Star, Store, MapPin, Shield, Truck, AlertCircle } from "lucide-react";
import { formatFCFA, addToCart } from "@/lib/cart";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [produit, setProduit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [quantite, setQuantite] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  // Review Form state
  const [avisNote, setAvisNote] = useState(5);
  const [avisCommentaire, setAvisCommentaire] = useState("");
  const [submittingAvis, setSubmittingAvis] = useState(false);
  const [avisMessage, setAvisMessage] = useState("");

  useEffect(() => {
    async function loadProduit() {
      try {
        const res = await fetch(`/api/produits/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduit(data.data);
        }
      } catch (e) {
        console.error("Error loading product", e);
      } finally {
        setLoading(false);
      }
    }

    loadProduit();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--color-faso-red)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Chargement de la fiche produit...</p>
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Produit introuvable</h1>
        <p className="text-sm text-[var(--color-ink-soft)]">L'annonce que vous recherchez a peut-être été retirée par le vendeur.</p>
        <Link href="/produits" className="inline-block px-6 py-2.5 bg-[var(--color-faso-green)] text-white text-xs font-bold rounded-lg">
          &larr; Retour aux annonces
        </Link>
      </div>
    );
  }

  const photos = produit.photos && produit.photos.length > 0
    ? produit.photos
    : [{ url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop" }];

  const photoCourante = photos[selectedPhotoIndex]?.url || photos[0].url;

  const handleAddToCart = () => {
    addToCart({
      produitId: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      photoUrl: photoCourante,
      vendeurId: produit.vendeurId,
      nomBoutique: produit.vendeur?.nomBoutique || "Boutique"
    }, quantite);

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/panier");
  };

  const handleAddAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAvis(true);
    setAvisMessage("");

    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: avisNote,
          commentaire: avisCommentaire,
          produitId: produit.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setAvisMessage("Avis enregistré avec succès ! Merci pour votre retour.");
        setAvisCommentaire("");
        // Reload product to show new review
        const reloadRes = await fetch(`/api/produits/${id}`);
        const reloadData = await reloadRes.json();
        if (reloadData.success) setProduit(reloadData.data);
      } else {
        setAvisMessage(data.error || "Erreur lors de la soumission");
      }
    } catch (err) {
      setAvisMessage("Erreur réseau");
    } finally {
      setSubmittingAvis(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/produits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-faso-red)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour au catalogue</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Photo Gallery (Left) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative h-96 w-full bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs">
            <Image
              src={photoCourante}
              alt={produit.nom}
              fill
              className="object-contain p-4"
              priority
            />
            <span className="absolute top-3 left-3 bg-[var(--color-ink)] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {produit.categorie?.nom}
            </span>
          </div>

          {/* Thumbnail Selectors (1 to 5 photos) */}
          {photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photos.map((ph: any, idx: number) => (
                <button
                  key={ph.id || idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl bg-white border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedPhotoIndex === idx
                      ? "border-[var(--color-faso-red)] ring-2 ring-[var(--color-faso-red)]/20"
                      : "border-[var(--color-border)] hover:border-gray-400"
                  }`}
                >
                  <Image src={ph.url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Infos & Buy Box (Right) */}
        <div className="lg:col-span-6 bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-[var(--color-faso-green)] uppercase tracking-wider mb-1">
              Code produit : #{produit.id.substring(0, 8)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] leading-tight">
              {produit.nom}
            </h1>
          </div>

          {/* Price & Stock */}
          <div className="flex items-baseline justify-between border-y border-[var(--color-border)] py-4">
            <div>
              <span className="text-xs text-[var(--color-ink-soft)] block">Prix unitaire</span>
              <span className="text-3xl font-extrabold text-[var(--color-faso-green)]">
                {formatFCFA(produit.prix)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-[var(--color-ink-soft)] block">Disponibilité</span>
              {produit.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <Check size={14} /> Stock : {produit.stock} unité{produit.stock > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  Rupture de stock
                </span>
              )}
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] flex items-center justify-center font-bold">
                <Store size={20} />
              </div>
              <div>
                <div className="text-xs text-[var(--color-ink-soft)]">Vendu par</div>
                <Link href={`/vendeurs/${produit.vendeurId}`} className="font-bold text-sm text-[var(--color-ink)] hover:underline">
                  {produit.vendeur?.nomBoutique || "Boutique Partenaire"}
                </Link>
              </div>
            </div>

            <Link
              href={`/vendeurs/${produit.vendeurId}`}
              className="text-xs font-semibold text-[var(--color-faso-green)] hover:underline"
            >
              Voir la boutique &rarr;
            </Link>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[var(--color-ink)]">Quantité :</span>
            <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
              <button
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                className="px-3 py-1.5 text-sm font-bold text-[var(--color-ink)] hover:bg-gray-200"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-sm font-bold">{quantite}</span>
              <button
                onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}
                className="px-3 py-1.5 text-sm font-bold text-[var(--color-ink)] hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {addedNotice && (
              <div className="p-3 bg-green-100 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fade-in">
                <Check size={16} /> Produit ajouté au panier avec succès !
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={produit.stock <= 0}
              className="w-full py-4 bg-[var(--color-faso-red)] hover:bg-[#d02430] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              <span>Ajouter au panier</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={produit.stock <= 0}
              className="w-full py-3.5 bg-[var(--color-faso-green)] hover:bg-[#008030] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Acheter directement</span>
            </button>
          </div>

          {/* Reassurances */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-[var(--color-ink-soft)] border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--color-faso-green)]" />
              <span>Paiement à la confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[var(--color-faso-green)]" />
              <span>Livraison rapide par coursier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3">
          Description détaillée
        </h2>
        <div className="text-sm text-[var(--color-ink-soft)] leading-relaxed whitespace-pre-line">
          {produit.description}
        </div>
      </div>

      {/* Avis & Evaluations */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-8">
        <h2 className="text-xl font-bold text-[var(--color-ink)] border-b border-[var(--color-border)] pb-3 flex items-center justify-between">
          <span>Avis des acheteurs ({produit.avis?.length || 0})</span>
        </h2>

        {/* Existing Avis list */}
        <div className="space-y-4">
          {produit.avis && produit.avis.length > 0 ? (
            produit.avis.map((av: any) => (
              <div key={av.id} className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-[var(--color-faso-gold)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= av.note ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-[11px] text-[var(--color-ink-soft)]">
                    {new Date(av.dateCreation).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {av.commentaire && <p className="text-xs text-[var(--color-ink)]">{av.commentaire}</p>}
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--color-ink-soft)]">Aucun avis déposé pour le moment. Soyez le premier à donner votre avis !</p>
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleAddAvis} className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-ink)]">Donner votre avis sur ce produit</h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">Note :</label>
            <div className="flex gap-1 text-[var(--color-faso-gold)] cursor-pointer">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setAvisNote(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star size={20} fill={s <= avisNote ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-soft)] mb-1">Commentaire (optionnel) :</label>
            <textarea
              rows={3}
              value={avisCommentaire}
              onChange={(e) => setAvisCommentaire(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit..."
              className="w-full p-3 text-xs bg-white border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-faso-green)]"
            />
          </div>

          {avisMessage && (
            <div className={`p-3 text-xs rounded-lg ${avisMessage.includes("succès") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {avisMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submittingAvis}
            className="px-5 py-2.5 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white text-xs font-bold rounded-lg transition-colors"
          >
            {submittingAvis ? "Enregistrement..." : "Publier mon avis"}
          </button>
        </form>
      </div>
    </div>
  );
}
