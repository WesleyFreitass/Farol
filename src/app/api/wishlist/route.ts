import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchBookBestPrice, generateStoreOffers } from "@/lib/priceTracker";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.userId },
      orderBy: [{ priceDropped: "desc" }, { updatedAt: "desc" }],
      include: {
        history: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
      },
    });

    // Summary calculations & ensure top 3 offers in ascending order
    let totalSaved = 0;
    let droppedCount = 0;

    const mappedItems = items.map((item) => {
      if (item.priceDropped && item.currentPrice < item.initialPrice) {
        droppedCount++;
        totalSaved += item.initialPrice - item.currentPrice;
      }

      let offers = [];
      if (item.storeOffers) {
        try {
          offers = JSON.parse(item.storeOffers);
        } catch {
          // fallback
        }
      }
      if (!offers || offers.length === 0) {
        offers = generateStoreOffers(item.title, item.author, item.currentPrice);
      }

      return {
        ...item,
        offers,
      };
    });

    return NextResponse.json({
      items: mappedItems,
      summary: {
        totalItems: mappedItems.length,
        droppedCount,
        totalSaved: Number(totalSaved.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Erro ao listar wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar lista de desejos." },
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
      isbn,
      targetPrice,
      userBookId,
      initialPrice: manualPrice,
    } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Título do livro é obrigatório." },
        { status: 400 }
      );
    }

    // Check if already in wishlist for this user
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.userId,
        title: {
          equals: title.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este livro já está na sua lista de desejos e monitoramento." },
        { status: 409 }
      );
    }

    // Search best initial price online
    const priceResult = await searchBookBestPrice(title, author);

    const price =
      manualPrice && !isNaN(parseFloat(manualPrice))
        ? parseFloat(manualPrice)
        : priceResult.lowestPrice;

    const parsedTarget =
      targetPrice && !isNaN(parseFloat(targetPrice))
        ? parseFloat(targetPrice)
        : null;

    const finalCover = coverUrl || priceResult.coverUrl || null;
    const finalProductUrl = priceResult.productUrl || null;
    const finalStore = priceResult.storeName || "Estante Virtual";

    // Create item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: session.userId,
        userBookId: userBookId || null,
        title: title.trim(),
        author: (author || "Autor desconhecido").trim(),
        isbn: isbn || null,
        coverUrl: finalCover,
        initialPrice: price,
        currentPrice: price,
        lowestPrice: price,
        targetPrice: parsedTarget,
        storeName: finalStore,
        productUrl: finalProductUrl,
        storeOffers: JSON.stringify(priceResult.offers),
        priceDropped: false,
        percentDrop: 0,
        history: {
          create: {
            price,
            storeName: finalStore,
          },
        },
      },
      include: {
        history: true,
      },
    });

    return NextResponse.json({ item: wishlistItem }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar na wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno ao adicionar livro no radar." },
      { status: 500 }
    );
  }
}
