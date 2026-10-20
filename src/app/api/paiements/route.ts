import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commandeId, moyenPaiement, telephonePaiement } = body;

    if (!commandeId || !moyenPaiement) {
      return NextResponse.json({ success: false, error: "Commande et moyen de paiement requis." }, { status: 400 });
    }

    const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
    if (!commande) {
      return NextResponse.json({ success: false, error: "Commande introuvable" }, { status: 404 });
    }

    // Generate reference transaction
    const prefix = moyenPaiement === "ORANGE_MONEY" ? "OM" : "MOOV";
    const ref = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Upsert paiement record
    const paiement = await prisma.paiement.upsert({
      where: { commandeId },
      update: {
        moyenPaiement,
        montant: commande.montantTotal,
        referenceTransaction: ref,
        statut: "EN_ATTENTE"
      },
      create: {
        commandeId,
        moyenPaiement,
        montant: commande.montantTotal,
        referenceTransaction: ref,
        statut: "EN_ATTENTE"
      }
    });

    // Simulate instant success or push notification for demo
    return NextResponse.json({
      success: true,
      message: `Demande de paiement ${moyenPaiement} envoyée au ${telephonePaiement || commande.telephoneAcheteur}.`,
      data: {
        paiementId: paiement.id,
        referenceTransaction: ref,
        moyenPaiement,
        montantTotal: commande.montantTotal,
        numeroCommande: commande.numero
      }
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'initiation du paiement" }, { status: 500 });
  }
}
