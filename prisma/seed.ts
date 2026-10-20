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
  console.log("🌱 Cleaning database and running minimal clean seed for MarketFaso...");

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

  const adminPasswordHash = await bcrypt.hash("AdminPassword2026!", 10);

  // 1. Create System Admin User
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
  console.log("✅ System Admin account created:", adminUser.email);

  // 2. Create System Categories
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

  for (const cat of categoriesData) {
    await prisma.categorie.create({ data: cat });
  }
  console.log(`✅ ${categoriesData.length} system categories initialized.`);

  console.log("🎉 Database initialized cleanly without fake demo data!");
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
