import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Connexion requise." }, { status: 401 });
    }

    const role = (session.user as any).role;
    const livreurId = (session.user as any).livreurId;
    const { searchParams } = new URL(req.url);
    const filtre = searchParams.get("filtre") || "disponibles"; // disponibles, mes_livraisons, toutes

    let where: any = {};

    if (role === "LIVREUR") {
      if (filtre === "disponibles") {
        where = {
          livreurId: null,
          statut: { in: ["EN_ATTENTE", "PRETE_A_LIVRER"] }
        };
      } else {
        where = {
          livreurId: livreurId
        };
      }
    }

    const livraisons = await prisma.livraison.findMany({
      where,
      orderBy: { dateCreation: "desc" },
      include: {
        commande: {
          include: {
            lignes: {
              include: {
                produit: { select: { nom: true, prix: true, photos: { where: { estPrincipale: true } } } }
              }
            }
          }
        },
        livreur: {
          include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } }
        }
      }
    });

    return NextResponse.json({ success: true, data: livraisons });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération des livraisons" }, { status: 500 });
  }
}
