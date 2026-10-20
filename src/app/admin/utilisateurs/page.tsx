"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck, ShieldAlert, CheckCircle2, XCircle, Search, Filter, RefreshCw } from "lucide-react";

export default function AdminUtilisateursPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const router = useRouter();

  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUtilisateurs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/utilisateurs");
      const data = await res.json();
      if (data.success) {
        setUtilisateurs(data.data || []);
      } else {
        setErrorMsg(data.error || "Impossible de charger les utilisateurs.");
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
      fetchUtilisateurs();
    }
  }, [status, session]);

  const handleUpdateStatus = async (utilisateurId: string, nouveauStatut: string) => {
    setUpdatingId(utilisateurId);
    setMessage("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateurId, nouveauStatut })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de modifier le statut.");
      }

      setMessage(`Statut mis à jour avec succès (${nouveauStatut})`);
      fetchUtilisateurs();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUtilisateurs = utilisateurs.filter((u) => {
    const matchSearch =
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.telephone.includes(search);

    const matchRole = roleFilter === "TOUS" || u.role === roleFilter;
    const matchStatut = statutFilter === "TOUS" || u.statut === statutFilter;

    return matchSearch && matchRole && matchStatut;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
      >
        <ArrowLeft size={16} /> Retour au tableau de bord Admin
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Validation & Gestion des Utilisateurs</h1>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Supervisez les comptes vendeurs, livreurs et administrateurs
          </p>
        </div>

        <button
          onClick={fetchUtilisateurs}
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
        <div className="p-3 bg-red-100 text-red-800 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou tél..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          >
            <option value="TOUS">Tous les rôles</option>
            <option value="LIVREUR">Livreurs</option>
            <option value="VENDEUR">Vendeurs</option>
            <option value="ADMINISTRATEUR">Administrateurs</option>
          </select>
        </div>

        <div>
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">EN ATTENTE (À valider)</option>
            <option value="ACTIF">ACTIF</option>
            <option value="SUSPENDU">SUSPENDU</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-ink-soft)]">
          Chargement de la liste...
        </div>
      ) : filteredUtilisateurs.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-ink-soft)]">
          Aucun utilisateur ne correspond aux critères.
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date Inscription</th>
                  <th className="py-3 px-4 text-right">Actions de Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-xs">
                {filteredUtilisateurs.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--color-ink)]">
                        {user.prenom} {user.nom}
                      </div>
                      {user.livreur && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          Zone: {user.livreur.zoneExecution} ({user.livreur.typeVehicule})
                        </div>
                      )}
                      {user.vendeur && (
                        <div className="text-[10px] text-[var(--color-faso-green)] font-semibold">
                          Boutique: {user.vendeur.nomBoutique}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-gray-700">{user.email}</div>
                      <div className="font-mono text-gray-500 text-[11px]">{user.telephone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        user.role === "ADMINISTRATEUR" ? "bg-purple-100 text-purple-800" :
                        user.role === "LIVREUR" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.statut === "ACTIF" ? "bg-green-100 text-green-800" :
                        user.statut === "EN_ATTENTE" ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {user.statut}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(user.dateCreation).toLocaleDateString("fr-FR")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {user.statut === "EN_ATTENTE" ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, "ACTIF")}
                          disabled={updatingId === user.id}
                          className="px-3 py-1.5 bg-[var(--color-faso-green)] hover:bg-[#008030] text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <UserCheck size={14} /> Valider / Activer
                        </button>
                      ) : user.statut === "ACTIF" ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, "SUSPENDU")}
                          disabled={updatingId === user.id || user.role === "ADMINISTRATEUR"}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] rounded-lg transition-colors ml-auto disabled:opacity-30"
                        >
                          Suspendre
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(user.id, "ACTIF")}
                          disabled={updatingId === user.id}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] rounded-lg transition-colors ml-auto"
                        >
                          Réactiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
