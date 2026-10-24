import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 1. Get crew members joined by the current user
    const crewJoined = await prisma.crewMember.findMany({
      where: { memberId: session.userId },
      select: { captainId: true },
    });
    const crewCaptainIds = crewJoined.map((c) => c.captainId);

    // 2. Fetch recent public activities (finished books, reading progress, quotes)
    const recentBooks = await prisma.userBook.findMany({
      take: 20,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            avatarFrame: true,
          },
        },
        sessions: {
          take: 1,
          orderBy: { readDate: "desc" },
        },
      },
    });

    const recentQuotes = await prisma.userQuote.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            avatarFrame: true,
          },
        },
      },
    });

    // 3. Fetch recommendations
    const recommendations = await prisma.bookRecommendation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 4. Fetch list of readers for crew discovery
    const otherUsers = await prisma.user.findMany({
      where: { id: { not: session.userId } },
      take: 8,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        avatarFrame: true,
        bio: true,
        books: {
          where: { status: "READING" },
          take: 1,
          select: { title: true, coverUrl: true },
        },
      },
    });

    const crewList = otherUsers.map((u) => ({
      ...u,
      isJoined: crewCaptainIds.includes(u.id),
      currentlyReading: u.books[0] || null,
    }));

    return NextResponse.json({
      crewCaptainIds,
      activities: {
        books: recentBooks,
        quotes: recentQuotes,
      },
      recommendations,
      crewList,
    });
  } catch (error) {
    console.error("Erro na rota de comunidade:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar comunidade." },
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

    const body = await req.json();
    const { action } = body;

    // Action: Join or Leave Crew
    if (action === "toggle_crew") {
      const { captainId } = body;
      if (!captainId || captainId === session.userId) {
        return NextResponse.json({ error: "Capitão inválido." }, { status: 400 });
      }

      const existing = await prisma.crewMember.findUnique({
        where: {
          captainId_memberId: {
            captainId,
            memberId: session.userId,
          },
        },
      });

      if (existing) {
        await prisma.crewMember.delete({
          where: { id: existing.id },
        });
        return NextResponse.json({ joined: false });
      } else {
        await prisma.crewMember.create({
          data: {
            captainId,
            memberId: session.userId,
          },
        });
        return NextResponse.json({ joined: true });
      }
    }

    // Action: Recommend a Book to the Crew
    if (action === "recommend_book") {
      const { bookTitle, author, coverUrl, note } = body;
      if (!bookTitle || !author) {
        return NextResponse.json({ error: "Dados do livro incompletos." }, { status: 400 });
      }

      const rec = await prisma.bookRecommendation.create({
        data: {
          senderId: session.userId,
          bookTitle: bookTitle.trim(),
          author: author.trim(),
          coverUrl: coverUrl || null,
          note: note?.trim() || null,
        },
      });

      return NextResponse.json({ recommendation: rec });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("Erro ao processar ação na comunidade:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
