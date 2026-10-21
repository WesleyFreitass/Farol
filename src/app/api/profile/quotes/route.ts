import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { bookTitle, author, quote, pageNumber } = await req.json();

    if (!quote || !quote.trim()) {
      return NextResponse.json(
        { error: "A citação não pode ficar vazia." },
        { status: 400 }
      );
    }

    if (!bookTitle || !bookTitle.trim()) {
      return NextResponse.json(
        { error: "Informe o livro de onde é a citação." },
        { status: 400 }
      );
    }

    const newQuote = await prisma.userQuote.create({
      data: {
        userId: session.userId,
        bookTitle: bookTitle.trim(),
        author: author?.trim() || null,
        quote: quote.trim(),
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
      },
    });

    return NextResponse.json({ quote: newQuote }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar citação:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar citação." },
      { status: 500 }
    );
  }
}
