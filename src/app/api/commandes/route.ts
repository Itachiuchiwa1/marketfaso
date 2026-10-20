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
    const vendeurId = (session.user as any).vendeurId;

    let where: any = {};

    if (role === "VENDEUR" && vendeurId) {
      // Find orders that contain at least one product belonging to this seller
      where = {
        lignes: {
          some: {
            produit: { vendeurId }
          }
        }
      };
    }

    const commandes = await prisma.commande.findMany({
      where,
      orderBy: { dateCreation: "desc" },
      include: {
        lignes: {
          include: {
            produit: {
              include: { photos: { where: { estPrincipale: true } } }
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

    return NextResponse.json({ success: true, data: commandes });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nomAcheteur, telephoneAcheteur, adresseLivraison, articles, fraisLivraison = 1500 } = body;

    if (!nomAcheteur || !telephoneAcheteur || !adresseLivraison || !articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ success: false, error: "Veuillez remplir toutes les informations de livraison et ajouter au moins un produit." }, { status: 400 });
    }

    // STRICT BUSINESS RULE: Recalculate price and verify stock from DB
    const productIds = articles.map((a: any) => a.produitId);
    const dbProducts = await prisma.produit.findMany({
      where: {
        id: { in: productIds },
        statut: "ACTIF"
      }
    });

    const dbProductsMap = new Map(dbProducts.map(p => [p.id, p]));

    let totalArticlesAmount = 0;
    const verifiedLignesData = [];

    for (const item of articles) {
      const dbProduct = dbProductsMap.get(item.produitId);
      if (!dbProduct) {
        return NextResponse.json({ success: false, error: `Le produit "${item.nom || item.produitId}" n'est plus disponible.` }, { status: 400 });
      }

      if (dbProduct.stock < item.quantite) {
        return NextResponse.json({ success: false, error: `Stock insuffisant pour "${dbProduct.nom}". Stock restant : ${dbProduct.stock}` }, { status: 400 });
      }

      const lineTotal = dbProduct.prix * item.quantite;
      totalArticlesAmount += lineTotal;

      verifiedLignesData.push({
        produitId: dbProduct.id,
        quantite: item.quantite,
        prixUnitaire: dbProduct.prix
      });
    }

    const totalOrderAmount = totalArticlesAmount + fraisLivraison;

    // Generate unique order number (MF-2026-XXXXX)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const numeroUnique = `MF-2026-${randomSuffix}`;

    // Create Commande in DB
    const nouvelleCommande = await prisma.commande.create({
      data: {
        numero: numeroUnique,
        nomAcheteur: nomAcheteur.trim(),
        telephoneAcheteur: telephoneAcheteur.trim(),
        adresseLivraison: adresseLivraison.trim(),
        montantTotal: totalOrderAmount,
        statut: "EN_ATTENTE_PAIEMENT",
        lignes: {
          create: verifiedLignesData
        },
        livraison: {
          create: {
            adresseDepart: "Boutique du vendeur",
            adresseDestination: adresseLivraison.trim(),
            statut: "EN_ATTENTE"
          }
        }
      },
      include: {
        lignes: {
          include: { produit: true }
        },
        livraison: true
      }
    });

    return NextResponse.json({ success: true, data: nouvelleCommande }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la création de la commande" }, { status: 500 });
  }
}
