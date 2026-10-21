import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchBookBestPrice } from "@/lib/priceTracker";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const cronSecret = searchParams.get("secret");

    // Allow either authenticated user or cron secret
    const isCron =
      process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

    if (!session && !isCron) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Find items to check (if user, check user's items; if cron, check all items)
    const items = await prisma.wishlistItem.findMany({
      where: session ? { userId: session.userId } : {},
      take: 25, // safety limit per run
    });

    const updatedItems = [];

    for (const item of items) {
      try {
        const result = await searchBookBestPrice(item.title, item.author);
        const newPrice = result.lowestPrice;
        const lowestEver = Math.min(item.lowestPrice, newPrice);

        const hasDropped = newPrice < item.initialPrice;
        const percentDrop = hasDropped
          ? Number(
              (((item.initialPrice - newPrice) / item.initialPrice) * 100).toFixed(1)
            )
          : 0;

        await prisma.priceHistory.create({
          data: {
            wishlistId: item.id,
            price: newPrice,
            storeName: result.storeName,
          },
        });

        const updated = await prisma.wishlistItem.update({
          where: { id: item.id },
          data: {
            currentPrice: newPrice,
            lowestPrice: lowestEver,
            storeName: result.storeName || item.storeName,
            productUrl: result.productUrl || item.productUrl,
            lastCheckedAt: new Date(),
            priceDropped: hasDropped,
            percentDrop,
          },
        });

        updatedItems.push(updated);
      } catch (err) {
        console.warn(`Erro ao checar item ${item.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      checkedCount: updatedItems.length,
      items: updatedItems,
    });
  } catch (error) {
    console.error("Erro ao verificar todos os preços:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar preços." },
      { status: 500 }
    );
  }
}
