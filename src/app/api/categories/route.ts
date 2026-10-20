import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.categorie.findMany({
      include: {
        _count: {
          select: { produits: true }
        }
      },
      orderBy: { nom: "asc" }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Impossible de charger les catégories" }, { status: 500 });
  }
}
