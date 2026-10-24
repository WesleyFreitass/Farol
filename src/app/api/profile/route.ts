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
        themeColor: true,
        themeOpacity: true,
        replayMonth: true,
        readingGoal: true,
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

    // Get all user books with sessions
    const allBooks = await prisma.userBook.findMany({
      where: { userId: session.userId },
      include: {
        sessions: {
          orderBy: { readDate: "asc" },
        },
      },
    });

    const wishlistCount = await prisma.wishlistItem.count({
      where: { userId: session.userId },
    });

    const booksRead = allBooks.filter((b) => b.status === "READ").length;
    const booksReading = allBooks.filter((b) => b.status === "READING").length;
    const totalPagesRead = allBooks.reduce(
      (sum, b) => sum + (b.currentPage || 0),
      0
    );

    // Compute Level & XP (Farol System)
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

    // Farol Titles
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

    // Dynamic Replay Farol Month Computation
    const currentMonthIso = new Date().toISOString().substring(0, 7);
    const targetMonth =
      user.replayMonth && user.replayMonth !== "current"
        ? user.replayMonth
        : currentMonthIso;

    const [rYear, rMonth] = targetMonth.split("-").map(Number);
    const rDate = new Date(rYear, (rMonth || 1) - 1, 1);
    const monthLabel = rDate.toLocaleDateString("pt-BR", { month: "long" });
    const formattedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    const replayTitle = `Replay Farol — ${formattedMonth} / ${rYear}`;

    // Filter books finished or read in that month
    const booksReadInReplayMonth = allBooks.filter((b) => {
      if (b.status === "READ" && b.finishDate) {
        return b.finishDate.toISOString().startsWith(targetMonth);
      }
      return false;
    });

    // Compute pages read in that month across all sessions
    let pagesReadInReplayMonth = 0;
    allBooks.forEach((b) => {
      b.sessions?.forEach((s) => {
        if (s.readDate && s.readDate.toISOString().startsWith(targetMonth)) {
          pagesReadInReplayMonth += s.pageRead || 0;
        }
      });
    });

    const quotesInReplayMonth = user.quotes.filter((q) =>
      q.createdAt.toISOString().startsWith(targetMonth)
    ).length;

    // Real Badges & Achievements System
    const achievements = [
      {
        id: "first_pages",
        title: "Primeiras Páginas",
        description: "Leu 100 páginas no Farol",
        icon: "🥉",
        unlocked: totalPagesRead >= 100,
        color: "from-amber-700 to-amber-900 border-amber-500",
      },
      {
        id: "first_port",
        title: "Primeiro Porto",
        description: "Concluiu seu 1º livro",
        icon: "⚓",
        unlocked: booksRead >= 1,
        color: "from-blue-700 to-indigo-900 border-blue-400",
      },
      {
        id: "quotes_collector",
        title: "Colecionador de Frases",
        description: "Salvou pelo menos 4 citações",
        icon: "🖋️",
        unlocked: user.quotes.length >= 4,
        color: "from-purple-700 to-pink-900 border-purple-400",
      },
      {
        id: "navigator",
        title: "Navegador",
        description: "Concluiu 5 livros na sua estante",
        icon: "⛵",
        unlocked: booksRead >= 5,
        color: "from-emerald-700 to-teal-900 border-emerald-400",
      },
      {
        id: "thousand_miles",
        title: "Mil Milhas",
        description: "Leu mais de 1.000 páginas",
        icon: "🥈",
        unlocked: totalPagesRead >= 1000,
        color: "from-slate-600 to-slate-800 border-slate-300",
      },
      {
        id: "radar_active",
        title: "Radar Ativo",
        description: "Possui pelo menos 3 livros na Wishlist",
        icon: "💫",
        unlocked: wishlistCount >= 3,
        color: "from-amber-500 to-orange-700 border-amber-300",
      },
    ];

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
          wishlistCount,
          level,
          totalXP,
          levelProgressPercent,
          badgeTitle,
          badgeIcon,
          achievements,
          replay: {
            title: replayTitle,
            month: targetMonth,
            booksRead: booksReadInReplayMonth.length || booksRead,
            pagesRead: pagesReadInReplayMonth || totalPagesRead,
            quotesCount: quotesInReplayMonth || user.quotes.length,
            readingCount: booksReading,
          },
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
    if (body.themeColor !== undefined) {
      updateData.themeColor = body.themeColor?.trim() || "steam_midnight";
    }
    if (body.themeOpacity !== undefined) {
      updateData.themeOpacity = Math.max(20, Math.min(100, Number(body.themeOpacity) || 85));
    }
    if (body.replayMonth !== undefined) {
      updateData.replayMonth = body.replayMonth?.trim() || "current";
    }
    if (body.readingGoal !== undefined) {
      updateData.readingGoal = Math.max(1, Number(body.readingGoal) || 12);
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

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar perfil." },
      { status: 500 }
    );
  }
}
