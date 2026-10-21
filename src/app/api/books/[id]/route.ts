import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const book = await prisma.userBook.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        sessions: {
          orderBy: { readDate: "desc" },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error("Erro ao carregar livro:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar livro." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.userBook.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.author !== undefined) updateData.author = body.author.trim();
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.rating !== undefined) {
      updateData.rating =
        body.rating === null || body.rating === "" ? null : parseFloat(body.rating);
    }

    if (body.totalPages !== undefined) {
      updateData.totalPages = Math.max(1, parseInt(body.totalPages, 10));
    }

    if (body.currentPage !== undefined) {
      const total = (updateData.totalPages as number) ?? existing.totalPages;
      const current = Math.max(0, Math.min(total, parseInt(body.currentPage, 10)));
      updateData.currentPage = current;
      updateData.currentPercentage = Number(((current / total) * 100).toFixed(1));
    }

    const updated = await prisma.userBook.update({
      where: { id },
      data: updateData,
      include: {
        sessions: {
          orderBy: { readDate: "desc" },
        },
      },
    });

    return NextResponse.json({ book: updated });
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar livro." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.userBook.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Livro não encontrado." },
        { status: 404 }
      );
    }

    await prisma.userBook.delete({ where: { id } });

    return NextResponse.json({ message: "Livro removido da estante." });
  } catch (error) {
    console.error("Erro ao excluir livro:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir livro." },
      { status: 500 }
    );
  }
}
