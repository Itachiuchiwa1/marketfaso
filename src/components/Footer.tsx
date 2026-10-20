import Link from "next/link";
import { Shield, Truck, Smartphone, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ink)] text-white mt-16 border-t-4 border-[var(--color-faso-red)]">
      {/* Guarantees bar */}
      <div className="border-b border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-faso-gold)]">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Paiement Mobile Money Sécurisé</h4>
              <p className="text-xs text-gray-400">Orange Money & Moov Money vérifiés par API</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-faso-green)]">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Livraison Rapide par Moto</h4>
              <p className="text-xs text-gray-400">À Ouagadougou, Bobo & principales villes</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-faso-red)]">
              <Smartphone size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Achat sans compte obligatoire</h4>
              <p className="text-xs text-gray-400">Suivi instantané par numéro de commande</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-faso-red)] flex items-center justify-center font-bold text-white text-base">
              MF
            </div>
            <span className="font-bold text-xl text-white">MarketFaso</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Plateforme burkinabé de mise en relation directe entre acheteurs, vendeurs locaux et coursier-livreurs indépendants.
          </p>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--color-faso-green)]" />
              <span>Ouagadougou, Burkina Faso</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[var(--color-faso-green)]" />
              <span>+226 70 00 00 00</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[var(--color-faso-green)]" />
              <span>contact@marketfaso.bf</span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-[var(--color-faso-gold)]">
            Catégories Clés
          </h5>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/produits?categorie=telephones-tablettes" className="hover:text-white transition-colors">Téléphones & Tablettes</Link></li>
            <li><Link href="/produits?categorie=maison-bricolage" className="hover:text-white transition-colors">Solaire & Énergie</Link></li>
            <li><Link href="/produits?categorie=vehicules" className="hover:text-white transition-colors">Motos & Scooters</Link></li>
            <li><Link href="/produits?categorie=electromenager" className="hover:text-white transition-colors">Électroménager</Link></li>
            <li><Link href="/produits?categorie=mode-beaute" className="hover:text-white transition-colors">Textiles & Faso Dan Fani</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-[var(--color-faso-gold)]">
            Espaces Partenaires
          </h5>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/vendeur/connexion" className="hover:text-white transition-colors">Se connecter comme Vendeur</Link></li>
            <li><Link href="/vendeur/inscription" className="hover:text-white transition-colors">Ouvrir une boutique vendeur</Link></li>
            <li><Link href="/livreur/connexion" className="hover:text-white transition-colors">Se connecter comme Livreur</Link></li>
            <li><Link href="/livreur/inscription" className="hover:text-white transition-colors">Devenir livreur partenaire</Link></li>
            <li><Link href="/admin/connexion" className="hover:text-white transition-colors">Portail Administrateur</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-sm text-white mb-4 uppercase tracking-wider text-[var(--color-faso-gold)]">
            Villes Desservies
          </h5>
          <div className="flex flex-wrap gap-1.5 text-xs text-gray-400">
            <span className="bg-gray-800 px-2 py-1 rounded">Ouagadougou</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Bobo-Dioulasso</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Koudougou</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Ouahigouya</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Banfora</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Kaya</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Fada N&apos;Gourma</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <span className="text-xs text-gray-400 block mb-2">Moyens de paiement acceptés :</span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-orange-600 text-white px-2 py-1 rounded">Orange Money</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded">Moov Money</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/40 py-4 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 MarketFaso v1.0. Tous droits réservés. Produit conçu pour le Burkina Faso.</span>
          <span className="text-gray-600">Projet académique & professionnel complet</span>
        </div>
      </div>
    </footer>
  );
}
