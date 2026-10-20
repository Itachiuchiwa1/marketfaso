import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendeur = await prisma.vendeur.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { nom: true, prenom: true, email: true, telephone: true } },
        produits: {
          include: {
            categorie: { select: { nom: true, slug: true } },
            photos: { where: { estPrincipale: true } }
          },
          orderBy: { dateCreation: "desc" }
        }
      }
    });

    if (!vendeur) {
      return NextResponse.json({ success: false, error: "Boutique introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vendeur });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
