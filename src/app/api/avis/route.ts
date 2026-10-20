import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { note, commentaire, produitId, commandeId } = body;

    if (!note || note < 1 || note > 5) {
      return NextResponse.json({ success: false, error: "Veuillez attribuer une note entre 1 et 5 étoiles." }, { status: 400 });
    }

    if (!produitId && !commandeId) {
      return NextResponse.json({ success: false, error: "L'avis doit concerner un produit ou une commande." }, { status: 400 });
    }

    const avis = await prisma.avis.create({
      data: {
        note: parseInt(note),
        commentaire: commentaire ? commentaire.trim() : null,
        produitId: produitId || null,
        commandeId: commandeId || null
      }
    });

    return NextResponse.json({ success: true, message: "Merci pour votre avis !", data: avis }, { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement de l'avis" }, { status: 500 });
  }
}
