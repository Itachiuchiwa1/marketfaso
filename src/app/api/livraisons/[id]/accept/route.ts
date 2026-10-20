import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "LIVREUR") {
      return NextResponse.json({ success: false, error: "Seul un livreur connecté peut accepter une livraison." }, { status: 403 });
    }

    const statutCompte = (session.user as any).statut;
    if (statutCompte !== "ACTIF") {
      return NextResponse.json({ success: false, error: "Votre compte livreur est en attente de validation par un administrateur." }, { status: 403 });
    }

    const livreurId = (session.user as any).livreurId;
    const { id } = await params;

    // ATOMIC TRANSACTION: Check livreurId === null before assign to prevent double accept race conditions
    const resultat = await prisma.$transaction(async (tx) => {
      const livraisonExistante = await tx.livraison.findUnique({
        where: { id }
      });

      if (!livraisonExistante) {
        throw new Error("Livraison non trouvée");
      }

      if (livraisonExistante.livreurId !== null) {
        throw new Error("Cette livraison a déjà été acceptée par un autre livreur.");
      }

      const livraisonAttribuee = await tx.livraison.update({
        where: { id },
        data: {
          livreurId: livreurId,
          statut: "ACCEPTEE"
        },
        include: {
          commande: true
        }
      });

      // Update mirror order status to EN_PREPARATION if needed
      await tx.commande.update({
        where: { id: livraisonAttribuee.commandeId },
        data: { statut: "EN_PREPARATION" }
      });

      return livraisonAttribuee;
    });

    return NextResponse.json({ success: true, message: "Livraison attribuée avec succès !", data: resultat });
  } catch (error: any) {
    console.error("Error accepting delivery:", error);
    return NextResponse.json({ success: false, error: error.message || "Impossible d'accepter cette livraison" }, { status: 400 });
  }
}
