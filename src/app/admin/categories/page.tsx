"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, FolderPlus, Trash2, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminCategoriesPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        setErrorMsg(data.error || "Erreur de chargement.");
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
      fetchCategories();
    }
  }, [status, session]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, slug })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de créer la catégorie.");
      }

      setMessage(`La catégorie "${data.data.nom}" a bien été créée !`);
      setNom("");
      setSlug("");
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) return;

    setMessage("");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de supprimer cette catégorie.");
      }
      setMessage("Catégorie supprimée avec succès.");
      fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de suppression.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Gestion des Catégories de Produits</h1>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Créez, modifiez ou supprimez les catégories du catalogue MarketFaso
          </p>
        </div>

        <button
          onClick={fetchCategories}
          className="px-3 py-1.5 bg-white border border-[var(--color-border)] hover:bg-gray-50 rounded-xl text-xs font-semibold text-[var(--color-ink)] flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-100 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Creation Form */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <FolderPlus size={18} className="text-[var(--color-faso-green)]" />
          Ajouter une nouvelle catégorie
        </h2>

        <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
              }}
              placeholder="Ex: Équipements Solaires, Artisanat..."
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Slug URL (Automatique)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="equipements-solaires"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-3 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>{submitting ? "..." : "Créer"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-ink-soft)]">
          Chargement des catégories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-ink-soft)]">
          Aucune catégorie enregistrée.
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">
                <th className="py-3 px-4">Nom Catégorie</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Nombre de Produits</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[var(--color-ink)]">
                    {cat.nom}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500 text-[11px]">
                    {cat.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-md font-bold text-[var(--color-ink)]">
                      {cat._count?.produits || 0} produit{cat._count?.produits > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.nom)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
