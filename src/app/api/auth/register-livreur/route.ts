import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, telephone, motDePasse, typeVehicule, zone } = body;

    if (!nom || !prenom || !email || !telephone || !motDePasse || !typeVehicule || !zone) {
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
        role: "LIVREUR",
        statut: "EN_ATTENTE", // STRICT BUSINESS RULE: Pending admin approval
        livreur: {
          create: {
            typeVehicule: typeVehicule.trim(),
            zone: zone.trim()
          }
        }
      },
      include: { livreur: true }
    });

    return NextResponse.json({
      success: true,
      message: "Inscription enregistrée. Votre compte livreur est actuellement EN_ATTENTE de validation par l'administration MarketFaso.",
      data: { id: utilisateur.id, email: utilisateur.email, statut: utilisateur.statut }
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering driver:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'inscription livreur" }, { status: 500 });
  }
}
