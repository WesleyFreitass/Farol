import { NextResponse } from "next/server";

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverUrl: string | null;
  publishedYear: string | null;
  language: string;
  format: "Físico" | "eBook" | "Audiobook";
  description: string | null;
  series?: string | null;
  isbn?: string | null;
  genre?: string | null;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  number_of_pages_median?: number;
  first_publish_year?: number;
  cover_i?: number;
  language?: string[];
  series_name?: string[];
  series_position?: string;
  isbn?: string[];
  first_sentence?: string[] | { value: string };
}

// Catálogo de referência das edições brasileiras consagradas
const PORTUGUESE_CANONICAL_BOOKS: Record<
  string,
  {
    title: string;
    author: string;
    totalPages: number;
    coverUrl: string;
    language: string;
    format: "Físico" | "eBook";
    series?: string;
    description?: string;
    genre?: string;
  }[]
> = {
  throne: [
    {
      title: "A Guerra dos Tronos (As Crônicas de Gelo e Fogo, Livro 1)",
      author: "George R. R. Martin",
      totalPages: 600,
      coverUrl: "https://covers.openlibrary.org/b/id/9269962-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #1",
      description: "O primeiro livro da consagrada saga épica de George R. R. Martin em Westeros.",
      genre: "Alta Fantasia",
    },
    {
      title: "A Fúria dos Reis (As Crônicas de Gelo e Fogo, Livro 2)",
      author: "George R. R. Martin",
      totalPages: 656,
      coverUrl: "https://covers.openlibrary.org/b/id/8315180-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #2",
      description: "A guerra dos cinco reis começa a devastar os Sete Reinos.",
      genre: "Alta Fantasia",
    },
    {
      title: "A Tormenta de Espadas (As Crônicas de Gelo e Fogo, Livro 3)",
      author: "George R. R. Martin",
      totalPages: 884,
      coverUrl: "https://covers.openlibrary.org/b/id/8595260-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #3",
      description: "O Casamento Vermelho e o auge das intrigas políticas e militares.",
      genre: "Alta Fantasia",
    },
    {
      title: "O Festim dos Corvos (As Crônicas de Gelo e Fogo, Livro 4)",
      author: "George R. R. Martin",
      totalPages: 644,
      coverUrl: "https://covers.openlibrary.org/b/id/8447815-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #4",
      description: "As consequências da guerra e o vácuo de poder em Porto Real.",
      genre: "Alta Fantasia",
    },
    {
      title: "A Dança dos Dragões (As Crônicas de Gelo e Fogo, Livro 5)",
      author: "George R. R. Martin",
      totalPages: 872,
      coverUrl: "https://covers.openlibrary.org/b/id/8235113-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #5",
      description: "Daenerys em Meereen e Jon Snow na Muralha enfrentando o inverno que chegou.",
      genre: "Alta Fantasia",
    },
    {
      title: "Fogo & Sangue (Volume 1)",
      author: "George R. R. Martin",
      totalPages: 664,
      coverUrl: "https://covers.openlibrary.org/b/id/12063529-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "House of the Dragon",
      description: "A história dos reis Targaryen em Westeros, de Aegon, o Conquistador à Dança dos Dragões.",
      genre: "Alta Fantasia",
    },
  ],
  game: [
    {
      title: "A Guerra dos Tronos (As Crônicas de Gelo e Fogo, Livro 1)",
      author: "George R. R. Martin",
      totalPages: 600,
      coverUrl: "https://covers.openlibrary.org/b/id/9269962-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #1",
      description: "O primeiro livro da consagrada saga épica de George R. R. Martin em Westeros.",
      genre: "Alta Fantasia",
    },
    {
      title: "A Fúria dos Reis (As Crônicas de Gelo e Fogo, Livro 2)",
      author: "George R. R. Martin",
      totalPages: 656,
      coverUrl: "https://covers.openlibrary.org/b/id/8315180-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #2",
      description: "A guerra dos cinco reis começa a devastar os Sete Reinos.",
      genre: "Alta Fantasia",
    },
    {
      title: "A Tormenta de Espadas (As Crônicas de Gelo e Fogo, Livro 3)",
      author: "George R. R. Martin",
      totalPages: 884,
      coverUrl: "https://covers.openlibrary.org/b/id/8595260-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "As Crônicas de Gelo e Fogo, #3",
      description: "O Casamento Vermelho e o auge das intrigas políticas e militares.",
      genre: "Alta Fantasia",
    },
  ],
  harry: [
    {
      title: "Box Harry Potter Tradicional (Harry Potter, #1)",
      author: "J.K. Rowling",
      totalPages: 3067,
      coverUrl: "https://covers.openlibrary.org/b/id/15155833-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Harry Potter, #1",
      description: "Edição comemorativa especial em box com a saga completa de Harry Potter pela Editora Rocco.",
      genre: "Fantasia",
    },
    {
      title: "Harry Potter e a Câmara Secreta (Harry Potter, #2)",
      author: "J.K. Rowling",
      totalPages: 252,
      coverUrl: "https://covers.openlibrary.org/b/id/15158664-M.jpg",
      language: "Português",
      format: "Físico",
      series: "Harry Potter, #2",
      description: "Carros voadores, aranhas que falam e um aviso mortal escrito com sangue nas paredes de Hogwarts.",
      genre: "Fantasia",
    },
    {
      title: "Harry Potter and the Sorcerer's Stone (Harry Potter, #1)",
      author: "J.K. Rowling",
      totalPages: 309,
      coverUrl: "https://covers.openlibrary.org/b/id/10521270-M.jpg",
      language: "Inglês",
      format: "Físico",
      series: "Harry Potter, #1",
      description: "The classic first book in the global bestselling Harry Potter series.",
      genre: "Fantasia",
    },
    {
      title: "Harry Potter e a Pedra Filosofal (Harry Potter, #1)",
      author: "J.K. Rowling",
      totalPages: 223,
      coverUrl: "https://covers.openlibrary.org/b/id/14512053-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Harry Potter, #1",
      description: "Harry Potter descobre no seu 11º aniversário que é um bruxo e é convidado a ingressar em Hogwarts.",
      genre: "Fantasia",
    },
    {
      title: "Harry Potter e o Prisioneiro de Azkaban (Harry Potter, #3)",
      author: "J.K. Rowling",
      totalPages: 348,
      coverUrl: "https://covers.openlibrary.org/b/id/10580435-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Harry Potter, #3",
      description: "Sirius Black fugiu de Azkaban e os dementadores estão rondando Hogwarts.",
      genre: "Fantasia",
    },
  ],
  potter: [
    {
      title: "Harry Potter e o Cálice de Fogo (Harry Potter, #4)",
      author: "J.K. Rowling",
      totalPages: 536,
      coverUrl: "https://covers.openlibrary.org/b/id/12059372-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Harry Potter, #4",
      genre: "Fantasia",
    },
    {
      title: "Harry Potter e a Ordem da Fênix (Harry Potter, #5)",
      author: "J.K. Rowling",
      totalPages: 704,
      coverUrl: "https://covers.openlibrary.org/b/id/15158666-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Harry Potter, #5",
      genre: "Fantasia",
    },
  ],
  senhor: [
    {
      title: "O Senhor dos Anéis: A Sociedade do Anel (#1)",
      author: "J.R.R. Tolkien",
      totalPages: 464,
      coverUrl: "https://covers.openlibrary.org/b/id/8389364-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "O Senhor dos Anéis, #1",
      genre: "Fantasia",
    },
    {
      title: "O Senhor dos Anéis: As Duas Torres (#2)",
      author: "J.R.R. Tolkien",
      totalPages: 416,
      coverUrl: "https://covers.openlibrary.org/b/id/8389367-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "O Senhor dos Anéis, #2",
      genre: "Fantasia",
    },
  ],
  percy: [
    {
      title: "O Ladrão de Raios (Percy Jackson, #1)",
      author: "Rick Riordan",
      totalPages: 400,
      coverUrl: "https://covers.openlibrary.org/b/id/10521257-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Percy Jackson, #1",
      genre: "Fantasia & Aventura",
    },
    {
      title: "O Mar de Monstros (Percy Jackson, #2)",
      author: "Rick Riordan",
      totalPages: 304,
      coverUrl: "https://covers.openlibrary.org/b/id/10521258-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      series: "Percy Jackson, #2",
      genre: "Fantasia & Aventura",
    },
  ],
  carrie: [
    {
      title: "Carrie, a Estranha",
      author: "Stephen King",
      totalPages: 200,
      coverUrl: "https://covers.openlibrary.org/b/id/9256043-L.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      description: "O primeiro romance de Stephen King narra a trágica história de Carrie White, uma jovem com poderes telecinéticos atormentada pela mãe religiosa e pelos colegas de escola.",
      genre: "Terror & Horror",
    },
  ],
  misery: [
    {
      title: "Misery: Louca Obsessão",
      author: "Stephen King",
      totalPages: 328,
      coverUrl: "https://covers.openlibrary.org/b/id/8314130-M.jpg",
      language: "Português 🇧🇷",
      format: "Físico",
      description: "Paul Sheldon, um famoso escritor, sofre um grave acidente e é resgatado por sua fã número um, Annie Wilkes.",
      genre: "Suspense & Mistério",
    },
  ],
};

