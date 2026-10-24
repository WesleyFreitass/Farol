import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const books = await prisma.userBook.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        sessions: {
          orderBy: { readDate: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Erro ao listar livros:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar livros da estante." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const {
      title,
      author,
      coverUrl,
      totalPages,
      currentPage = 0,
      status = "READING",
      notes,
      genre,
    } = await req.json();

    if (!title || !author) {
      return NextResponse.json(
        { error: "Título e autor são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const normalizedTarget = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Previne estritamente a adição de livros duplicados na estante do usuário
    const existingUserBooks = await prisma.userBook.findMany({
      where: { userId: session.userId },
      select: { id: true, title: true },
    });

    const isDuplicate = existingUserBooks.some((eb) => {
      const ebNorm = eb.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        ebNorm === normalizedTarget ||
        (normalizedTarget.length > 5 && ebNorm.includes(normalizedTarget)) ||
        (ebNorm.length > 5 && normalizedTarget.includes(ebNorm))
      );
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Este livro já está cadastrado na sua estante!" },
        { status: 409 }
      );
    }

    const parsedTotalPages = Math.max(1, parseInt(totalPages, 10) || 1);
    const parsedCurrentPage = Math.max(
      0,
      Math.min(parsedTotalPages, parseInt(currentPage, 10) || 0)
    );
    const percentage = Number(
      ((parsedCurrentPage / parsedTotalPages) * 100).toFixed(1)
    );

    const book = await prisma.userBook.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl?.trim() || null,
        totalPages: parsedTotalPages,
        currentPage: parsedCurrentPage,
        currentPercentage: percentage,
        status: status || "READING",
        notes: notes?.trim() || null,
        genre: genre?.trim() || "Ficção",
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar livro:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar livro na estante." },
      { status: 500 }
    );
  }
}
