export interface PriceOffer {
  title: string;
  price: number;
  url: string;
  image?: string;
  store: string;
}

export interface BestPriceResult {
  found: boolean;
  lowestPrice: number;
  storeName: string;
  productUrl: string;
  coverUrl?: string;
  offers: PriceOffer[];
  comparisonLinks: {
    amazonUrl: string;
    googleShoppingUrl: string;
    mercadoLivreUrl: string;
    estanteVirtualUrl: string;
  };
}

export async function searchBookBestPrice(
  title: string,
  author?: string
): Promise<BestPriceResult> {
  const cleanTitle = title
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/#/g, "")
    .trim();

  const query = `${cleanTitle} ${author || ""}`.trim();

  const comparisonLinks = {
    amazonUrl: `https://www.amazon.com.br/s?k=${encodeURIComponent(
      cleanTitle + (author ? ` ${author}` : "")
    )}&i=stripbooks`,
    googleShoppingUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
      cleanTitle + " livro"
    )}`,
    mercadoLivreUrl: `https://lista.mercadolivre.com.br/${encodeURIComponent(
      cleanTitle + " livro"
    )}`,
    estanteVirtualUrl: `https://www.estantevirtual.com.br/busca?q=${encodeURIComponent(
      cleanTitle
    )}`,
  };

  try {
    const res = await fetch(
      `https://www.estantevirtual.com.br/busca?q=${encodeURIComponent(cleanTitle)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        },
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const html = await res.text();
      const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
      let match;
      const products: PriceOffer[] = [];

      const norm = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");

      const targetNorm = norm(cleanTitle);

      while ((match = scriptRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1]);
          const list = data["@graph"] || (Array.isArray(data) ? data : [data]);

          for (const node of list) {
            if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
              for (const el of node.itemListElement) {
                const item = el.item;
                if (
                  item &&
                  item.offers &&
                  typeof item.offers.price === "number" &&
                  item.offers.price > 8 // filter out non-book trinkets/bookmarks
                ) {
                  const itemNorm = norm(item.name || "");
                  // Check if product title matches or contains key words
                  const matches =
                    itemNorm.includes(targetNorm) ||
                    targetNorm.includes(itemNorm) ||
                    cleanTitle
                      .toLowerCase()
                      .split(" ")
                      .filter((w) => w.length > 3)
                      .some((w) => item.name.toLowerCase().includes(w));

                  if (matches) {
                    products.push({
                      title: item.name,
                      price: item.offers.price,
                      url: item.url,
                      image: item.image,
                      store: "Estante Virtual",
                    });
                  }
                }
              }
            }
          }
        } catch {
          // ignore json parse error
        }
      }

      if (products.length > 0) {
        // Sort lowest price first
        products.sort((a, b) => a.price - b.price);
        const best = products[0];

        return {
          found: true,
          lowestPrice: best.price,
          storeName: best.store,
          productUrl: best.url,
          coverUrl: best.image,
          offers: products.slice(0, 5),
          comparisonLinks,
        };
      }
    }
  } catch (err) {
    console.warn("Falha ao consultar preços na Estante Virtual:", err);
  }

  // Fallback: estimate based on standard book price in BRL
  const estimatedFallbackPrice = 49.9;

  return {
    found: false,
    lowestPrice: estimatedFallbackPrice,
    storeName: "Busca de Lojas",
    productUrl: comparisonLinks.amazonUrl,
    offers: [],
    comparisonLinks,
  };
}
