"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminConnexionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [identifiant, setIdentifiant] = useState("admin@marketfaso.bf");
  const [motDePasse, setMotDePasse] = useState("AdminPassword2026!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Si déjà connecté, rediriger automatiquement vers le bon espace
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "ADMINISTRATEUR") {
        router.replace("/admin");
      } else if (role === "VENDEUR") {
        router.replace("/vendeur");
      } else if (role === "LIVREUR") {
        router.replace("/livreur");
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
        setErrorMsg("Identifiants administrateur incorrects.");
      } else {
        const currentSession = await getSession();
        const role = (currentSession?.user as any)?.role;
        if (role === "ADMINISTRATEUR") {
          router.push("/admin");
        } else if (role === "VENDEUR") {
          router.push("/vendeur");
        } else if (role === "LIVREUR") {
          router.push("/livreur");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la connexion admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[var(--color-faso-gold)]/20 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Administration MarketFaso</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">Portail de supervision et gestion de la plateforme</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        {errorMsg && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            E-mail administrateur
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="admin@marketfaso.bf"
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
          className="w-full py-3 bg-[var(--color-ink)] hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Connexion..." : "Accéder au Panel Admin"}
          <ArrowRight size={16} />
        </button>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-mono text-center">
          Démo Admin: admin@marketfaso.bf / AdminPassword2026!
        </div>
      </form>
    </div>
  );
}
