"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { AuthModal } from "@/components/AuthModal";
import { AddBookModal } from "@/components/AddBookModal";
import { BookCard } from "@/components/BookCard";
import { BookDetailModal, Book } from "@/components/BookDetailModal";
import { ReadingStatsView } from "@/components/ReadingStatsView";
import { WishlistView } from "@/components/WishlistView";
import { ProfileView } from "@/components/ProfileView";
import { ShelfSpinesView } from "@/components/ShelfSpinesView";
import { CommunityView } from "@/components/CommunityView";
import { Plus, Search, BookOpen, Sparkles, Heart, Compass, LayoutGrid, Library, BarChart3, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filters & Search & Tab
  const [activeTab, setActiveTab] = useState<
    "shelf" | "stats" | "wishlist" | "community" | "profile"
  >("shelf");
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [shelfViewMode, setShelfViewMode] = useState<"grid" | "spines">("grid");
  const [wishlistDroppedCount, setWishlistDroppedCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Check auth on load
  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  // Fetch books
  async function loadBooks() {
    if (!user) return;
    setLoadingBooks(true);
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
    } finally {
      setLoadingBooks(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadBooks();
    } else {
      setBooks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reload selected book after update
  async function handleBookUpdated() {
    loadBooks();
    if (selectedBook) {
      try {
        const res = await fetch(`/api/books/${selectedBook.id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedBook(data.book);
        }
      } catch (err) {
        console.error("Erro ao recarregar livro:", err);
      }
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSelectedBook(null);
  }

  // Compute stats
  const stats = useMemo(() => {
    return {
      total: books.length,
      reading: books.filter((b) => b.status === "READING").length,
      read: books.filter((b) => b.status === "READ").length,
    };
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesStatus =
        statusFilter === "ALL" || book.status === statusFilter;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [books, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]" />

      {/* Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setViewProfileUserId(null);
          setActiveTab(tab);
        }}
        wishlistDroppedCount={wishlistDroppedCount}
        stats={stats}
      />

      {/* Main Content */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 pb-28 sm:pb-12">
        {loadingUser ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Acendendo o Farol...</p>
          </div>
        ) : !user ? (
          /* Public Hero Section when not logged in */
          <div className="flex flex-col items-center text-center justify-center py-16 sm:py-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>O seu guia e diário de leitura pessoal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
              Registre cada página e sinta cada{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                emoção
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              O Farol é o aplicativo definitivo para acompanhar suas leituras,
              progresso por páginas ou porcentagem e registrar com precisão como cada capítulo tocou você.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Começar Agora Gratuitamente
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl text-left">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">44 Emoções Mapeadas</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  De curiosa e inspirada a surtada e eufórica. Registre as nuances de cada momento com o livro.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Progresso Flexível</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Atualize sua leitura por número de páginas ou porcentagem, com data e histórico cronológico.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Estante Individual</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Cada usuário possui login exclusivo, estantes próprias e histórico de leitura 100% seguro e protegido.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "stats" ? (
          <ReadingStatsView books={books} />
        ) : activeTab === "wishlist" ? (
          <WishlistView
            books={books}
            onWishlistCountChange={(_total, dropped) =>
              setWishlistDroppedCount(dropped)
            }
          />
        ) : activeTab === "community" ? (
          <CommunityView
            onSelectBook={(book) => setSelectedBook(book)}
            currentUserId={user?.id}
            existingBooks={books}
            onBookAdded={loadBooks}
            onViewProfile={(targetUserId) => {
              setViewProfileUserId(targetUserId);
              setActiveTab("profile");
            }}
          />
        ) : activeTab === "profile" ? (
          <ProfileView
            shelfBooks={books}
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateTab={(tab) => {
              setViewProfileUserId(null);
              setActiveTab(tab);
            }}
            viewUserId={viewProfileUserId}
            onBack={() => {
              setViewProfileUserId(null);
              setActiveTab("community");
            }}
          />
        ) : (
          /* Authenticated Dashboard - Estante */
          <div>
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Olá, {user.name.split(" ")[0]}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Sua estante possui {books.length} título(s). O que você vai ler hoje?
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* 3D Spines vs Grid View Switcher */}
                <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShelfViewMode("grid")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      shelfViewMode === "grid"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Modo Grade de Capas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Capas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShelfViewMode("spines")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      shelfViewMode === "spines"
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Modo Estante de Madeira com Lombadas 3D"
                  >
                    <Library className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lombadas 3D</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsAddBookOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Livro</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar (Item 17) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-slate-900/60 p-2 sm:p-3 rounded-2xl border border-slate-800/80">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: "ALL", label: "Todos", count: stats.total },
                  { id: "READING", label: "Lendo", count: stats.reading },
                  {
                    id: "WANT_TO_READ",
                    label: "Quero Ler",
                    count: books.filter((b) => b.status === "WANT_TO_READ").length,
                  },
                  { id: "READ", label: "Lidos", count: stats.read },
                  {
                    id: "DROPPED",
                    label: "Pausados",
                    count: books.filter((b) => b.status === "DROPPED").length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/80 text-slate-400">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar na estante..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bookshelf Display (Grid vs 3D Spines) */}
            {loadingBooks ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs">Carregando seus livros...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              shelfViewMode === "spines" ? (
                <ShelfSpinesView
                  books={filteredBooks}
                  onSelectBook={(book) => setSelectedBook(book)}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={() => setSelectedBook(book)}
                    />
                  ))}
                </div>
              )
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-slate-900/40 border border-slate-800/60">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Library className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Nenhum livro encontrado com esses filtros"
                    : "Sua estante ainda está vazia"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1.5">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Tente buscar por outro termo ou alterar o status selecionado."
                    : "Adicione seu primeiro livro para começar a registrar seu progresso e emoções de leitura!"}
                </p>

                <button
                  onClick={() => setIsAddBookOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Livro Agora</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-1 text-slate-400">
          <span>Farol</span>
          <span>&bull;</span>
          <span>farol.pampo.tech</span>
        </div>
        <p>Acompanhe suas leituras, ilumine suas emoções.</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSuccess={loadBooks}
        existingBooks={books}
      />

      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onBookUpdated={handleBookUpdated}
      />
    </div>
  );
}
