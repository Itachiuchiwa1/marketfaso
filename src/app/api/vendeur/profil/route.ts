import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "VENDEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux vendeurs connectés." }, { status: 401 });
    }

    const vendeurId = (session.user as any).vendeurId;
    const vendeur = await prisma.vendeur.findUnique({
      where: { id: vendeurId },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true
          }
        }
      }
    });

    if (!vendeur) {
      return NextResponse.json({ success: false, error: "Boutique introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vendeur });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "VENDEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux vendeurs connectés." }, { status: 401 });
    }

    const vendeurId = (session.user as any).vendeurId;
    const body = await req.json();
    const { nomBoutique, description, ville, secteur, adresse, telephonePro } = body;

    if (!nomBoutique || !nomBoutique.trim()) {
      return NextResponse.json({ success: false, error: "Le nom de la boutique est obligatoire." }, { status: 400 });
    }

    const vendeurMaj = await prisma.vendeur.update({
      where: { id: vendeurId },
      data: {
        nomBoutique: nomBoutique.trim(),
        description: description ? description.trim() : null,
        ville: ville ? ville.trim() : "Ouagadougou",
        secteur: secteur ? secteur.trim() : null,
        adresse: adresse ? adresse.trim() : null,
        telephonePro: telephonePro ? telephonePro.trim() : null
      },
      include: {
        utilisateur: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Informations de la boutique mises à jour avec succès !",
      data: vendeurMaj
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour de la boutique" }, { status: 500 });
  }
}
