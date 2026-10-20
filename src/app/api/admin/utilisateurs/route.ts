import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      orderBy: { dateCreation: "desc" },
      select: {
        id: true,
        email: true,
        telephone: true,
        nom: true,
        prenom: true,
        role: true,
        statut: true,
        dateCreation: true,
        vendeur: true,
        livreur: true
      }
    });

    return NextResponse.json({ success: true, data: utilisateurs });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const body = await req.json();
    const { utilisateurId, nouveauStatut } = body;

    if (!utilisateurId || !nouveauStatut) {
      return NextResponse.json({ success: false, error: "ID utilisateur et statut requis." }, { status: 400 });
    }

    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { statut: nouveauStatut }
    });

    return NextResponse.json({ success: true, data: utilisateurMisAJour });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
  }
}