function inferGenre(title: string, author?: string): string {
  const t = (title + " " + (author || "")).toLowerCase();
  if (
    t.includes("harry potter") ||
    t.includes("percy jackson") ||
    t.includes("senhor dos anéis") ||
    t.includes("hobbit") ||
    t.includes("nárnia") ||
    t.includes("mago") ||
    t.includes("bruxo") ||
    t.includes("feitiço") ||
    t.includes("targaryen") ||
    t.includes("game of thrones") ||
    t.includes("trono") ||
    t.includes("dragão") ||
    t.includes("fantasia")
  ) {
    return "Fantasia";
  }
  if (
    t.includes("duna") ||
    t.includes("neuromancer") ||
    t.includes("fundação") ||
    t.includes("asimov") ||
    t.includes("sci-fi") ||
    t.includes("espaço") ||
    t.includes("galáxia") ||
    t.includes("interestelar") ||
    t.includes("1984") ||
    t.includes("admirável mundo novo") ||
    t.includes("distopia")
  ) {
    return "Ficção Científica";
  }
  if (
    t.includes("agatha christie") ||
    t.includes("sherlock") ||
    t.includes("holmes") ||
    t.includes("assassinato") ||
    t.includes("morte") ||
    t.includes("crime") ||
    t.includes("garota no trem") ||
    t.includes("garota exemplar") ||
    t.includes("verity") ||
    t.includes("suspense") ||
    t.includes("mistério")
  ) {
    return "Suspense & Mistério";
  }
  if (
    t.includes("stephen king") ||
    t.includes("dracula") ||
    t.includes("frankenstein") ||
    t.includes("terror") ||
    t.includes("horror") ||
    t.includes("medo") ||
    t.includes("fantasma") ||
    t.includes("it a coisa")
  ) {
    return "Terror & Horror";
  }
  if (
    t.includes("amor") ||
    t.includes("romance") ||
    t.includes("orgulho e preconceito") ||
    t.includes("é assim que acaba") ||
    t.includes("é assim que começa") ||
    t.includes("colleen hoover") ||
    t.includes("paixão") ||
    t.includes("coração") ||
    t.includes("querido john") ||
    t.includes("namorado")
  ) {
    return "Romance";
  }
  if (
    t.includes("hábito") ||
    t.includes("poder") ||
    t.includes("financeiro") ||
    t.includes("mente") ||
    t.includes("produtividade") ||
    t.includes("pai rico") ||
    t.includes("segredos") ||
    t.includes("inteligência") ||
    t.includes("desenvolvimento") ||
    t.includes("autoajuda") ||
    t.includes("ansiedade") ||
    t.includes("coragem")
  ) {
    return "Desenvolvimento Pessoal";
  }
  if (
    t.includes("biografia") ||
    t.includes("história") ||
    t.includes("sapiens") ||
    t.includes("guerra") ||
    t.includes("memórias") ||
    t.includes("diário de anne frank") ||
    t.includes("vidas")
  ) {
    return "História & Biografia";
  }
  if (
    t.includes("filosofia") ||
    t.includes("ética") ||
    t.includes("república") ||
    t.includes("nietzsche") ||
    t.includes("platão") ||
    t.includes("sociedade") ||
    t.includes("política") ||
    t.includes("capital")
  ) {
    return "Filosofia & Sociedade";
  }
  return "Ficção Geral";
}

