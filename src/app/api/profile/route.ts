import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        profileBackground: true,
        avatarFrame: true,
        featuredBookIds: true,
        createdAt: true,
        quotes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Get all user books for stats and featured books
    const allBooks = await prisma.userBook.findMany({
      where: { userId: session.userId },
      include: {
        sessions: {
          take: 1,
        },
      },
    });

    const booksRead = allBooks.filter((b) => b.status === "READ").length;
    const booksReading = allBooks.filter((b) => b.status === "READING").length;
    const totalPagesRead = allBooks.reduce(
      (sum, b) => sum + (b.currentPage || 0),
      0
    );

    // Compute Steam-style Level & XP
    // 1 book read = 100 XP, 10 pages read = 1 XP, 1 quote = 25 XP
    const totalXP =
      booksRead * 100 +
      Math.floor(totalPagesRead / 10) +
      user.quotes.length * 25;
    const level = Math.max(1, Math.floor(Math.sqrt(totalXP / 20)) + 1);
    const xpCurrentLevelBase = Math.pow(level - 1, 2) * 20;
    const xpNextLevelBase = Math.pow(level, 2) * 20;
    const levelProgressPercent = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ((totalXP - xpCurrentLevelBase) /
            (xpNextLevelBase - xpCurrentLevelBase || 1)) *
            100
        )
      )
    );

    // Steam-style Badge Titles
    let badgeTitle = "Aprendiz do Farol";
    let badgeIcon = "🕯️";
    if (level >= 30) {
      badgeTitle = "Oráculo de Alexandria";
      badgeIcon = "🏛️";
    } else if (level >= 20) {
      badgeTitle = "Guardião dos Tomos";
      badgeIcon = "👑";
    } else if (level >= 15) {
      badgeTitle = "Mestre da Biblioteca";
      badgeIcon = "📜";
    } else if (level >= 10) {
      badgeTitle = "Devorador de Páginas";
      badgeIcon = "🔥";
    } else if (level >= 5) {
      badgeTitle = "Viajante Literário";
      badgeIcon = "🧭";
    }

    // Fetch featured books
    let featuredIds: string[] = [];
    try {
      featuredIds = JSON.parse(user.featuredBookIds || "[]");
    } catch {
      featuredIds = [];
    }

    const featuredBooks = allBooks.filter((b) => featuredIds.includes(b.id));

    return NextResponse.json({
      profile: {
        ...user,
        stats: {
          booksRead,
          booksReading,
          totalBooks: allBooks.length,
          totalPagesRead,
          totalQuotes: user.quotes.length,
          level,
          totalXP,
          levelProgressPercent,
          badgeTitle,
          badgeIcon,
        },
        featuredBooks,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar perfil." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio?.trim() || null;
    }
    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = body.avatarUrl?.trim() || null;
    }
    if (body.profileBackground !== undefined) {
      updateData.profileBackground = body.profileBackground?.trim() || null;
    }
    if (body.avatarFrame !== undefined) {
      updateData.avatarFrame = body.avatarFrame?.trim() || null;
    }
    if (body.featuredBookIds !== undefined) {
      updateData.featuredBookIds = Array.isArray(body.featuredBookIds)
        ? JSON.stringify(body.featuredBookIds)
        : body.featuredBookIds || "[]";
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil." },
      { status: 500 }
    );
  }
}
