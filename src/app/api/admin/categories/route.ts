import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const categories = await prisma.categorie.findMany({
      orderBy: { nom: "asc" },
      include: {
        _count: { select: { produits: true } }
      }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const body = await req.json();
    const { nom, slug } = body;

    if (!nom) {
      return NextResponse.json({ success: false, error: "Le nom de la catégorie est requis." }, { status: 400 });
    }

    const categorySlug = slug || nom.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const nouvelleCategorie = await prisma.categorie.create({
      data: {
        nom: nom.trim(),
        slug: categorySlug
      }
    });

    return NextResponse.json({ success: true, data: nouvelleCategorie });
  } catch (error: any) {
    console.error("Error creating category:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Une catégorie avec ce nom ou ce slug existe déjà." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Erreur lors de la création de la catégorie" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMINISTRATEUR") {
      return NextResponse.json({ success: false, error: "Accès réservé aux administrateurs." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "L'identifiant de la catégorie est requis." }, { status: 400 });
    }

    await prisma.categorie.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression de la catégorie" }, { status: 500 });
  }
}
