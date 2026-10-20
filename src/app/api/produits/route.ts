import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("categorie") || "";
    const vendeurId = searchParams.get("vendeurId") || "";
    const minPrix = searchParams.get("minPrix") ? parseInt(searchParams.get("minPrix")!) : undefined;
    const maxPrix = searchParams.get("maxPrix") ? parseInt(searchParams.get("maxPrix")!) : undefined;
    const tri = searchParams.get("tri") || "nouveautes"; // nouveautes, prix_asc, prix_desc

    const where: any = {
      statut: "ACTIF"
    };

    if (query) {
      where.OR = [
        { nom: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ];
    }

    if (categorySlug) {
      const cat = await prisma.categorie.findUnique({ where: { slug: categorySlug } });
      if (cat) {
        where.categorieId = cat.id;
      }
    }

    if (vendeurId) {
      where.vendeurId = vendeurId;
    }

    if (minPrix !== undefined || maxPrix !== undefined) {
      where.prix = {};
      if (minPrix !== undefined) where.prix.gte = minPrix;
      if (maxPrix !== undefined) where.prix.lte = maxPrix;
    }

    let orderBy: any = { dateCreation: "desc" };
    if (tri === "prix_asc") orderBy = { prix: "asc" };
    if (tri === "prix_desc") orderBy = { prix: "desc" };

    const produits = await prisma.produit.findMany({
      where,
      orderBy,
      include: {
        categorie: true,
        vendeur: {
          include: {
            utilisateur: {
              select: { nom: true, prenom: true, telephone: true }
            }
          }
        },
        photos: {
          orderBy: { ordre: "asc" }
        }
      }
    });

    return NextResponse.json({ success: true, data: produits });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Erreur lors du chargement des produits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "VENDEUR") {
      return NextResponse.json({ success: false, error: "Accès refusé. Compte vendeur requis." }, { status: 403 });
    }

    const vendeurId = (session.user as any).vendeurId;
    if (!vendeurId) {
      return NextResponse.json({ success: false, error: "Profil vendeur non trouvé." }, { status: 400 });
    }

    const body = await req.json();
    const { nom, description, prix, stock, categorieId, photos } = body;

    // Validation
    if (!nom || !description || !prix || stock === undefined || !categorieId) {
      return NextResponse.json({ success: false, error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
    }

    if (!photos || !Array.isArray(photos) || photos.length < 1 || photos.length > 5) {
      return NextResponse.json({ success: false, error: "Vous devez ajouter entre 1 et 5 photos pour ce produit." }, { status: 400 });
    }

    const nouveauProduit = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: parseInt(prix),
        stock: parseInt(stock),
        categorieId,
        vendeurId,
        statut: "ACTIF",
        photos: {
          create: photos.map((url: string, index: number) => ({
            url,
            estPrincipale: index === 0,
            ordre: index
          }))
        }
      },
      include: {
        photos: true,
        categorie: true
      }
    });

    return NextResponse.json({ success: true, data: nouveauProduit }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
