"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Lock, Mail, ArrowRight } from "lucide-react";

export default function VendeurConnexionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Si déjà connecté, rediriger automatiquement vers le bon espace
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "ADMINISTRATEUR") {
        router.replace("/admin");
      } else if (role === "LIVREUR") {
        router.replace("/livreur");
      } else if (role === "VENDEUR") {
        router.replace("/vendeur");
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        identifiant: identifiant.trim(),
        motDePasse,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg("E-mail/Téléphone ou mot de passe incorrect.");
      } else {
        const currentSession = await getSession();
        const role = (currentSession?.user as any)?.role;
        if (role === "ADMINISTRATEUR") {
          router.push("/admin");
        } else if (role === "LIVREUR") {
          router.push("/livreur");
        } else {
          router.push("/vendeur");
        }
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[var(--color-faso-red)]/10 text-[var(--color-faso-red)] rounded-2xl flex items-center justify-center mx-auto">
          <Store size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Espace Vendeur MarketFaso</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">Connectez-vous pour gérer votre boutique et vos commandes</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            E-mail ou Téléphone
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="vendeur.ouaga@marketfaso.bf"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
            <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-faso-green)]"
            />
            <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Connexion..." : "Se connecter"}
          <ArrowRight size={16} />
        </button>

        <div className="text-center pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-ink-soft)]">
          Pas encore de boutique ?{" "}
          <Link href="/vendeur/inscription" className="font-bold text-[var(--color-faso-green)] hover:underline">
            Inscrire ma boutique
          </Link>
        </div>
      </form>
    </div>
  );
}
