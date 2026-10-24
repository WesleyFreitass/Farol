import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchBookBestPrice } from "@/lib/priceTracker";

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

    const item = await prisma.wishlistItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    // Re-check live price
    const result = await searchBookBestPrice(item.title, item.author);

    const newPrice = result.lowestPrice;
    const lowestEver = Math.min(item.lowestPrice, newPrice);

    const hasDropped = newPrice < item.initialPrice;
    const percentDrop = hasDropped
      ? Number((((item.initialPrice - newPrice) / item.initialPrice) * 100).toFixed(1))
      : 0;

    // Record price history
    await prisma.priceHistory.create({
      data: {
        wishlistId: item.id,
        price: newPrice,
        storeName: result.storeName,
      },
    });

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        currentPrice: newPrice,
        lowestPrice: lowestEver,
        storeName: result.storeName || item.storeName,
        productUrl: result.productUrl || item.productUrl,
        storeOffers: JSON.stringify(result.offers),
        lastCheckedAt: new Date(),
        priceDropped: hasDropped,
        percentDrop,
      },
      include: {
        history: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Erro ao checar preço:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar preço do livro." },
      { status: 500 }
    );
  }
}
