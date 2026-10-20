import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceTransaction, commandeId, statutPaiement } = body;

    let paiement = null;

    if (referenceTransaction) {
      paiement = await prisma.paiement.findFirst({ where: { referenceTransaction } });
    } else if (commandeId) {
      paiement = await prisma.paiement.findUnique({ where: { commandeId } });
    }

    if (!paiement) {
      return NextResponse.json({ success: false, error: "Paiement non trouvé" }, { status: 404 });
    }

    const nouveauStatutPaiement = statutPaiement === "ECHOUE" ? "ECHOUE" : "CONFIRME";

    await prisma.$transaction([
      prisma.paiement.update({
        where: { id: paiement.id },
        data: { statut: nouveauStatutPaiement }
      }),
      prisma.commande.update({
        where: { id: paiement.commandeId },
        data: {
          statut: nouveauStatutPaiement === "CONFIRME" ? "PAYEE" : "EN_ATTENTE_PAIEMENT"
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Webhook de paiement traité avec succès" });
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    return NextResponse.json({ success: false, error: "Erreur webhook" }, { status: 500 });
  }
}
