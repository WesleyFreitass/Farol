import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Procurando usuário Fimose...");

  // Busca pelo usuário Fimose (nome ou email)
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: "Fimose" } },
        { email: { equals: "wesleyafreitas@outlook.com" } },
      ],
    },
  });

  if (!user) {
    console.log("⚠️ Usuário Fimose não encontrado pelo nome/email. Buscando primeiro usuário da base...");
    user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  if (!user) {
    console.error("❌ Nenhum usuário encontrado na base de dados para injetar dados de teste!");
    return;
  }

  console.log(`✅ Usuário alvo identificado: ${user.name} (ID: ${user.id}, Email: ${user.email})`);

  // 1. Atualizar perfil de Fimose
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Fimose",
      bio: "Faroleiro ávido, colecionador de edições raras e explorador de ficção científica & literatura clássica.",
      themeColor: "cosmic_nebula",
      themeOpacity: 85,
      replayMonth: "current",
      readingGoal: 24,
      avatarFrame: "gold",
    },
  });
  console.log("🎨 Perfil de Fimose atualizado com tema cosmic_nebula e moldura de ouro.");

  // 2. Limpar dados anteriores de teste do usuário
  await prisma.readingSession.deleteMany({
    where: { userBook: { userId: user.id } },
  });
  await prisma.userBook.deleteMany({
    where: { userId: user.id },
  });
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id },
  });
  await prisma.userQuote.deleteMany({
    where: { userId: user.id },
  });
  console.log("🧹 Dados prévios de Fimose limpos com segurança para novo seed completo.");

  // 3. Inserir livros na estante
  const booksToCreate = [
    {
      title: "Duna",
      author: "Frank Herbert",
      coverUrl: "https://m.media-amazon.com/images/I/81zN7udGRUL._SL1500_.jpg",
      totalPages: 680,
      currentPage: 342,
      status: "READING",
      genre: "Ficção Científica",
      rating: 5,
      startDate: new Date("2026-10-01"),
      sessions: [
        { page: 80, emotion: ["curiosa", "fascinada"], note: "A ambientação em Arrakis é surrealmente densa." },
        { page: 160, emotion: ["tensa", "intrigada"], note: "A intriga política dos Harkonnen e o plano contra os Atreides." },
        { page: 245, emotion: ["tensa", "chocada"], note: "O ataque noturno a Arrakeen. Paul e Jessica no deserto." },
        { page: 342, emotion: ["empolgada", "inspirada"], note: "O encontro com os Fremen e o ritual da água." },
      ],
    },
    {
      title: "Cem Anos de Solidão",
      author: "Gabriel García Márquez",
      coverUrl: "https://m.media-amazon.com/images/I/81S8A2gQ1SL._SL1500_.jpg",
      totalPages: 448,
      currentPage: 190,
      status: "READING",
      genre: "Realismo Mágico",
      rating: 5,
      startDate: new Date("2026-10-05"),
      sessions: [
        { page: 60, emotion: ["curiosa", "encantada"], note: "A fundação de Macondo e as invenções dos ciganos de Melquíades." },
        { page: 125, emotion: ["reflexiva", "nostalgica"], note: "A peste da insônia e a perda das memórias dos objetos." },
        { page: 190, emotion: ["reflexiva"], note: "As guerras do Coronel Aureliano Buendía." },
      ],
    },
    {
      title: "Dom Casmurro",
      author: "Machado de Assis",
      coverUrl: "https://m.media-amazon.com/images/I/71u9sW4jQGL._SL1500_.jpg",
      totalPages: 256,
      currentPage: 256,
      status: "READ",
      genre: "Clássico Brasileiro",
      rating: 5,
      startDate: new Date("2026-09-01"),
      finishDate: new Date("2026-09-18"),
      sessions: [
        { page: 70, emotion: ["curiosa"], note: "Capitu e Bentinho na infância de olhos de ressaca." },
        { page: 160, emotion: ["tensa"], note: "O seminário e as cartas apaixonadas." },
        { page: 256, emotion: ["reflexiva", "chocada"], note: "O ciúme obsessivo de Bentinho. Traição ou loucura narrativa?" },
      ],
    },
    {
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://m.media-amazon.com/images/I/819js3EQwbL._SL1500_.jpg",
      totalPages: 336,
      currentPage: 336,
      status: "READ",
      genre: "Distopia",
      rating: 5,
      startDate: new Date("2026-08-10"),
      finishDate: new Date("2026-08-25"),
      sessions: [
        { page: 110, emotion: ["tensa"], note: "O Grande Irmão está sempre te observando." },
        { page: 220, emotion: ["chocada"], note: "O diário secreto e o romance proibido no quarto acima do antiquário." },
        { page: 336, emotion: ["chocada", "desolada"], note: "Quarto 101. Final visceral e inesquecível." },
      ],
    },
    {
      title: "Flores para Algernon",
      author: "Daniel Keyes",
      coverUrl: "https://m.media-amazon.com/images/I/815uX7wkOZS._SL1500_.jpg",
      totalPages: 288,
      currentPage: 288,
      status: "READ",
      genre: "Ficção Científica",
      rating: 5,
      startDate: new Date("2026-09-20"),
      finishDate: new Date("2026-09-29"),
      sessions: [
        { page: 90, emotion: ["emocionada"], note: "A evolução da escrita e ortografia de Charlie nos relatórios de progresso." },
        { page: 195, emotion: ["reflexiva", "inspirada"], note: "O pico intelectual e a dolorosa solidão da genialidade." },
        { page: 288, emotion: ["emocionada", "desolada"], note: "Por favor, se tiverem chance, coloquem flores no túmulo de Algernon." },
      ],
    },
    {
      title: "Torto Arado",
      author: "Itamar Vieira Junior",
      coverUrl: "https://m.media-amazon.com/images/I/81mDcfImsFL._SL1500_.jpg",
      totalPages: 264,
      currentPage: 264,
      status: "READ",
      genre: "Literatura Brasileira",
      rating: 5,
      startDate: new Date("2026-07-02"),
      finishDate: new Date("2026-07-15"),
      sessions: [
        { page: 85, emotion: ["emocionada"], note: "O facão prateado e a voz que se dividiu entre as irmãs Bibiana e Belonísia." },
        { page: 180, emotion: ["inspirada"], note: "A resistência da comunidade de Água Negra e a espiritualidade Jarê." },
        { page: 264, emotion: ["empolgada", "inspirada"], note: "Uma obra-prima da literatura contemporânea brasileira." },
      ],
    },
    {
      title: "O Pequeno Príncipe",
      author: "Antoine de Saint-Exupéry",
      coverUrl: "https://m.media-amazon.com/images/I/71OzyTG2zCL._SL1500_.jpg",
      totalPages: 96,
      currentPage: 96,
      status: "READ",
      genre: "Fábula",
      rating: 4,
      startDate: new Date("2026-10-10"),
      finishDate: new Date("2026-10-11"),
      sessions: [
        { page: 50, emotion: ["nostalgica"], note: "Desenha-me um carneiro. Os baobás no asteroide B-612." },
        { page: 96, emotion: ["emocionada"], note: "O essencial é invisível aos olhos." },
      ],
    },
    {
      title: "Fundação",
      author: "Isaac Asimov",
      coverUrl: "https://m.media-amazon.com/images/I/815yvB1e7zL._SL1500_.jpg",
      totalPages: 240,
      currentPage: 240,
      status: "READ",
      genre: "Ficção Científica",
      rating: 5,
      startDate: new Date("2026-06-15"),
      finishDate: new Date("2026-06-28"),
    },
    {
      title: "A Revolução dos Bichos",
      author: "George Orwell",
      coverUrl: "https://m.media-amazon.com/images/I/91Bc80qnO-L._SL1500_.jpg",
      totalPages: 152,
      currentPage: 152,
      status: "READ",
      genre: "Sátira Política",
      rating: 4,
      startDate: new Date("2026-05-10"),
      finishDate: new Date("2026-05-14"),
    },
    {
      title: "O Senhor dos Anéis: A Sociedade do Anel",
      author: "J.R.R. Tolkien",
      coverUrl: "https://m.media-amazon.com/images/I/81SM0D5+DwL._SL1500_.jpg",
      totalPages: 576,
      currentPage: 576,
      status: "READ",
      genre: "Alta Fantasia",
      rating: 5,
      startDate: new Date("2026-04-01"),
      finishDate: new Date("2026-04-28"),
    },
    {
      title: "O Hobbit",
      author: "J.R.R. Tolkien",
      coverUrl: "https://m.media-amazon.com/images/I/91M9xPIf10L._SL1500_.jpg",
      totalPages: 310,
      currentPage: 140,
      status: "READING",
      genre: "Fantasia",
      rating: 5,
      startDate: new Date("2026-10-18"),
    },
    {
      title: "Neuromancer",
      author: "William Gibson",
      coverUrl: "https://m.media-amazon.com/images/I/81M+aO8z-qL._SL1500_.jpg",
      totalPages: 320,
      currentPage: 0,
      status: "WANT_TO_READ",
      genre: "Cyberpunk",
    },
    {
      title: "Ensaio Sobre a Cegueira",
      author: "José Saramago",
      coverUrl: "https://m.media-amazon.com/images/I/81yvM7d66ML._SL1500_.jpg",
      totalPages: 312,
      currentPage: 0,
      status: "WANT_TO_READ",
      genre: "Ficção",
    },
    {
      title: "Crime e Castigo",
      author: "Fiódor Dostoiévski",
      coverUrl: "https://m.media-amazon.com/images/I/81b37rG290L._SL1500_.jpg",
      totalPages: 592,
      currentPage: 0,
      status: "WANT_TO_READ",
      genre: "Clássico Russo",
    },
  ];

  const createdBookIds: string[] = [];

  for (const b of booksToCreate) {
    const percentage = Number(((b.currentPage / b.totalPages) * 100).toFixed(1));
    const createdBook = await prisma.userBook.create({
      data: {
        userId: user.id,
        title: b.title,
        author: b.author,
        coverUrl: b.coverUrl,
        totalPages: b.totalPages,
        currentPage: b.currentPage,
        currentPercentage: percentage,
        status: b.status,
        genre: b.genre,
        rating: b.rating || null,
        startDate: b.startDate || null,
        finishDate: b.finishDate || null,
      },
    });

    createdBookIds.push(createdBook.id);

    if (b.sessions && b.sessions.length > 0) {
      for (let i = 0; i < b.sessions.length; i++) {
        const s = b.sessions[i];
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - (b.sessions.length - i) * 3);
        const pPct = Number(((s.page / b.totalPages) * 100).toFixed(1));

        await prisma.readingSession.create({
          data: {
            userBookId: createdBook.id,
            pageRead: s.page,
            percentageRead: pPct,
            emotions: JSON.stringify(s.emotion),
            comment: s.note,
            readDate: sessionDate,
          },
        });
      }
    }
  }

  // Destaques de livros no perfil (os 3 primeiros)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      featuredBookIds: JSON.stringify(createdBookIds.slice(0, 3)),
    },
  });

  console.log(`📚 ${booksToCreate.length} livros e dezenas de sessões de leitura injetados na estante de Fimose.`);

  // 4. Inserir Citações Favoritas do Usuário (Quotes)
  const quotesToCreate = [
    {
      bookTitle: "Duna",
      author: "Frank Herbert",
      pageNumber: 22,
      quote: "Não devo ter medo. O medo é o assassino da mente. O medo é a pequena morte que traz a obliteração total. Encararei meu medo.",
    },
    {
      bookTitle: "Dom Casmurro",
      author: "Machado de Assis",
      pageNumber: 123,
      quote: "Capitu era Capitu, isto é, uma criatura mui diversa da que eu supusera.",
    },
    {
      bookTitle: "O Pequeno Príncipe",
      author: "Antoine de Saint-Exupéry",
      pageNumber: 72,
      quote: "Tu te tornas eternamente responsável por aquilo que cativas.",
    },
    {
      bookTitle: "Flores para Algernon",
      author: "Daniel Keyes",
      pageNumber: 288,
      quote: "A inteligência é um dos maiores dons humanos. Mas com frequência a busca pelo conhecimento expulsa a busca pelo amor.",
    },
  ];

  for (const q of quotesToCreate) {
    await prisma.userQuote.create({
      data: {
        userId: user.id,
        bookTitle: q.bookTitle,
        author: q.author,
        pageNumber: q.pageNumber,
        quote: q.quote,
      },
    });
  }
  console.log(`💬 ${quotesToCreate.length} citações marcantes cadastradas no perfil de Fimose.`);

  // 5. Inserir Itens no Radar de Desejos com Top 3 Lojas em ordem crescente
  const wishlistItemsToCreate = [
    {
      title: "O Silmarillion",
      author: "J.R.R. Tolkien",
      coverUrl: "https://m.media-amazon.com/images/I/81U5YQ0u-4L._SL1500_.jpg",
      initialPrice: 69.90,
      currentPrice: 48.90,
      lowestPrice: 48.90,
      targetPrice: 50.00,
      priceDropped: true,
      percentDrop: 30.0,
      storeName: "Amazon",
      productUrl: "https://www.amazon.com.br/s?k=O+Silmarillion+livro&i=stripbooks",
      offers: [
        { store: "Amazon", price: 48.90, url: "https://www.amazon.com.br/s?k=O+Silmarillion+livro&i=stripbooks" },
        { store: "Estante Virtual", price: 54.00, url: "https://www.estantevirtual.com.br/busca?q=O+Silmarillion" },
        { store: "Magalu", price: 59.90, url: "https://www.magazineluiza.com.br/busca/O+Silmarillion+livro/" },
      ],
    },
    {
      title: "Klara e o Sol",
      author: "Kazuo Ishiguro",
      coverUrl: "https://m.media-amazon.com/images/I/71jYy7Kx3yL._SL1500_.jpg",
      initialPrice: 59.00,
      currentPrice: 38.50,
      lowestPrice: 38.50,
      targetPrice: 40.00,
      priceDropped: true,
      percentDrop: 34.7,
      storeName: "Estante Virtual",
      productUrl: "https://www.estantevirtual.com.br/busca?q=Klara+e+o+Sol",
      offers: [
        { store: "Estante Virtual", price: 38.50, url: "https://www.estantevirtual.com.br/busca?q=Klara+e+o+Sol" },
        { store: "Amazon", price: 44.90, url: "https://www.amazon.com.br/s?k=Klara+e+o+Sol+livro&i=stripbooks" },
        { store: "Mercado Livre", price: 49.00, url: "https://lista.mercadolivre.com.br/Klara+e+o+Sol+livro" },
      ],
    },
    {
      title: "Fahrenheit 451",
      author: "Ray Bradbury",
      coverUrl: "https://m.media-amazon.com/images/I/81qZduZ0z0L._SL1500_.jpg",
      initialPrice: 42.00,
      currentPrice: 42.00,
      lowestPrice: 42.00,
      targetPrice: 35.00,
      priceDropped: false,
      percentDrop: 0,
      storeName: "Amazon",
      productUrl: "https://www.amazon.com.br/s?k=Fahrenheit+451+livro&i=stripbooks",
      offers: [
        { store: "Amazon", price: 42.00, url: "https://www.amazon.com.br/s?k=Fahrenheit+451+livro&i=stripbooks" },
        { store: "Magalu", price: 45.90, url: "https://www.magazineluiza.com.br/busca/Fahrenheit+451+livro/" },
        { store: "Mercado Livre", price: 49.90, url: "https://lista.mercadolivre.com.br/Fahrenheit+451+livro" },
      ],
    },
  ];

  for (const w of wishlistItemsToCreate) {
    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        title: w.title,
        author: w.author,
        coverUrl: w.coverUrl,
        initialPrice: w.initialPrice,
        currentPrice: w.currentPrice,
        lowestPrice: w.lowestPrice,
        targetPrice: w.targetPrice,
        priceDropped: w.priceDropped,
        percentDrop: w.percentDrop,
        storeName: w.storeName,
        productUrl: w.productUrl,
        storeOffers: JSON.stringify(w.offers),
        history: {
          create: [
            { price: w.initialPrice, storeName: w.storeName, recordedAt: new Date(Date.now() - 14 * 86400000) },
            { price: w.currentPrice, storeName: w.storeName, recordedAt: new Date() },
          ],
        },
      },
    });
  }
  console.log(`🎯 ${wishlistItemsToCreate.length} livros monitorados no radar com Top 3 lojas e histórico de preços.`);

  console.log("\n✨ Injeção de dados de teste concluída com sucesso exclusivo para Fimose!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