// Dicionário de títulos internacionais para português
const FAMOUS_TRANSLATIONS: Record<string, string> = {
  "harry potter and the philosopher's stone": "Harry Potter e a Pedra Filosofal (Harry Potter, #1)",
  "harry potter and the sorcerer's stone": "Harry Potter e a Pedra Filosofal (Harry Potter, #1)",
  "harry potter and the chamber of secrets": "Harry Potter e a Câmara Secreta (Harry Potter, #2)",
  "harry potter and the prisoner of azkaban": "Harry Potter e o Prisioneiro de Azkaban (Harry Potter, #3)",
  "harry potter and the goblet of fire": "Harry Potter e o Cálice de Fogo (Harry Potter, #4)",
  "harry potter and the order of the phoenix": "Harry Potter e a Ordem da Fênix (Harry Potter, #5)",
  "harry potter and the half-blood prince": "Harry Potter e o Enigma do Príncipe (Harry Potter, #6)",
  "harry potter and the deathly hallows": "Harry Potter e as Relíquias da Morte (Harry Potter, #7)",
  "the hobbit": "O Hobbit",
  "the fellowship of the ring": "O Senhor dos Anéis: A Sociedade do Anel (#1)",
  "the two towers": "O Senhor dos Anéis: As Duas Torres (#2)",
  "the return of the king": "O Senhor dos Anéis: O Retorno do Rei (#3)",
  "the hunger games": "Jogos Vorazes (Jogos Vorazes, #1)",
  "catching fire": "Em Chamas (Jogos Vorazes, #2)",
  "mockingjay": "A Esperança (Jogos Vorazes, #3)",
  "the lightning thief": "O Ladrão de Raios (Percy Jackson, #1)",
  "the sea of monsters": "O Mar de Monstros (Percy Jackson, #2)",
  "the little prince": "O Pequeno Príncipe",
  "le petit prince": "O Pequeno Príncipe",
  "animal farm": "A Revolução dos Bichos",
  "1984": "1984",
  "brave new world": "Admirável Mundo Novo",
  "to kill a mockingbird": "O Sol é Para Todos",
  "dune": "Duna (Duna, #1)",
  "carrie": "Carrie, a Estranha",
  "misery": "Misery: Louca Obsessão",
  "the shining": "O Iluminado",
  "it": "It: A Coisa",
  "pet sematary": "O Cemitério",
  "salem's lot": "A Hora do Vampiro",
  "the stand": "A Dança da Morte",
};

