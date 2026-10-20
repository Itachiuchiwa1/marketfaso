"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function ModifierProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [statut, setStatut] = useState<"ACTIF" | "INACTIF">("ACTIF");

  // Photos (1 to 5)
  const [photoInputs, setPhotoInputs] = useState<string[]>([]);

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        // 1. Load categories
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.data);
        }

        // 2. Load product details
        const prodRes = await fetch(`/api/produits/${id}`);
        const prodData = await prodRes.json();
        if (prodData.success && prodData.data) {
          const p = prodData.data;
          setNom(p.nom || "");
          setDescription(p.description || "");
          setPrix(p.prix ? p.prix.toString() : "");
          setStock(p.stock !== undefined ? p.stock.toString() : "0");
          setCategorieId(p.categorieId || "");
          setStatut(p.statut || "ACTIF");

          const existingPhotos = (p.photos || []).map((ph: any) => ph.url);
          setPhotoInputs(existingPhotos.length > 0 ? existingPhotos : [""]);
        } else {
          setErrorMsg("Impossible de charger les informations du produit.");
        }
      } catch (err) {
        setErrorMsg("Erreur réseau lors de l'initialisation.");
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [id]);

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

    const validPhotos = photoInputs.map((p) => p.trim()).filter((p) => p.length > 0);
    if (validPhotos.length < 1 || validPhotos.length > 5) {
      setErrorMsg("Vous devez spécifier entre 1 et 5 photos d'illustration pour le produit.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/produits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim(),
          prix: parseInt(prix),
          stock: parseInt(stock),
          categorieId,
          statut,
          photos: validPhotos
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Produit mis à jour avec succès !");
        setTimeout(() => {
          router.push("/vendeur");
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Erreur lors de la modification du produit.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le produit "${nom}" ?`)) {
      return;
    }

    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/produits/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "Produit supprimé avec succès.");
        setTimeout(() => {
          router.push("/vendeur");
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(data.error || "Impossible de supprimer ce produit.");
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] font-semibold">
        Chargement de la fiche produit...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/vendeur"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>
        <Link
          href={`/produits/${id}`}
          target="_blank"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[var(--color-ink)] rounded-xl transition-colors"
        >
          <Eye size={14} /> Voir l'annonce en ligne
        </Link>
      </div>

      <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">
          Modifier le produit
        </h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Mettez à jour le prix en FCFA, le stock disponible, la description et les photos.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-100 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Titre & Catégorie */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Nom du produit / Titre de l'annonce *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Samsung Galaxy S23 Ultra 256GB"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-bold text-[var(--color-ink)]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Catégorie *
            </label>
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prix, Stock & Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Prix unitaire (FCFA) *
            </label>
            <input
              type="number"
              required
              min={100}
              step={50}
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Ex: 450000"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-mono font-bold text-[var(--color-faso-green)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Quantité en stock disponible *
            </label>
            <input
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Ex: 5"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Visibilité de l'annonce *
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer font-bold"
            >
              <option value="ACTIF">ACTIF (En vente)</option>
              <option value="INACTIF">INACTIF (Désactivé)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Description détaillée *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'état, les caractéristiques et les conditions de vente..."
            className="w-full p-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] leading-relaxed"
          />
        </div>

        {/* Photos (1 à 5 photos) */}
        <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                <ImageIcon size={15} className="text-[var(--color-faso-green)]" />
                Photos du produit ({photoInputs.length} / 5)
              </h3>
              <p className="text-[11px] text-[var(--color-ink-soft)]">
                La première photo sera la photo de couverture principale.
              </p>
            </div>

            {photoInputs.length < 5 && (
              <button
                type="button"
                onClick={addPhotoInput}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[var(--color-ink)] rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Ajouter une photo
              </button>
            )}
          </div>

          <div className="space-y-2">
            {photoInputs.map((photo, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[var(--color-ink-soft)] w-16">
                  {index === 0 ? "Couverture :" : `Photo ${index + 1} :`}
                </span>
                <input
                  type="url"
                  required
                  value={photo}
                  onChange={(e) => handlePhotoChange(index, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-grow px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-mono"
                />
                {photoInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhotoInput(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer cette photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions Buttons */}
        <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 size={15} />
            <span>{deleting ? "Suppression..." : "Supprimer ce produit"}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/vendeur"
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] text-center transition-colors"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={submitting || deleting}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{submitting ? "Enregistrement..." : "Enregistrer les modifications"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
