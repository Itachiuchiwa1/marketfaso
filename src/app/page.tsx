export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Truck, ShieldCheck, ArrowRight, Star, Sparkles, Store, MapPin, Zap } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

async function getHomeData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const [resCat, resProd] = await Promise.all([
      fetch(`${baseUrl}/api/categories`, { cache: "no-store" }).then(r => r.json()),
      fetch(`${baseUrl}/api/produits`, { cache: "no-store" }).then(r => r.json())
    ]);

    return {
      categories: resCat.success ? resCat.data : [],
      produits: resProd.success ? resProd.data : []
    };
  } catch (e) {
    console.error("Home data fetch error", e);
    return { categories: [], produits: [] };
  }
}

export default async function HomePage() {
  const { categories, produits } = await getHomeData();
  const premierProduit = produits[0];
  const photoPremierProduit = premierProduit?.photos?.find((p: any) => p.estPrincipale)?.url || premierProduit?.photos?.[0]?.url || "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop";

  return (
    <div className="space-y-12 pb-12">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[var(--color-ink)] via-[#1f3328] to-[var(--color-ink)] text-white py-16 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-faso-green)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-faso-red)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[var(--color-faso-gold)] text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles size={14} />
              <span>N°1 du e-commerce & livraison au Burkina Faso</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Le commerce local à <span className="text-[var(--color-faso-gold)]">Ouagadougou</span>, <span className="text-[var(--color-faso-green)]">Bobo</span> & dans tout le pays.
            </h1>

            <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Commandez en quelques clics sans créer de compte obligatoire. Payez par <strong className="text-white">Mobile Money</strong> et recevez vos colis livrés par moto en toute sécurité.
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/produits"
                className="w-full sm:w-auto px-6 py-3.5 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Découvrir les annonces</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/vendeur/inscription"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Store size={18} />
                <span>Devenir Vendeur</span>
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--color-faso-gold)]">100%</div>
                <div className="text-xs text-gray-400">Paiement local Mobile Money</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--color-faso-green)]">&lt; 2h</div>
                <div className="text-xs text-gray-400">Livraison express en ville</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">0 FCFA</div>
                <div className="text-xs text-gray-400">Frais d'ouverture de compte</div>
              </div>
            </div>
          </div>

          {/* Dynamic Hero Visual Card */}
          {premierProduit ? (
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-gray-300">Offre vedette en direct</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-faso-green)] text-white font-bold">
                    Disponible
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden relative flex-shrink-0">
                    <Image
                      src={photoPremierProduit}
                      alt={premierProduit.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{premierProduit.nom}</h3>
                    <div className="text-xs text-[var(--color-faso-gold)] font-bold">{formatFCFA(premierProduit.prix)}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {premierProduit.vendeur?.nomBoutique || "Boutique Vendeur"}
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded-xl space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Catégorie :</span>
                    <span className="font-semibold text-white">{premierProduit.categorie?.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock disponible :</span>
                    <span className="text-[var(--color-faso-green)] font-semibold">{premierProduit.stock} unités</span>
                  </div>
                </div>

                <Link
                  href={`/produits/${premierProduit.id}`}
                  className="block text-center text-xs font-semibold text-[var(--color-faso-gold)] hover:underline"
                >
                  Voir la fiche produit détaillée &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-gray-300">Réseau MarketFaso</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-faso-green)] text-white font-bold">
                    En direct
                  </span>
                </div>
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl">
                    <span>Villes couvertes</span>
                    <strong className="text-white">Ouaga, Bobo, Koudougou...</strong>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl">
                    <span>Paiements supportés</span>
                    <strong className="text-[var(--color-faso-gold)]">Orange Money & Moov Money</strong>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl">
                    <span>Catégories en ligne</span>
                    <strong className="text-[var(--color-faso-green)]">{categories.length} catégories prêtes</strong>
                  </div>
                </div>
                <Link
                  href="/vendeur/inscription"
                  className="block text-center text-xs font-bold text-[var(--color-faso-gold)] hover:underline pt-1"
                >
                  Ouvrir ma boutique vendeur &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
              Explorez par catégorie
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-ink-soft)]">
              Des milliers d'articles disponibles chez des vendeurs vérifiés
            </p>
          </div>
          <Link
            href="/produits"
            className="text-xs sm:text-sm font-semibold text-[var(--color-faso-green)] hover:underline flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/produits?categorie=${cat.slug}`}
              className="bg-white p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-faso-green)] hover:shadow-md transition-all group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-faso-green)] group-hover:bg-[var(--color-faso-green)] group-hover:text-white transition-colors mb-2">
                <Zap size={22} />
              </div>
              <h3 className="font-semibold text-xs text-[var(--color-ink)] group-hover:text-[var(--color-faso-green)] transition-colors line-clamp-1">
                {cat.nom}
              </h3>
              <span className="text-[11px] text-[var(--color-ink-soft)] mt-0.5">
                {cat._count?.produits || 0} offre{cat._count?.produits > 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-faso-red)] uppercase tracking-wider mb-1">
              <Sparkles size={13} /> Offres récentes
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)]">
              Annonces en vedette au Burkina
            </h2>
          </div>
          <Link
            href="/produits"
            className="text-xs sm:text-sm font-semibold text-[var(--color-faso-green)] hover:underline flex items-center gap-1"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {produits.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-3">
            <ShoppingBag size={40} className="text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-[var(--color-ink)]">Le catalogue est prêt pour vos premières annonces</h3>
            <p className="text-xs text-[var(--color-ink-soft)] max-w-md mx-auto">
              Aucun produit n'a encore été mis en vente. Vous êtes commerçant ou vendeur au Burkina Faso ?
            </p>
            <Link
              href="/vendeur/inscription"
              className="inline-block px-4 py-2 bg-[var(--color-faso-green)] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#008030] transition-colors"
            >
              Publier le premier produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {produits.map((prod: any) => {
              const photoPrincipale = prod.photos?.find((p: any) => p.estPrincipale)?.url || prod.photos?.[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop";
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden block">
                    <Link href={`/produits/${prod.id}`} className="absolute inset-0 z-0">
                      <Image
                        src={photoPrincipale}
                        alt={prod.nom}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <span className="absolute top-2 left-2 bg-[var(--color-ink)]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs pointer-events-none z-10">
                      {prod.categorie?.nom}
                    </span>

                    {prod.vendeur && (
                      <Link
                        href={`/vendeurs/${prod.vendeur.id}`}
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-[var(--color-ink)] text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 hover:text-[var(--color-faso-green)] transition-colors z-10"
                      >
                        <MapPin size={11} className="text-[var(--color-faso-green)]" />
                        <span>{prod.vendeur.nomBoutique}</span>
                      </Link>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <Link href={`/produits/${prod.id}`}>
                        <h3 className="font-bold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-faso-red)] transition-colors line-clamp-2 leading-snug">
                          {prod.nom}
                        </h3>
                      </Link>
                      <p className="text-xs text-[var(--color-ink-soft)] line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[var(--color-ink-soft)]">Prix local</div>
                        <div className="text-base font-bold text-[var(--color-faso-green)]">
                          {formatFCFA(prod.prix)}
                        </div>
                      </div>

                      <Link
                        href={`/produits/${prod.id}`}
                        className="px-3 py-1.5 bg-[var(--color-faso-red)] hover:bg-[#d02430] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag size={14} />
                        <span>Acheter</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-white border-y border-[var(--color-border)] py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-[var(--color-ink)]">
              Comment fonctionne MarketFaso ?
            </h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Une plateforme pensée pour simplifier les achats et la logistique urbaine au Burkina Faso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-faso-red)] text-white font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-[var(--color-ink)]">Pour l'Acheteur</h3>
              <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">
                Choisissez vos articles, passez commande sans créer de compte. Payez avec votre compte Orange Money ou Moov Money. Suivez la livraison en direct.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-faso-green)] text-white font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-[var(--color-ink)]">Pour le Vendeur</h3>
              <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">
                Créez votre boutique gratuite, publiez vos produits avec photos et prix en FCFA. Recevez les commandes et confiez les colis aux livreurs certifiés.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-faso-gold)] text-[var(--color-ink)] font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-[var(--color-ink)]">Pour le Livreur</h3>
              <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">
                Acceptez les livraisons disponibles dans votre secteur en 1 clic. Récupérez les colis chez les commerçants et livrez les clients rapidement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
