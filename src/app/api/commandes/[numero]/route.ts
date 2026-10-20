import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ numero: string }> }) {
  try {
    const { numero } = await params;
    const commande = await prisma.commande.findFirst({
      where: {
        OR: [
          { numero: numero.trim() },
          { id: numero.trim() }
        ]
      },
      include: {
        lignes: {
          include: {
            produit: {
              include: {
                photos: { where: { estPrincipale: true } },
                vendeur: { include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } } }
              }
            }
          }
        },
        paiement: true,
        livraison: {
          include: {
            livreur: {
              include: { utilisateur: { select: { nom: true, prenom: true, telephone: true } } }
            }
          }
        }
      }
    });

    if (!commande) {
      return NextResponse.json({ success: false, error: "Commande non trouvée. Vérifiez le numéro de suivi." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: commande });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la recherche de la commande" }, { status: 500 });
  }
}
