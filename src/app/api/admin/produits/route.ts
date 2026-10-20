import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const produits = await prisma.produit.findMany({
      orderBy: { dateCreation: "desc" },
      include: {
        categorie: { select: { id: true, nom: true, slug: true } },
        vendeur: {
          select: {
            id: true,
            nomBoutique: true,
            utilisateur: { select: { nom: true, prenom: true, email: true, telephone: true } }
          }
        },
        photos: { where: { estPrincipale: true } }
      }
    });

    return NextResponse.json({ success: true, data: produits });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération des produits" }, { status: 500 });
  }
}
