import { NextResponse } from "next/server";

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverUrl: string | null;
  publishedYear: string | null;
  source: "openlibrary" | "googlebooks";
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  number_of_pages_median?: number;
  first_publish_year?: number;
  cover_i?: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = query.trim();
    const results: BookSearchResult[] = [];

    // 1. Tentar Open Library (gratuito, sem limites agressivos, ótimo para títulos em português)
    try {
      const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        cleanQuery
      )}&limit=8`;

      const olRes = await fetch(openLibUrl, {
        headers: {
          "User-Agent": "FarolApp/1.0 (farol.pampo.tech)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });

      if (olRes.ok) {
        const olData = await olRes.json();
        const docs: OpenLibraryDoc[] = olData.docs || [];

        for (const doc of docs) {
          const coverUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null;

          results.push({
            id: `ol_${doc.key.replace("/works/", "")}`,
            title: doc.title,
            author: doc.author_name ? doc.author_name.slice(0, 2).join(", ") : "Autor desconhecido",
            totalPages: doc.number_of_pages_median || 250,
            coverUrl,
            publishedYear: doc.first_publish_year ? String(doc.first_publish_year) : null,
            source: "openlibrary",
          });
        }
      }
    } catch (olErr) {
      console.warn("Falha ao consultar Open Library:", olErr);
    }

    // 2. Se Open Library não retornar resultados ou retornar poucos, tenta Google Books
    if (results.length < 3) {
      try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const keyParam = apiKey ? `&key=${apiKey}` : "";
        const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          cleanQuery
        )}&maxResults=5&printType=books${keyParam}`;

        const gbRes = await fetch(gbUrl, {
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        });

        if (gbRes.ok) {
          const gbData = await gbRes.json();
          const items = gbData.items || [];

          for (const item of items) {
            const info = item.volumeInfo || {};
            const thumb =
              info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
            const secureThumb = thumb ? thumb.replace(/^http:\/\//i, "https://") : null;

            // Evitar duplicados por título similar
            const alreadyExists = results.some(
              (r) => r.title.toLowerCase() === (info.title || "").toLowerCase()
            );

            if (!alreadyExists && info.title) {
              results.push({
                id: `gb_${item.id}`,
                title: info.title,
                author: info.authors ? info.authors.slice(0, 2).join(", ") : "Autor desconhecido",
                totalPages: info.pageCount || 250,
                coverUrl: secureThumb,
                publishedYear: info.publishedDate ? info.publishedDate.split("-")[0] : null,
                source: "googlebooks",
              });
            }
          }
        }
      } catch (gbErr) {
        console.warn("Falha ao consultar Google Books:", gbErr);
      }
    }

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("Erro geral na busca de livros:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar livros." },
      { status: 500 }
    );
  }
}
