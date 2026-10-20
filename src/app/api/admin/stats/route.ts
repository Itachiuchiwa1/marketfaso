import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode") || "tout"; // jour, semaine, mois, tout

    let dateDebut: Date | undefined;
    const maintenant = new Date();

    if (periode === "jour") {
      dateDebut = new Date(maintenant.setHours(0, 0, 0, 0));
    } else if (periode === "semaine") {
      dateDebut = new Date(maintenant.setDate(maintenant.getDate() - 7));
    } else if (periode === "mois") {
      dateDebut = new Date(maintenant.setMonth(maintenant.getMonth() - 1));
    }

    const dateFilter = dateDebut ? { gte: dateDebut } : undefined;

    // Aggregations
    const totalCommandes = await prisma.commande.count({
      where: dateFilter ? { dateCreation: dateFilter } : undefined
    });

    const ventesTotales = await prisma.commande.aggregate({
      where: {
        statut: { in: ["PAYEE", "EN_PREPARATION", "PRETE_A_LIVRER", "EN_LIVRAISON", "LIVREE"] },
        ...(dateFilter && { dateCreation: dateFilter })
      },
      _sum: { montantTotal: true }
    });

    const totalVendeurs = await prisma.vendeur.count();
    const totalLivreursActifs = await prisma.livreur.count({
      where: { utilisateur: { statut: "ACTIF" } }
    });
    const totalLivreursEnAttente = await prisma.livreur.count({
      where: { utilisateur: { statut: "EN_ATTENTE" } }
    });

    const livraisonsStats = await prisma.livraison.groupBy({
      by: ["statut"],
      _count: { statut: true }
    });

    const commandesStats = await prisma.commande.groupBy({
      by: ["statut"],
      _count: { statut: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        periode,
        totalCommandes,
        chiffreAffairesFCFA: ventesTotales._sum.montantTotal || 0,
        totalVendeurs,
        totalLivreursActifs,
        totalLivreursEnAttente,
        commandesParStatut: commandesStats,
        livraisonsParStatut: livraisonsStats
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur stats" }, { status: 500 });
  }
}
