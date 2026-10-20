import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToProcess: File[] = [];
    if (files && files.length > 0) {
      filesToProcess.push(...files);
    } else if (singleFile) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: `Le fichier ${file.name} n'est pas une image valide.` },
          { status: 400 }
        );
      }

      // 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `L'image ${file.name} est trop lourde (max 10 Mo).` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean file extension
      const originalExt = path.extname(file.name).toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(originalExt)
        ? originalExt
        : ".jpg";

      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const fileName = `produit_${uniqueSuffix}${safeExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] // for single upload compatibility
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'enregistrement de l'image." },
      { status: 500 }
    );
  }
}
