import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed database for MarketFaso...");

  // Clean existing data in reverse order
  await prisma.signalement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.avis.deleteMany();
  await prisma.livraison.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.ligneCommande.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.photoProduit.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.categorie.deleteMany();
  await prisma.livreur.deleteMany();
  await prisma.vendeur.deleteMany();
  await prisma.utilisateur.deleteMany();

  const passwordHash = await bcrypt.hash("Password2026!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword2026!", 10);

  // 1. Create Admin User
  const adminUser = await prisma.utilisateur.create({
    data: {
      email: "admin@marketfaso.bf",
      telephone: "+226 70 00 00 00",
      motDePasseHash: adminPasswordHash,
      nom: "Kaboré",
      prenom: "Adama",
      role: "ADMINISTRATEUR",
      statut: "ACTIF",
    },
  });
  console.log("✅ Admin account created:", adminUser.email);

  // 2. Create Categories
  const categoriesData = [
    { nom: "Véhicules", slug: "vehicules" },
    { nom: "Immobilier", slug: "immobilier" },
    { nom: "Téléphones & Tablettes", slug: "telephones-tablettes" },
    { nom: "Électroménager", slug: "electromenager" },
    { nom: "Mode & Beauté", slug: "mode-beaute" },
    { nom: "Agriculture & Élevage", slug: "agriculture-elevage" },
    { nom: "Maison & Bricolage", slug: "maison-bricolage" },
    { nom: "Services", slug: "services" },
    { nom: "Multimédia", slug: "multimedia" },
    { nom: "Sport & Loisirs", slug: "sport-loisirs" },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.categorie.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }
  console.log(`✅ ${categoriesData.length} categories created.`);

  // 3. Create Sellers
  const seller1User = await prisma.utilisateur.create({
    data: {
      email: "vendeur.ouaga@marketfaso.bf",
      telephone: "+226 76 11 22 33",
      motDePasseHash: passwordHash,
      nom: "Ouedraogo",
      prenom: "Moussa",
      role: "VENDEUR",
      statut: "ACTIF",
    },
  });

  const seller1 = await prisma.vendeur.create({
    data: {
      utilisateurId: seller1User.id,
      nomBoutique: "FasoTech Ouaga",
      description: "Spécialiste en téléphones mobiles, ordinateurs et solaire à Ouagadougou (Koulouba).",
    },
  });

  const seller2User = await prisma.utilisateur.create({
    data: {
      email: "vendeur.bobo@marketfaso.bf",
      telephone: "+226 78 44 55 66",
      motDePasseHash: passwordHash,
      nom: "Traoré",
      prenom: "Fatoumata",
      role: "VENDEUR",
      statut: "ACTIF",
    },
  });

  const seller2 = await prisma.vendeur.create({
    data: {
      utilisateurId: seller2User.id,
      nomBoutique: "Sahel Commerce Bobo",
      description: "Vente d'équipements électroménagers et kits solaires à Bobo-Dioulasso (Sya).",
    },
  });

  const seller3User = await prisma.utilisateur.create({
    data: {
      email: "vendeur.koudougou@marketfaso.bf",
      telephone: "+226 70 99 88 77",
      motDePasseHash: passwordHash,
      nom: "Zongo",
      prenom: "Salif",
      role: "VENDEUR",
      statut: "ACTIF",
    },
  });

  const seller3 = await prisma.vendeur.create({
    data: {
      utilisateurId: seller3User.id,
      nomBoutique: "Artisanat & Elevage Koudougou",
      description: "Produits locaux, artisanat textile Faso Dan Fani et équipements d'élevage.",
    },
  });

  console.log("✅ 3 sellers created.");

  // 4. Create Drivers
  const driver1User = await prisma.utilisateur.create({
    data: {
      email: "livreur.yacouba@marketfaso.bf",
      telephone: "+226 71 22 33 44",
      motDePasseHash: passwordHash,
      nom: "Sawadogo",
      prenom: "Yacouba",
      role: "LIVREUR",
      statut: "ACTIF",
    },
  });

  await prisma.livreur.create({
    data: {
      utilisateurId: driver1User.id,
      typeVehicule: "Moto Sanili 125cc",
      zone: "Ouagadougou",
    },
  });

  const driver2User = await prisma.utilisateur.create({
    data: {
      email: "livreur.boureima@marketfaso.bf",
      telephone: "+226 75 88 99 00",
      motDePasseHash: passwordHash,
      nom: "Compaoré",
      prenom: "Boureima",
      role: "LIVREUR",
      statut: "EN_ATTENTE", // Pending admin validation test
    },
  });

  await prisma.livreur.create({
    data: {
      utilisateurId: driver2User.id,
      typeVehicule: "Moto Rato 150cc",
      zone: "Bobo-Dioulasso",
    },
  });

  console.log("✅ 2 drivers created (1 ACTIF, 1 EN_ATTENTE).");

  // 5. Create Products with 1-5 photos
  const productsData = [
    {
      nom: "Samsung Galaxy S23 Ultra 256GB",
      description: "Smartphone Samsung Galaxy S23 Ultra en parfait état, écran Dynamic AMOLED 2X, double SIM, compatible Orange Money & Moov. Garanti 12 mois.",
      prix: 450000,
      stock: 5,
      categorieId: categoriesMap["telephones-tablettes"],
      vendeurId: seller1.id,
      photos: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Kit Solaire 200W Monocristallin + Régulateur MPPT",
      description: "Panneau solaire haute efficacité idéal pour domicile et commerce à Ouagadougou. Résistant aux fortes chaleurs et poussières du Sahel.",
      prix: 125000,
      stock: 12,
      categorieId: categoriesMap["maison-bricolage"],
      vendeurId: seller2.id,
      photos: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Moto Scooter Rato 125cc Neuve",
      description: "Moto neuve 0 km, consommation économique (2.2L/100km), carte grise et plaque incluses. Idéale pour les coursier et déplacements urbains.",
      prix: 650000,
      stock: 3,
      categorieId: categoriesMap["vehicules"],
      vendeurId: seller1.id,
      photos: [
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Tissu Faso Dan Fani Authentique (Complet 3 Pagnes)",
      description: "Pagne tissé traditionnel fait main à Koudougou. Coton bio 100% burkinabé, motifs royaux culturels pour cérémonies et mariages.",
      prix: 35000,
      stock: 20,
      categorieId: categoriesMap["mode-beaute"],
      vendeurId: seller3.id,
      photos: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Réfrigérateur Solaire Smart 180 Litres A++",
      description: "Réfrigérateur basse consommation fonctionnant directement sur batterie 12V/24V ou secteur. Garde la fraîcheur jusqu'à 24h sans électricité.",
      prix: 285000,
      stock: 4,
      categorieId: categoriesMap["electromenager"],
      vendeurId: seller2.id,
      photos: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Motopompe Agricole essence 3 Pouces",
      description: "Motopompe robuste pour irrigation maraîchère le long du fleuve Mouhoun et bassins de rétention. Débit 60m3/heure.",
      prix: 145000,
      stock: 8,
      categorieId: categoriesMap["agriculture-elevage"],
      vendeurId: seller3.id,
      photos: [
        "https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?w=800&auto=format&fit=crop"
      ]
    },
    {
      nom: "Ordinateur Portable HP Pavilion i5 16GB RAM 512GB SSD",
      description: "PC portable HP très rapide pour étudiants et professionnels. Clavier AZERTY avec pavé numérique, autonomie batterie 7h.",
      prix: 320000,
      stock: 6,
      categorieId: categoriesMap["multimedia"],
      vendeurId: seller1.id,
      photos: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop"
      ]
    }
  ];

  for (const prodData of productsData) {
    const { photos, ...pInfo } = prodData;
    const prod = await prisma.produit.create({
      data: pInfo
    });

    for (let i = 0; i < photos.length; i++) {
      await prisma.photoProduit.create({
        data: {
          produitId: prod.id,
          url: photos[i],
          estPrincipale: i === 0,
          ordre: i
        }
      });
    }
  }

  console.log(`✅ ${productsData.length} products created with images.`);

  // 6. Create a Demo Order + Delivery
  const firstProduct = await prisma.produit.findFirst();
  if (firstProduct) {
    const commande = await prisma.commande.create({
      data: {
        numero: "MF-2026-88412",
        nomAcheteur: "Wendyam Ouedraogo",
        telephoneAcheteur: "+226 70 12 34 56",
        adresseLivraison: "Quartier Zone 1, près de la pharmacie de la Paix, Ouagadougou",
        montantTotal: firstProduct.prix + 1500, // Product + Delivery fee
        statut: "PRETE_A_LIVRER",
        lignes: {
          create: [
            {
              produitId: firstProduct.id,
              quantite: 1,
              prixUnitaire: firstProduct.prix,
            }
          ]
        },
        paiement: {
          create: {
            montant: firstProduct.prix + 1500,
            moyenPaiement: "ORANGE_MONEY",
            referenceTransaction: "OM-20260923-9912",
            statut: "CONFIRME"
          }
        },
        livraison: {
          create: {
            adresseDepart: "Koulouba, Boutique FasoTech",
            adresseDestination: "Quartier Zone 1, Ouagadougou",
            statut: "EN_ATTENTE",
            distance: 4.5
          }
        }
      }
    });
    console.log("✅ Demo Order created:", commande.numero);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
