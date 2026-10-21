import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const existing = await prisma.wishlistItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado." },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir item da wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno ao remover livro da lista de desejos." },
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

    const existing = await prisma.wishlistItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.targetPrice !== undefined) {
      updateData.targetPrice =
        body.targetPrice === null || body.targetPrice === ""
          ? null
          : parseFloat(body.targetPrice);
    }

    if (body.initialPrice !== undefined && !isNaN(parseFloat(body.initialPrice))) {
      updateData.initialPrice = parseFloat(body.initialPrice);
      // recalculate drop
      if (existing.currentPrice < parseFloat(body.initialPrice)) {
        updateData.priceDropped = true;
        updateData.percentDrop = Number(
          (
            ((parseFloat(body.initialPrice) - existing.currentPrice) /
              parseFloat(body.initialPrice)) *
            100
          ).toFixed(1)
        );
      } else {
        updateData.priceDropped = false;
        updateData.percentDrop = 0;
      }
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Erro ao atualizar item da wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar item." },
      { status: 500 }
    );
  }
}
