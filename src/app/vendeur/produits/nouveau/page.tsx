"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function NouveauProduitPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("5");
  const [categorieId, setCategorieId] = useState("");

  // Photo URLs (1 to 5)
  const [photoInputs, setPhotoInputs] = useState<string[]>([
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop"
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setCategorieId(data.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCats();
  }, []);

  const addPhotoInput = () => {
    if (photoInputs.length < 5) {
      setPhotoInputs([...photoInputs, ""]);
    }
  };

  const removePhotoInput = (index: number) => {
    if (photoInputs.length > 1) {
      setPhotoInputs(photoInputs.filter((_, idx) => idx !== index));
    }
  };

  const handlePhotoChange = (index: number, value: string) => {
    const updated = [...photoInputs];
    updated[index] = value;
    setPhotoInputs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validPhotos = photoInputs.map(p => p.trim()).filter(p => p.length > 0);
    if (validPhotos.length < 1 || validPhotos.length > 5) {
      setErrorMsg("Vous devez fournir entre 1 et 5 photos d'illustration pour votre produit.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim(),
          prix: parseInt(prix),
          stock: parseInt(stock),
          categorieId,
          photos: validPhotos
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Produit publié avec succès sur MarketFaso ! Redirection...");
        setTimeout(() => router.push("/vendeur"), 1500);
      } else {
        setErrorMsg(data.error || "Erreur lors de la publication du produit.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href="/vendeur"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-faso-red)] transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          <span>Retour au tableau de bord</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
          Publier une nouvelle annonce
        </h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Remplissez les détails et ajoutez de 1 à 5 photos pour présenter votre article.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {errorMsg && <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-green-100 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2"><CheckCircle2 size={16}/>{successMsg}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Nom du produit / Article <span className="text-[var(--color-faso-red)]">*</span>
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Panneau Solaire 200W Monocristallin"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Catégorie <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Prix unitaire (en FCFA) <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="Ex: 85000"
                className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-bold text-[var(--color-faso-green)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Stock disponible <span className="text-[var(--color-faso-red)]">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex: 5"
                className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Description détaillée <span className="text-[var(--color-faso-red)]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'état, la marque, les caractéristiques et les conditions de garantie de l'article..."
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
          </div>
        </div>

        {/* Photos Management Section (1 to 5 Photos) */}
        <div className="border-t border-[var(--color-border)] pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-[var(--color-ink)]">
                Photographies de l'article (1 à 5 photos max)
              </label>
              <span className="text-[11px] text-[var(--color-ink-soft)] block">
                La première photo sera la photo principale d'affichage.
              </span>
            </div>

            {photoInputs.length < 5 && (
              <button
                type="button"
                onClick={addPhotoInput}
                className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-gray-200 text-[var(--color-ink)] text-xs font-bold rounded-lg border border-[var(--color-border)] flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Ajouter une photo</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {photoInputs.map((url, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-[var(--color-ink-soft)] flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="relative flex-grow">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => handlePhotoChange(idx, e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
                  />
                  <ImageIcon size={14} className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                {idx === 0 && (
                  <span className="px-2.5 py-1 bg-[var(--color-faso-green)] text-white text-[10px] font-bold rounded-full flex-shrink-0">
                    Principale
                  </span>
                )}

                {photoInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhotoInput(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                    title="Supprimer la photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-[var(--color-faso-red)] hover:bg-[#d02430] disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
        >
          {submitting ? "Publication en cours..." : "Publier l'annonce sur MarketFaso"}
        </button>
      </form>
    </div>
  );
}
