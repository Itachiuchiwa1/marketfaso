import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, telephone, motDePasse, nomBoutique, description, ville, adresse, secteur, telephonePro } = body;

    if (!nom || !prenom || !email || !telephone || !motDePasse || !nomBoutique) {
      return NextResponse.json({ success: false, error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    const emailExiste = await prisma.utilisateur.findUnique({ where: { email: email.trim() } });
    if (emailExiste) {
      return NextResponse.json({ success: false, error: "Cet e-mail est déjà utilisé." }, { status: 400 });
    }

    const telExiste = await prisma.utilisateur.findUnique({ where: { telephone: telephone.trim() } });
    if (telExiste) {
      return NextResponse.json({ success: false, error: "Ce numéro de téléphone est déjà enregistré." }, { status: 400 });
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone.trim(),
        motDePasseHash,
        role: "VENDEUR",
        statut: "ACTIF", // Sellers active by default
        vendeur: {
          create: {
            nomBoutique: nomBoutique.trim(),
            description: description ? description.trim() : null,
            ville: ville ? ville.trim() : "Ouagadougou",
            adresse: adresse ? adresse.trim() : null,
            secteur: secteur ? secteur.trim() : null,
            telephonePro: telephonePro ? telephonePro.trim() : null
          }
        }
      },
      include: { vendeur: true }
    });

    return NextResponse.json({ success: true, message: "Compte vendeur créé avec succès !", data: { id: utilisateur.id, email: utilisateur.email } }, { status: 201 });
  } catch (error) {
    console.error("Error registering seller:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'inscription vendeur" }, { status: 500 });
  }
}
