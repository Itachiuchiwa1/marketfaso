"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, MapPin, Phone, Mail, ArrowLeft, CheckCircle2, AlertCircle, Save, ExternalLink, ShieldCheck } from "lucide-react";

export default function VendeurProfilSettingsPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [nomBoutique, setNomBoutique] = useState("");
  const [description, setDescription] = useState("");
  const [ville, setVille] = useState("Ouagadougou");
  const [secteur, setSecteur] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephonePro, setTelephonePro] = useState("");
  const [vendeurId, setVendeurId] = useState("");

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendeur/profil");
      const data = await res.json();
      if (data.success && data.data) {
        const v = data.data;
        setVendeurId(v.id);
        setNomBoutique(v.nomBoutique || "");
        setDescription(v.description || "");
        setVille(v.ville || "Ouagadougou");
        setSecteur(v.secteur || "");
        setAdresse(v.adresse || "");
        setTelephonePro(v.telephonePro || "");
      } else {
        setErrorMsg(data.error || "Impossible de charger le profil de la boutique.");
      }
    } catch (e) {
      setErrorMsg("Erreur réseau lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/vendeur/connexion");
    } else if (session?.user) {
      if ((session.user as any).role !== "VENDEUR") {
        router.push("/");
        return;
      }
      fetchProfil();
    }
  }, [status, session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/vendeur/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomBoutique,
          description,
          ville,
          secteur,
          adresse,
          telephonePro
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Boutique mise à jour avec succès !");
      } else {
        setErrorMsg(data.error || "Erreur lors de l'enregistrement.");
      }
    } catch (e) {
      setErrorMsg("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-[var(--color-ink-soft)] font-semibold">
        Chargement des paramètres de votre boutique...
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
          <ArrowLeft size={16} /> Retour à mon tableau de bord
        </Link>
        {vendeurId && (
          <Link
            href={`/vendeurs/${vendeurId}`}
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[var(--color-ink)] rounded-xl transition-colors"
          >
            <ExternalLink size={14} /> Voir ma boutique publique
          </Link>
        )}
      </div>

      <div className="space-y-1 border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Store className="text-[var(--color-faso-green)]" size={26} />
          Paramètres de ma Boutique
        </h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Modifiez le nom de votre boutique, sa localisation au Burkina Faso et vos informations de contact client.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-100 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Identité de la boutique */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
            Identité commerciale
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Nom de la Boutique / Enseigne *
            </label>
            <input
              type="text"
              required
              value={nomBoutique}
              onChange={(e) => setNomBoutique(e.target.value)}
              placeholder="Ex: FasoTech Ouaga"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-bold text-[var(--color-ink)]"
            />
            <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">
              Ce nom apparaît sur vos fiches produits, dans le catalogue et sur vos bons de livraison.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Description de l'activité
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentez brièvement vos produits, vos spécialités et garanties..."
              className="w-full p-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] leading-relaxed"
            />
          </div>
        </div>

        {/* Localisation au Burkina Faso */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
            <MapPin size={16} className="text-[var(--color-faso-green)]" />
            Localisation géographique
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Ville principale *
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
                <option value="Kaya">Kaya</option>
                <option value="Fada N'Gourma">Fada N'Gourma</option>
                <option value="Dédougou">Dédougou</option>
                <option value="Tenkodogo">Tenkodogo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                Secteur / Quartier
              </label>
              <input
                type="text"
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                placeholder="Ex: Secteur 15, Gounghin, Koulouba..."
                className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Adresse physique / Repère de retrait pour les livreurs
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: Face à la pharmacie de la Paix, grand portail vert"
              className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
            <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">
              Aide les livreurs à récupérer rapidement vos colis pour expédition.
            </p>
          </div>
        </div>

        {/* Contact direct client */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
            <Phone size={16} className="text-[var(--color-faso-green)]" />
            Ligne directe boutique & WhatsApp
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
              Numéro de téléphone commercial / WhatsApp
            </label>
            <input
              type="tel"
              value={telephonePro}
              onChange={(e) => setTelephonePro(e.target.value)}
              placeholder="Ex: +226 70 11 22 33"
              className="w-full px-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-mono"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <Link
            href="/vendeur"
            className="px-4 py-2.5 text-xs font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
