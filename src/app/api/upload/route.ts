import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // Verify valid image / gif type (by MIME and by filename extension fallback)
    const mime = (file.type || "").toLowerCase();
    const fileNameLower = (file.name || "").toLowerCase();

    const isGif = mime.includes("gif") || fileNameLower.endsWith(".gif");
    const isPng = mime.includes("png") || fileNameLower.endsWith(".png");
    const isJpg =
      mime.includes("jpeg") ||
      mime.includes("jpg") ||
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg");
    const isWebp = mime.includes("webp") || fileNameLower.endsWith(".webp");

    if (!isGif && !isPng && !isJpg && !isWebp) {
      return NextResponse.json(
        {
          error:
            "Formato não suportado. Envie uma imagem ou GIF animado (.gif, .png, .jpg, .webp).",
        },
        { status: 400 }
      );
    }

    // Size limit: 35MB (great for high-res animated wallpapers)
    if (file.size > 35 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo excede o limite máximo de 35MB." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = "png";
    if (isGif) ext = "gif";
    else if (isJpg) ext = "jpg";
    else if (isWebp) ext = "webp";

    const fileName = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}.${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName,
      size: file.size,
      mimeType: mime,
    });
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o upload." },
      { status: 500 }
    );
  }
}
