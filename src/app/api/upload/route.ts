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

    // Verify valid image / gif type
    const mime = file.type.toLowerCase();
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validMimes.includes(mime)) {
      return NextResponse.json(
        {
          error:
            "Formato não suportado. Envie uma imagem ou GIF animado (.gif, .png, .jpg, .webp).",
        },
        { status: 400 }
      );
    }

    // Size limit: 25MB (great for full-res animated profile GIFs)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo excede o limite máximo de 25MB." },
        { status: 400 }
      );
    }

    // Determine extension
    let ext = "png";
    if (mime.includes("gif")) ext = "gif";
    else if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
    else if (mime.includes("webp")) ext = "webp";

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
