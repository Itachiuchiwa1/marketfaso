import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produit = await prisma.produit.findUnique({
      where: { id },
      include: {
        categorie: true,
        vendeur: {
          include: {
            utilisateur: {
              select: { nom: true, prenom: true, email: true, telephone: true }
            }
          }
        },
        photos: {
          orderBy: { ordre: "asc" }
        },
        avis: {
          orderBy: { dateCreation: "desc" }
        }
      }
    });

    if (!produit) {
      return NextResponse.json({ success: false, error: "Produit non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: produit });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "VENDEUR") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const vendeurId = (session.user as any).vendeurId;

    const produitExistant = await prisma.produit.findUnique({ where: { id } });
    if (!produitExistant || produitExistant.vendeurId !== vendeurId) {
      return NextResponse.json({ success: false, error: "Produit introuvable ou non autorisé" }, { status: 404 });
    }

    const body = await req.json();
    const { nom, description, prix, stock, categorieId, statut, photos } = body;

    // Transaction to update product details and photos
    const produitMisAJour = await prisma.$transaction(async (tx) => {
      if (photos && Array.isArray(photos) && photos.length >= 1) {
        await tx.photoProduit.deleteMany({ where: { produitId: id } });
        await tx.photoProduit.createMany({
          data: photos.map((url: string, index: number) => ({
            produitId: id,
            url,
            estPrincipale: index === 0,
            ordre: index
          }))
        });
      }

      return tx.produit.update({
        where: { id },
        data: {
          ...(nom && { nom }),
          ...(description && { description }),
          ...(prix !== undefined && { prix: parseInt(prix) }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
          ...(categorieId && { categorieId }),
          ...(statut && { statut })
        },
        include: {
          photos: true,
          categorie: true
        }
      });
    });

    return NextResponse.json({ success: true, data: produitMisAJour });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la modification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "VENDEUR") {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const vendeurId = (session.user as any).vendeurId;

    const produitExistant = await prisma.produit.findUnique({
      where: { id },
      include: { lignesCommande: true }
    });

    if (!produitExistant || produitExistant.vendeurId !== vendeurId) {
      return NextResponse.json({ success: false, error: "Produit non autorisé ou introuvable" }, { status: 404 });
    }

    // Si le produit est rattaché à d'anciennes commandes, on le désactive pour préserver l'historique d'achat
    if (produitExistant.lignesCommande.length > 0) {
      await prisma.produit.update({
        where: { id },
        data: { statut: "INACTIF", stock: 0 }
      });
      return NextResponse.json({
        success: true,
        message: "Ce produit ayant fait l'objet de commandes passées, il a été retiré de la vente et archivé."
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.avis.deleteMany({ where: { produitId: id } });
      await tx.photoProduit.deleteMany({ where: { produitId: id } });
      await tx.produit.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "Produit supprimé définitivement avec succès." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