function formatAuthorSlug(slug?: string): string {
  if (!slug || slug === "N/A" || slug === "") return "Autor desconhecido";
  const parts = slug.split("-").filter(Boolean);
  const cap = (s: string) =>
    ["de", "da", "do", "das", "dos", "e"].includes(s.toLowerCase())
      ? s.toLowerCase()
      : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  if (parts.length === 1) return cap(parts[0]);
  if (parts.length === 2) {
    // parker-sarah -> Sarah Parker; king-stephen -> Stephen King
    return `${cap(parts[1])} ${cap(parts[0])}`;
  }
  if (parts.length === 3 && parts[2].length === 1) {
    // parker-sarah-a -> Sarah A. Parker
    return `${cap(parts[1])} ${parts[2].toUpperCase()}. ${cap(parts[0])}`;
  }
  if (parts.length === 3 && parts[1].length === 1 && parts[2].length === 1) {
    // rowling-j-k -> J. K. Rowling
    return `${parts[1].toUpperCase()}. ${parts[2].toUpperCase()}. ${cap(parts[0])}`;
  }
  if (parts.length === 4 && parts[1].length === 1) {
    // tolkien-j-r-r -> J. R. R. Tolkien
    return `${parts[1].toUpperCase()}. ${parts[2].toUpperCase()}. ${parts[3].toUpperCase()}. ${cap(parts[0])}`;
  }
  return parts.map(cap).join(" ");
}

function cleanBookTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  const cleaned = rawTitle
    .replace(
      /\s*[-–—]\s*(Edição especial|em capa dura|com pintura trilateral|A continuação de .*?|Colecção Argonauta|Volume \d+).*$/i,
      ""
    )
    .trim();
  return cleaned || rawTitle;
}

