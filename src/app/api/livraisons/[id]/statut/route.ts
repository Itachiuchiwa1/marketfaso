import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { nouveauStatut } = body;

    if (!nouveauStatut) {
      return NextResponse.json({ success: false, error: "Le nouveau statut est requis." }, { status: 400 });
    }

    const livraison = await prisma.livraison.findUnique({
      where: { id },
      include: { commande: true }
    });

    if (!livraison) {
      return NextResponse.json({ success: false, error: "Livraison introuvable." }, { status: 404 });
    }

    // Map delivery status to order status mirror
    let statutCommandeMiroir: any = livraison.commande.statut;
    if (nouveauStatut === "EN_PREPARATION") statutCommandeMiroir = "EN_PREPARATION";
    if (nouveauStatut === "EN_COURS") statutCommandeMiroir = "EN_LIVRAISON";
    if (nouveauStatut === "LIVREE") statutCommandeMiroir = "LIVREE";
    if (nouveauStatut === "ANNULEE") statutCommandeMiroir = "ANNULEE";

    const [livraisonMaj] = await prisma.$transaction([
      prisma.livraison.update({
        where: { id },
        data: { statut: nouveauStatut },
        include: { commande: true, livreur: { include: { utilisateur: true } } }
      }),
      prisma.commande.update({
        where: { id: livraison.commandeId },
        data: { statut: statutCommandeMiroir }
      })
    ]);

    return NextResponse.json({ success: true, data: livraisonMaj });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
  }
}
