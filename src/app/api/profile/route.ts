import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDateYearMonth(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().substring(0, 7);
}

function isDateInMonth(
  date: Date | string | null | undefined,
  targetMonth: string
): boolean {
  if (!date) return false;
  const ym = getDateYearMonth(date);
  if (!ym) return false;
  if (ym === targetMonth) return true;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}` === targetMonth;
}

function isDateAfterMonth(
  date: Date | string | null | undefined,
  targetMonth: string
): boolean {
  if (!date) return false;
  const ym = getDateYearMonth(date);
  if (!ym) return false;
  return ym > targetMonth;
}

function isDateOnOrBeforeMonth(
  date: Date | string | null | undefined,
  targetMonth: string
): boolean {
  if (!date) return false;
  const ym = getDateYearMonth(date);
  if (!ym) return false;
  return ym <= targetMonth;
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get("userId");
    const targetUserId = requestedUserId || session?.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const isOwner = Boolean(session?.userId && session.userId === targetUserId);

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
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

    // Check if current user is following this reader in crew
    let isJoinedToCrew = false;
    if (session?.userId && !isOwner) {
      const membership = await prisma.crewMember.findUnique({
        where: {
          captainId_memberId: {
            captainId: targetUserId,
            memberId: session.userId,
          },
        },
      });
      isJoinedToCrew = Boolean(membership);
    }

    // Get all user books with sessions
    const allBooks = await prisma.userBook.findMany({
      where: { userId: targetUserId },
      include: {
        sessions: {
          orderBy: { readDate: "asc" },
        },
      },
    });

    const wishlistCount = await prisma.wishlistItem.count({
      where: { userId: targetUserId },
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
    let badgeIcon = "candle";
    if (level >= 30) {
      badgeTitle = "Oráculo de Alexandria";
      badgeIcon = "oracle";
    } else if (level >= 20) {
      badgeTitle = "Guardião dos Tomos";
      badgeIcon = "crown";
    } else if (level >= 15) {
      badgeTitle = "Mestre da Biblioteca";
      badgeIcon = "scroll";
    } else if (level >= 10) {
      badgeTitle = "Devorador de Páginas";
      badgeIcon = "flame";
    } else if (level >= 5) {
      badgeTitle = "Viajante Literário";
      badgeIcon = "compass";
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

    // Helper to determine if a book was completed in a given month
    function isBookCompletedInMonth(b: (typeof allBooks)[0], month: string): boolean {
      if (b.status !== "READ") return false;

      const sorted = [...(b.sessions || [])].sort(
        (x, y) => new Date(x.readDate).getTime() - new Date(y.readDate).getTime()
      );

      // 1. Reached 100% or total pages in a session within target month
      const hasFinishedSession = sorted.some(
        (s) =>
          isDateInMonth(s.readDate, month) &&
          (s.percentageRead >= 100 || s.pageRead >= b.totalPages)
      );
      if (hasFinishedSession) return true;

      // 2. Explicit finishDate in target month
      if (b.finishDate && isDateInMonth(b.finishDate, month)) {
        return true;
      }

      // 3. No explicit finishDate, but latest session in target month reached 100%
      if (!b.finishDate && sorted.length > 0) {
        const lastSession = sorted[sorted.length - 1];
        if (
          isDateInMonth(lastSession.readDate, month) &&
          lastSession.percentageRead >= 100
        ) {
          return true;
        }
      }

      return false;
    }

    // Filter books finished in that month
    const booksReadInReplayMonth = allBooks.filter((b) =>
      isBookCompletedInMonth(b, targetMonth)
    );

    // Compute pages read in that month across all sessions using chronological deltas
    let pagesReadInReplayMonth = 0;
    const booksActiveInReplayMonthSet = new Set<string>();

    allBooks.forEach((b) => {
      const sortedSessions = [...(b.sessions || [])].sort(
        (a, b) => new Date(a.readDate).getTime() - new Date(b.readDate).getTime()
      );

      let bookHadActivityInMonth = false;

      sortedSessions.forEach((s, idx) => {
        const prevPage = idx === 0 ? 0 : sortedSessions[idx - 1].pageRead;
        const delta = Math.max(0, (s.pageRead || 0) - prevPage);

        if (isDateInMonth(s.readDate, targetMonth)) {
          pagesReadInReplayMonth += delta;
          bookHadActivityInMonth = true;
        }
      });

      // If book was finished in targetMonth but had no logged sessions (e.g. direct mark as read)
      if (
        b.status === "READ" &&
        b.finishDate &&
        isDateInMonth(b.finishDate, targetMonth) &&
        sortedSessions.length === 0
      ) {
        pagesReadInReplayMonth += b.totalPages || b.currentPage || 0;
        bookHadActivityInMonth = true;
      }

      if (bookHadActivityInMonth) {
        booksActiveInReplayMonthSet.add(b.id);
      }
    });

    const quotesInReplayMonth = user.quotes.filter((q) =>
      isDateInMonth(q.createdAt, targetMonth)
    ).length;

    const booksReadingInMonth = allBooks.filter((b) => {
      // If book finished in targetMonth, it's counted in booksReadInReplayMonth
      const isFinishedInTarget = booksReadInReplayMonth.some((rb) => rb.id === b.id);
      if (isFinishedInTarget) return false;

      if (targetMonth === currentMonthIso) {
        return b.status === "READING";
      }

      // In historical month, was reading if it had sessions or was started in targetMonth
      if (booksActiveInReplayMonthSet.has(b.id)) return true;
      if (b.startDate && isDateInMonth(b.startDate, targetMonth)) return true;
      return false;
    }).length;

    // Books to showcase in Replay card, sorted by most recent activity in targetMonth
    const activeBooksInMonth: {
      book: (typeof allBooks)[0];
      latestActivityTime: number;
    }[] = [];

    allBooks.forEach((b) => {
      const monthSessions = (b.sessions || []).filter((s) =>
        isDateInMonth(s.readDate, targetMonth)
      );
      const isFinishedInTarget = isBookCompletedInMonth(b, targetMonth);
      const isStartedInTarget = Boolean(
        b.startDate && isDateInMonth(b.startDate, targetMonth)
      );

      if (monthSessions.length > 0 || isFinishedInTarget || isStartedInTarget) {
        let latestTime = 0;
        if (b.finishDate && isDateInMonth(b.finishDate, targetMonth)) {
          latestTime = Math.max(latestTime, new Date(b.finishDate).getTime());
        }
        monthSessions.forEach((s) => {
          latestTime = Math.max(latestTime, new Date(s.readDate).getTime());
        });
        if (latestTime === 0 && b.startDate) {
          latestTime = new Date(b.startDate).getTime();
        }
        activeBooksInMonth.push({ book: b, latestActivityTime: latestTime });
      }
    });

    // Sort descending by most recent activity in targetMonth
    activeBooksInMonth.sort((a, b) => b.latestActivityTime - a.latestActivityTime);

    const replayBooks = activeBooksInMonth.map(({ book: b }) => {
      const sortedSessions = [...(b.sessions || [])].sort(
        (a, b) => new Date(a.readDate).getTime() - new Date(b.readDate).getTime()
      );

      const sessionsUpToMonth = sortedSessions.filter((s) =>
        isDateOnOrBeforeMonth(s.readDate, targetMonth)
      );

      let bookStatusInMonth = b.status;
      let bookPercentageInMonth = b.currentPercentage;

      // 1. Did the book finish in targetMonth?
      const finishedInTargetMonth = isBookCompletedInMonth(b, targetMonth);

      // 2. Did the book finish AFTER targetMonth (e.g. finished in October, but target is September)?
      const finishedAfterTargetMonth =
        b.status === "READ" &&
        !finishedInTargetMonth &&
        ((b.finishDate && isDateAfterMonth(b.finishDate, targetMonth)) ||
          (!b.finishDate &&
            sortedSessions.length > 0 &&
            isDateAfterMonth(
              sortedSessions[sortedSessions.length - 1].readDate,
              targetMonth
            )));

      if (finishedInTargetMonth) {
        bookStatusInMonth = "READ";
        bookPercentageInMonth = 100;
      } else if (finishedAfterTargetMonth) {
        // Book was finished in a future month! In targetMonth it was still READING
        bookStatusInMonth = "READING";
        if (sessionsUpToMonth.length > 0) {
          const lastSessionInPeriod =
            sessionsUpToMonth[sessionsUpToMonth.length - 1];
          bookPercentageInMonth = lastSessionInPeriod.percentageRead;
        } else {
          bookPercentageInMonth = 0;
        }
      } else if (targetMonth === currentMonthIso) {
        bookStatusInMonth = finishedInTargetMonth ? "READ" : "READING";
        bookPercentageInMonth = finishedInTargetMonth ? 100 : b.currentPercentage;
      } else {
        // Historical month, and book was not finished in or before targetMonth
        bookStatusInMonth = "READING";
        if (sessionsUpToMonth.length > 0) {
          const lastSessionInPeriod =
            sessionsUpToMonth[sessionsUpToMonth.length - 1];
          bookPercentageInMonth = lastSessionInPeriod.percentageRead;
        } else {
          bookPercentageInMonth = 0;
        }
      }

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        coverUrl: b.coverUrl,
        currentPercentage: Math.min(
          100,
          Math.max(0, Math.round(bookPercentageInMonth))
        ),
        status: bookStatusInMonth,
      };
    });

    // Real Badges & Achievements System
    const achievements = [
      {
        id: "first_pages",
        title: "Primeiras Páginas",
        description: "Leu 100 páginas no Farol",
        icon: "first_pages",
        unlocked: totalPagesRead >= 100,
        color: "from-amber-700 to-amber-900 border-amber-500",
      },
      {
        id: "first_port",
        title: "Primeiro Porto",
        description: "Concluiu seu 1º livro",
        icon: "first_port",
        unlocked: booksRead >= 1,
        color: "from-blue-700 to-indigo-900 border-blue-400",
      },
      {
        id: "quotes_collector",
        title: "Colecionador de Frases",
        description: "Salvou pelo menos 4 citações",
        icon: "quotes_collector",
        unlocked: user.quotes.length >= 4,
        color: "from-amber-600 to-amber-900 border-amber-400",
      },
      {
        id: "navigator",
        title: "Navegador",
        description: "Concluiu 5 livros na sua estante",
        icon: "navigator",
        unlocked: booksRead >= 5,
        color: "from-emerald-700 to-teal-900 border-emerald-400",
      },
      {
        id: "thousand_miles",
        title: "Mil Milhas",
        description: "Leu mais de 1.000 páginas",
        icon: "thousand_miles",
        unlocked: totalPagesRead >= 1000,
        color: "from-slate-600 to-slate-800 border-slate-300",
      },
      {
        id: "radar_active",
        title: "Radar Ativo",
        description: "Possui pelo menos 3 livros na Wishlist",
        icon: "radar_active",
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
        email: isOwner ? user.email : "",
        isOwner,
        isJoinedToCrew,
        shelfBooks: allBooks,
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
            monthLabel: formattedMonth,
            year: rYear,
            booksRead: booksReadInReplayMonth.length,
            pagesRead: pagesReadInReplayMonth,
            quotesCount: quotesInReplayMonth,
            readingCount: booksReadingInMonth,
            books: replayBooks,
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
