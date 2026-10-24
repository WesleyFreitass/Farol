import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const {
      pageRead,
      percentageRead,
      readDate,
      comment,
      emotions = [],
    } = await req.json();

    const book = await prisma.userBook.findFirst({
      where: { id, userId: session.userId },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    const totalPages = Math.max(1, book.totalPages);
    let finalPage: number;
    let finalPercentage: number;

    if (pageRead !== undefined && pageRead !== null && pageRead !== "") {
      finalPage = Math.max(0, Math.min(totalPages, parseInt(pageRead, 10)));
      finalPercentage = Number(((finalPage / totalPages) * 100).toFixed(1));
    } else if (
      percentageRead !== undefined &&
      percentageRead !== null &&
      percentageRead !== ""
    ) {
      finalPercentage = Math.max(
        0,
        Math.min(100, parseFloat(percentageRead))
      );
      finalPage = Math.round((finalPercentage / 100) * totalPages);
    } else {
      return NextResponse.json(
        { error: "Informe a página ou a porcentagem da leitura." },
        { status: 400 }
      );
    }

    const parsedDate = readDate ? new Date(readDate) : new Date();

    // Criação da sessão de leitura
    const newSession = await prisma.readingSession.create({
      data: {
        userBookId: id,
        pageRead: finalPage,
        percentageRead: finalPercentage,
        readDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        comment: comment?.trim() || null,
        emotions: JSON.stringify(emotions || []),
      },
    });

    // Atualização do status e progresso do livro
    let nextStatus = book.status;
    let finishDate = book.finishDate;
    let startDate = book.startDate;

    if (finalPage >= totalPages) {
      nextStatus = "READ";
      finishDate = parsedDate;
    } else if (book.status === "WANT_TO_READ" && finalPage > 0) {
      nextStatus = "READING";
      if (!startDate) startDate = parsedDate;
    }

    const updatedBook = await prisma.userBook.update({
      where: { id },
      data: {
        currentPage: finalPage,
        currentPercentage: finalPercentage,
        status: nextStatus,
        startDate,
        finishDate,
      },
      include: {
        sessions: {
          orderBy: { readDate: "desc" },
        },
      },
    });

    return NextResponse.json(
      {
        session: newSession,
        book: updatedBook,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar leitura:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar atualização de leitura." },
      { status: 500 }
    );
  }
}
