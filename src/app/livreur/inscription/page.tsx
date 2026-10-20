"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldAlert, CheckCircle2, User, Mail, Phone, Lock, MapPin, Bike } from "lucide-react";

export default function LivreurInscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    zoneExecution: "Ouagadougou (Centre-ville & Gounghin)",
    typeVehicule: "MOTO",
    immatriculation: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-livreur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'inscription.");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Candidature enregistrée !</h1>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2 text-xs text-amber-900">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-amber-600" /> Compte statut: EN_ATTENTE
          </p>
          <p>
            Votre inscription en tant que livreur a bien été reçue. Pour des raisons de sécurité, un administrateur MarketFaso doit valider vos informations avant que vous ne puissiez accepter des livraisons.
          </p>
        </div>
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/livreur/connexion"
            className="w-full py-3 bg-[var(--color-faso-green)] text-white font-bold text-xs rounded-xl shadow-sm text-center"
          >
            Se connecter à mon espace
          </Link>
          <Link
            href="/"
            className="text-xs text-[var(--color-ink-soft)] hover:underline"
          >
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] rounded-2xl flex items-center justify-center mx-auto">
          <Truck size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Devenir Livreur MarketFaso</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">Rejoignez le réseau national de livraison rapide au Burkina Faso</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Prénom</label>
            <input
              type="text"
              required
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              placeholder="Ex: Moussa"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Nom</label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Ouédraogo"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">E-mail</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="moussa.livreur@gmail.com"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Téléphone</label>
            <input
              type="tel"
              required
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="+226 70 11 22 33"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.motDePasse}
            onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
            placeholder="Minimum 6 caractères"
            className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
          <h3 className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5">
            <Bike size={16} className="text-[var(--color-faso-green)]" /> Information Véhicule & Zone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Type de véhicule</label>
              <select
                value={formData.typeVehicule}
                onChange={(e) => setFormData({ ...formData, typeVehicule: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
              >
                <option value="MOTO">Moto (RTM / Yamaha / etc.)</option>
                <option value="TRICYCLE">Tricycle (Fret lourds)</option>
                <option value="VOITURE">Voiture / Camionnette</option>
                <option value="VELO">Vélo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Plaque / Immatriculation</label>
              <input
                type="text"
                value={formData.immatriculation}
                onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                placeholder="Ex: 11-AB-1234 (Facultatif)"
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Zone principale d'activité</label>
            <input
              type="text"
              required
              value={formData.zoneExecution}
              onChange={(e) => setFormData({ ...formData, zoneExecution: e.target.value })}
              placeholder="Ex: Ouagadougou (Zogona, Dassasgho, Wayalghin)"
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          {loading ? "Création du compte..." : "Soumettre ma candidature"}
        </button>

        <div className="text-center pt-2 text-xs text-[var(--color-ink-soft)]">
          Déjà un compte ?{" "}
          <Link href="/livreur/connexion" className="font-bold text-[var(--color-faso-green)] hover:underline">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}
