"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, User, Mail, Phone, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function VendeurInscriptionPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [description, setDescription] = useState("");
  const [ville, setVille] = useState("Ouagadougou");
  const [secteur, setSecteur] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephonePro, setTelephonePro] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-vendeur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom, prenom, email, telephone, motDePasse, nomBoutique, description, ville, secteur, adresse, telephonePro
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Votre compte vendeur a été créé avec succès ! Redirection vers la connexion...");
        setTimeout(() => router.push("/vendeur/connexion"), 2000);
      } else {
        setErrorMsg(data.error || "Erreur lors de la création du compte.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] rounded-2xl flex items-center justify-center mx-auto">
          <Store size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Ouvrir une Boutique Vendeur</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">Vendez vos produits à des milliers d'acheteurs au Burkina Faso</p>
      </div>

      <form onSubmit={handleRegister} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        {errorMsg && <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-green-100 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2"><CheckCircle2 size={16}/> {successMsg}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Nom</label>
            <input type="text" required value={nom} onChange={(e)=>setNom(e.target.value)} placeholder="Ouédraogo" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Prénom</label>
            <input type="text" required value={prenom} onChange={(e)=>setPrenom(e.target.value)} placeholder="Moussa" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Adresse E-mail</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="moussa@boutique.bf" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Téléphone Mobile Money</label>
            <input type="tel" required value={telephone} onChange={(e)=>setTelephone(e.target.value)} placeholder="+226 76 11 22 33" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Mot de passe</label>
          <input type="password" required value={motDePasse} onChange={(e)=>setMotDePasse(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Nom de votre Boutique / Commerce *</label>
            <input type="text" required value={nomBoutique} onChange={(e)=>setNomBoutique(e.target.value)} placeholder="Ex: FasoTech Ouaga" className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] font-bold text-[var(--color-faso-green)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Ville d'implantation *</label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)] cursor-pointer"
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
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Secteur / Quartier *</label>
              <input
                type="text"
                required
                value={secteur}
                onChange={(e) => setSecteur(e.target.value)}
                placeholder="Ex: Koulouba, Gounghin..."
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Adresse physique / Repère</label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Ex: Face à la pharmacie..."
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">WhatsApp / Ligne Boutique</label>
              <input
                type="tel"
                value={telephonePro}
                onChange={(e) => setTelephonePro(e.target.value)}
                placeholder="+226 70 00 00 00"
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">Description de la boutique (Optionnel)</label>
            <textarea rows={2} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Spécialiste téléphones, énergie solaire, artisanat..." className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Création de la boutique..." : "Créer ma boutique gratuite"}
          <ArrowRight size={16} />
        </button>

        <div className="text-center text-xs text-[var(--color-ink-soft)]">
          Déjà inscrit ?{" "}
          <Link href="/vendeur/connexion" className="font-bold text-[var(--color-faso-green)] hover:underline">
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}