async function searchEstanteVirtual(query: string): Promise<BookSearchResult[]> {
  try {
    // Normalização inteligente de digitação em português (ex: cansao -> canção, dragoes -> dragões)
    const normalizedQuery = query
      .replace(/\bcansao\b/gi, "canção")
      .replace(/\bdragoes\b/gi, "dragões")
      .replace(/\bcaida\b/gi, "caída");

    const res = await fetch(
      `https://www.estantevirtual.com.br/busca?q=${encodeURIComponent(normalizedQuery)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return [];

    const html = await res.text();

    // 1. Mapeia autores a partir dos dados de e-commerce da página (dataLayer)
    const authorByItemName = new Map<string, string>();
    const dataLayerMatch = html.match(/dataLayer\s*=\s*(\[[\s\S]*?\]);/);
    if (dataLayerMatch) {
      try {
        const parsed = JSON.parse(dataLayerMatch[1]);
        for (const entry of parsed) {
          const impressions = entry?.ecommerce?.impressions || [];
          for (const imp of impressions) {
            const rawBrand = imp.item_brand || imp.brand;
            const author = formatAuthorSlug(rawBrand);
            if (author && imp.name) {
              authorByItemName.set(imp.name.toLowerCase().trim(), author);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Extrai produtos com dados estruturados oficiais (JSON-LD ItemList)
    const results: BookSearchResult[] = [];
    const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const list = data["@graph"] || (Array.isArray(data) ? data : [data]);
        for (const node of list) {
          if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
            for (const el of node.itemListElement) {
              const item = el.item;
              if (item && item.name) {
                const rawName: string = item.name;
                const rawLower = rawName.toLowerCase();
                // Exclui combos/kits promocionais agrupados caso o usuário não busque por kit
                if (
                  !query.toLowerCase().includes("kit") &&
                  !query.toLowerCase().includes("combo") &&
                  /^(kit|combo|box com \d+|lote de)\b/i.test(rawName)
                ) {
                  continue;
                }

                // Verifica se ao menos uma palavra-chave principal da busca está contida no título
                const queryKeywords = query
                  .toLowerCase()
                  .split(/\s+/)
                  .filter((w) => w.length > 2);
                const matchesKeyword =
                  queryKeywords.length === 0 ||
                  queryKeywords.some((w) => rawLower.includes(w));
                if (!matchesKeyword) {
                  continue;
                }

                const title = cleanBookTitle(rawName);
                const rawAuthor =
                  authorByItemName.get(rawName.toLowerCase().trim()) ||
                  formatAuthorSlug(item.brand?.name);

                // Rejeita itens com autor inválido ou 'Cadastrado Nao' / 'Diversos'
                if (
                  !rawAuthor ||
                  /cadastrado|diversos|desconhecido/i.test(rawAuthor)
                ) {
                  continue;
                }

                const author = rawAuthor;

                const id =
                  "ev_" +
                  (item.sku ||
                    item.url?.split("/").pop() ||
                    Math.random().toString(36).slice(2));

                results.push({
                  id,
                  title,
                  author,
                  totalPages: 320,
                  coverUrl: item.image || null,
                  publishedYear: null,
                  language: "Português 🇧🇷",
                  format: "Físico",
                  description: null,
                  genre: inferGenre(title, author),
                });
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return results;
  } catch (err) {
    console.warn("Falha ao consultar Estante Virtual:", err);
    return [];
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingArticles(text: string): string {
  return text.replace(/^(o|a|os|as|um|uma|uns|umas|the|an)\s+/i, "");
}

function computeRelevanceScore(book: BookSearchResult, query: string): number {
  const normQuery = normalizeText(query);
  const normTitle = normalizeText(book.title || "");
  const normAuthor = normalizeText(book.author || "");
  const stripTitle = stripLeadingArticles(normTitle);
  const stripQuery = stripLeadingArticles(normQuery);

  let score = 0;

  // 1. Título exato
  if (normTitle === normQuery) {
    score += 1200;
  } else if (
    stripTitle === stripQuery ||
    stripTitle === normQuery ||
    normTitle === stripQuery
  ) {
    score += 1050;
  }
  // 2. Título começa com o termo de busca
  else if (normTitle.startsWith(normQuery)) {
    score += 750;
  } else if (
    stripTitle.startsWith(normQuery) ||
    stripTitle.startsWith(stripQuery)
  ) {
    score += 700;
  }
  // 3. A busca começa com o título (ex: busca por "carrie a estranha stephen king")
  else if (normQuery.startsWith(normTitle) || stripQuery.startsWith(stripTitle)) {
    score += 600;
  }
  // 4. Palavra inteira presente no título
  else {
    const escaped = normQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordRegex = new RegExp(`\\b${escaped}\\b`, "i");
    if (wordRegex.test(normTitle)) {
      const idx = normTitle.indexOf(normQuery);
      score += Math.max(100, 450 - Math.min(250, idx * 6));
    } else if (normTitle.includes(normQuery)) {
      score += 200;
    }
  }

  // Palavras individuais da busca presentes no título
  const queryWords = normQuery.split(" ").filter((w) => w.length > 1);
  if (queryWords.length > 1) {
    const matchingWords = queryWords.filter((w) => normTitle.includes(w)).length;
    if (matchingWords === queryWords.length) {
      score += 300;
    } else {
      score += matchingWords * 60;
    }
  }

  // Correspondência de Autor
  if (normAuthor === normQuery) {
    score += 500;
  } else if (normAuthor.startsWith(normQuery) || normQuery.includes(normAuthor)) {
    score += 350;
  } else {
    const authorWords = normAuthor.split(" ").filter((w) => w.length > 2);
    const matchingAuthorWords = authorWords.filter((w) =>
      normQuery.includes(w)
    ).length;
    if (matchingAuthorWords > 0) {
      score += matchingAuthorWords * 150;
    }
  }

  // Bônus de concisão (título curto e direto mais fiel à busca)
  if (normTitle.includes(normQuery) || normQuery.includes(normTitle)) {
    const lenDiff = Math.abs(normTitle.length - normQuery.length);
    score += Math.max(0, 80 - lenDiff * 2);
  }

  // Priorização por idioma em Português
  if (book.language && book.language.includes("Português")) {
    score += 150;
  }

  // Bônus se tiver imagem de capa válida
  if (book.coverUrl) {
    score += 80;
  }

  // Bônus se for obra do catálogo canônico
  if (book.id.startsWith("canon_")) {
    score += 60;
  }

  return score;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const langFilter = searchParams.get("lang") || "all"; // "all" | "pt" | "en"
    const formatFilter = searchParams.get("format") || "all"; // "all" | "fisico" | "ebook"

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const cleanQuery = query.trim().toLowerCase();
    const results: BookSearchResult[] = [];

    // 0. Se for um ISBN (apenas números de 10 ou 13 dígitos)
    const cleanedDigits = cleanQuery.replace(/\D/g, "");
    if (cleanedDigits.length === 10 || cleanedDigits.length === 13) {
      try {
        const brRes = await fetch(
          `https://brasilapi.com.br/api/isbn/v1/${cleanedDigits}`,
          { next: { revalidate: 3600 } }
        );
        if (brRes.ok) {
          const brData = await brRes.json();
          results.push({
            id: `isbn_${cleanedDigits}`,
            title: brData.title,
            author: brData.authors ? brData.authors.join(", ") : "Autor desconhecido",
            totalPages: brData.page_count || 250,
            coverUrl: brData.cover_url || null,
            publishedYear: brData.year ? String(brData.year) : null,
            language: "Português 🇧🇷",
            format: "Físico",
            description: brData.synopsis || null,
            isbn: cleanedDigits,
            genre: inferGenre(
              brData.title,
              brData.authors ? brData.authors.join(", ") : undefined
            ),
          });
        }
      } catch (err) {
        console.warn("Falha na consulta ISBN BrasilAPI:", err);
      }
    }

    // 1. Checa se temos correspondência no catálogo canônico em português
    for (const [key, books] of Object.entries(PORTUGUESE_CANONICAL_BOOKS)) {
      if (cleanQuery.includes(key)) {
        for (const b of books) {
          results.push({
            id: `canon_${b.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            title: b.title,
            author: b.author,
            totalPages: b.totalPages,
            coverUrl: b.coverUrl,
            publishedYear: null,
            language: b.language,
            format: b.format,
            series: b.series,
            description: b.description || null,
            genre: b.genre || inferGenre(b.title, b.author),
          });
        }
      }
    }

    // 2. Consulta concorrente em paralelo: Open Library + Estante Virtual
    const [olResult, evResult] = await Promise.allSettled([
      // A. Open Library (catálogo internacional e traduções)
      (async (): Promise<BookSearchResult[]> => {
        const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
          cleanQuery
        )}&limit=12&fields=key,title,author_name,number_of_pages_median,cover_i,language,first_publish_year,series_name,series_position,isbn`;

        const olRes = await fetch(olUrl, {
          headers: {
            "User-Agent": "FarolApp/1.0 (farol.pampo.tech)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 3600 },
        });

        if (!olRes.ok) return [];
        const olData = await olRes.json();
        const docs: OpenLibraryDoc[] = olData.docs || [];
        const olBooks: BookSearchResult[] = [];

        for (const doc of docs) {
          const rawTitle = doc.title || "";
          const lowerTitle = rawTitle.toLowerCase().trim();

          // Tradução automática de títulos consagrados se disponível
          let finalTitle = FAMOUS_TRANSLATIONS[lowerTitle] || rawTitle;

          // Se tiver informação de série e o título não contiver #, formata com a série
          if (doc.series_name && doc.series_name[0] && !finalTitle.includes("#")) {
            const seriesTag = doc.series_position
              ? ` (${doc.series_name[0]}, #${doc.series_position})`
              : ` (${doc.series_name[0]})`;
            finalTitle = `${finalTitle}${seriesTag}`;
          }

          // Detecta se é em português
          const hasPort =
            doc.language?.includes("por") ||
            doc.language?.includes("pt") ||
            finalTitle !== rawTitle ||
            /[ãõáéíóúâêîôûç]/i.test(finalTitle);

          const language = hasPort
            ? "Português 🇧🇷"
            : doc.language?.includes("eng")
            ? "Inglês"
            : doc.language?.includes("spa")
            ? "Espanhol"
            : "Português";

          const coverUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null;

          if (finalTitle) {
            const author = doc.author_name
              ? doc.author_name.slice(0, 2).join(", ")
              : "Autor desconhecido";
            olBooks.push({
              id: `ol_${doc.key.replace("/works/", "")}`,
              title: finalTitle,
              author,
              totalPages: doc.number_of_pages_median || 260,
              coverUrl,
              publishedYear: doc.first_publish_year
                ? String(doc.first_publish_year)
                : null,
              language,
              format: "Físico",
              description: null,
              isbn: doc.isbn ? doc.isbn[0] : null,
              genre: inferGenre(finalTitle, author),
            });
          }
        }
        return olBooks;
      })(),

      // B. Estante Virtual (acervo nacional)
      (async (): Promise<BookSearchResult[]> => {
        return await searchEstanteVirtual(cleanQuery);
      })(),
    ]);

    // Mescla os resultados de OpenLibrary sem duplicatas
    if (olResult.status === "fulfilled") {
      for (const b of olResult.value) {
        const isDuplicate = results.some(
          (r) =>
            r.title.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            b.title.toLowerCase().replace(/[^a-z0-9]/g, "")
        );
        if (!isDuplicate) {
          results.push(b);
        }
      }
    } else {
      console.warn("Falha na consulta Open Library:", olResult.reason);
    }

    // Mescla os resultados da Estante Virtual sem duplicatas
    if (evResult.status === "fulfilled") {
      for (const b of evResult.value) {
        const isDuplicate = results.some(
          (r) =>
            r.title.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            b.title.toLowerCase().replace(/[^a-z0-9]/g, "")
        );
        if (!isDuplicate) {
          results.push(b);
        }
      }
    } else {
      console.warn("Falha na consulta Estante Virtual:", evResult.reason);
    }

    // 3. Ordenação inteligente por relevância textual, exatidão e idioma
    results.sort((a, b) => {
      const scoreA = computeRelevanceScore(a, cleanQuery);
      const scoreB = computeRelevanceScore(b, cleanQuery);
      return scoreB - scoreA;
    });

    // 4. Aplicação de filtros de idioma e formato
    let filtered = results;
    if (langFilter === "pt") {
      filtered = filtered.filter((r) => r.language.includes("Português"));
    } else if (langFilter === "en") {
      filtered = filtered.filter((r) => r.language.includes("Inglês"));
    }

    if (formatFilter === "fisico") {
      filtered = filtered.filter((r) => r.format === "Físico");
    } else if (formatFilter === "ebook") {
      filtered = filtered.filter((r) => r.format === "eBook");
    }

    return NextResponse.json({ results: filtered.slice(0, 15) });
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
