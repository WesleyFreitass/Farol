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

    const existing = await prisma.userQuote.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Citação não encontrada." },
        { status: 404 }
      );
    }

    await prisma.userQuote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir citação:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir citação." },
      { status: 500 }
    );
  }
}
