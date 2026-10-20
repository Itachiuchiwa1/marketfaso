"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Search, MapPin, User, Menu, X, Truck, Store, ShieldCheck, LogOut, ExternalLink, ArrowRight } from "lucide-react";
import { getCart } from "@/lib/cart";

export default function Navbar() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status;
  const pathname = usePathname();

  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Ouagadougou");

  useEffect(() => {
    const updateCount = () => {
      const items = getCart();
      const total = items.reduce((sum, item) => sum + item.quantite, 0);
      setCartCount(total);
    };

    updateCount();
    window.addEventListener("marketfaso_cart_updated", updateCount);
    return () => window.removeEventListener("marketfaso_cart_updated", updateCount);
  }, []);

  const role = (session?.user as any)?.role;
  const dashboardLink =
    role === "ADMINISTRATEUR" ? "/admin" :
    role === "VENDEUR" ? "/vendeur" :
    role === "LIVREUR" ? "/livreur" : null;

  const dashboardLabel =
    role === "ADMINISTRATEUR" ? "Administration" :
    role === "VENDEUR" ? "Ma Boutique" :
    role === "LIVREUR" ? "Espace Livreur" : "Mon Dashboard";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-[var(--color-ink)] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-faso-green)] animate-pulse"></span>
            <span>MarketFaso — Plateforme nationale de commerce & livraison au Burkina Faso</span>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-gray-300">
            {session?.user ? (
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[var(--color-faso-gold)] font-semibold flex items-center gap-1">
                  <User size={13} /> {session.user.name} ({role})
                </span>
                <span className="text-gray-600">|</span>
                {dashboardLink && (
                  <Link href={dashboardLink} className="hover:text-white font-bold flex items-center gap-1 text-[var(--color-faso-green)]">
                    Mon Tableau de bord
                  </Link>
                )}
                <span className="text-gray-600">|</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-red-400 flex items-center gap-1 text-red-300"
                >
                  <LogOut size={13} /> Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link href="/suivi" className="hover:text-white flex items-center gap-1">
                  <Truck size={13} /> Suivre ma commande
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/vendeur/connexion" className="hover:text-white flex items-center gap-1">
                  <Store size={13} /> Espace Vendeur
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/livreur/connexion" className="hover:text-white flex items-center gap-1">
                  <Truck size={13} /> Espace Livreur
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/admin/connexion" className="hover:text-white flex items-center gap-1 text-[var(--color-faso-gold)]">
                  <ShieldCheck size={13} /> Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-faso-red)] flex items-center justify-center font-bold text-white text-lg shadow-sm">
            MF
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-faso-red)] transition-colors">
              Market<span className="text-[var(--color-faso-red)]">Faso</span>
            </span>
            <span className="text-[10px] text-[var(--color-ink-soft)] font-medium -mt-1">
              Achetez, Vendez & Livrez
            </span>
          </div>
        </Link>

        {/* Search & Location Bar */}
        <form action="/produits" method="GET" className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
          <div className="relative flex items-center w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus-within:border-[var(--color-faso-green)] focus-within:ring-1 focus-within:ring-[var(--color-faso-green)]">
            <div className="flex items-center gap-1 px-3 text-xs text-[var(--color-ink-soft)] border-r border-[var(--color-border)] py-2">
              <MapPin size={14} className="text-[var(--color-faso-green)]" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent focus:outline-none font-medium text-[var(--color-ink)] cursor-pointer"
              >
                <option value="Ouagadougou">Ouagadougou</option>
                <option value="Bobo-Dioulasso">Bobo-Dioulasso</option>
                <option value="Koudougou">Koudougou</option>
                <option value="Ouahigouya">Ouahigouya</option>
                <option value="Banfora">Banfora</option>
              </select>
            </div>

            <input
              type="text"
              name="q"
              placeholder="Rechercher un produit (solaire, téléphone, moto, pagne...)"
              className="w-full bg-transparent px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none"
            />

            <button
              type="submit"
              className="p-2 mr-1 rounded-md text-white bg-[var(--color-faso-green)] hover:bg-[#008030] transition-colors"
              title="Rechercher"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/panier"
            className={`relative p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
              pathname === "/panier"
                ? "border-[var(--color-faso-green)] bg-green-50 text-[var(--color-faso-green)]"
                : "border-[var(--color-border)] hover:bg-gray-50 text-[var(--color-ink)]"
            }`}
          >
            <ShoppingBag size={20} />
            <span className="hidden sm:inline text-xs font-semibold">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-faso-red)] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Portal or Dashboard Link */}
          <div className="hidden sm:flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2">
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-[var(--color-faso-green)] hover:bg-[#008030] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{dashboardLabel}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-2.5 py-2 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-red-100"
                  title="Se déconnecter"
                >
                  <LogOut size={15} />
                  <span className="hidden md:inline">Sortir</span>
                </button>
              </div>
            ) : (
              <Link
                href="/vendeur/connexion"
                className="px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <User size={15} />
                <span>Espace Pros</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[var(--color-ink)] rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--color-border)] px-4 py-4 space-y-4 shadow-lg">
          <form action="/produits" method="GET" className="w-full">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher sur MarketFaso..."
                className="w-full bg-transparent text-sm text-[var(--color-ink)] focus:outline-none"
              />
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/produits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-gray-50 rounded-lg text-center text-[var(--color-ink)]"
            >
              Tous les produits
            </Link>

            {dashboardLink ? (
              <Link
                href={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-green-50 text-[var(--color-faso-green)] font-bold rounded-lg text-center"
              >
                {dashboardLabel}
              </Link>
            ) : (
              <Link
                href="/vendeur/connexion"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-gray-50 rounded-lg text-center text-[var(--color-ink)]"
              >
                Espace Vendeur
              </Link>
            )}

            <Link
              href="/suivi"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-gray-50 rounded-lg text-center text-[var(--color-ink)]"
            >
              Suivre commande
            </Link>

            {session?.user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-center font-bold col-span-2"
              >
                Déconnexion ({session.user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
