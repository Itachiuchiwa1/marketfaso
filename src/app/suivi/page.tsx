"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Truck, ArrowRight } from "lucide-react";

export default function SuiviLookupPage() {
  const router = useRouter();
  const [numero, setNumero] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) return;
    router.push(`/suivi/${numero.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-center">
      <div className="w-16 h-16 bg-[var(--color-faso-green)]/10 text-[var(--color-faso-green)] rounded-2xl flex items-center justify-center mx-auto">
        <Truck size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Suivi de commande MarketFaso</h1>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Entrez votre numéro de commande unique (ex: <strong className="text-[var(--color-ink)]">MF-2026-88412</strong>) pour suivre l'état de votre livraison en temps réel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ex: MF-2026-88412"
            className="w-full pl-9 pr-3 py-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-mono uppercase focus:outline-none focus:border-[var(--color-faso-green)]"
          />
          <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>Consulter le statut de ma commande</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
