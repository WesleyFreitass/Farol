"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Loader2,
  Sparkles,
  DollarSign,
  BookOpen,
  Check,
  TrendingDown,
  Info,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import { BookSearchResult } from "@/app/api/books/search/route";

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shelfBooks?: Book[];
  defaultBook?: {
    title: string;
    author: string;
    coverUrl?: string | null;
    userBookId?: string;
  } | null;
}

export function AddWishlistModal({
  isOpen,
  onClose,
  onSuccess,
  shelfBooks = [],
  defaultBook,
}: AddWishlistModalProps) {
  // Search query & results from API
  const [searchQuery, setSearchQuery] = useState(defaultBook?.title || "");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Selected book to add
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(
    defaultBook
      ? {
          id: defaultBook.userBookId || "manual_default",
          title: defaultBook.title,
          author: defaultBook.author,
          totalPages: 0,
          coverUrl: defaultBook.coverUrl || null,
          publishedYear: null,
          language: "Português 🇧🇷",
          format: "Físico",
          description: null,
        }
      : null
  );

  // Optional Target Price
  const [targetPrice, setTargetPrice] = useState("");
  // Optional manual price override
  const [manualPrice, setManualPrice] = useState("");

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual fallback inputs
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualCover, setManualCover] = useState("");

  // Filter shelf books in "Quero Ler"
  const wantToReadBooks = shelfBooks.filter(
    (b) => b.status === "WANT_TO_READ" || b.status === "READING"
  );

  // Search API debounce
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);
    setHasSearched(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          lang: "pt",
          format: "all",
        });

        const res = await fetch(`/api/books/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error("Erro na busca de livros:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  function handleSelectBook(book: BookSearchResult) {
    setSelectedBook(book);
    setError(null);
  }

  function handleSelectShelfBook(bookId: string) {
    const found = shelfBooks.find((b) => b.id === bookId);
    if (found) {
      setSelectedBook({
        id: found.id,
        title: found.title,
        author: found.author,
        totalPages: found.totalPages,
        coverUrl: found.coverUrl || null,
        publishedYear: null,
        language: "Português 🇧🇷",
        format: "Físico",
        description: found.notes || null,
      });
      setError(null);
    }
  }

  async function handleAddSelectedBook(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedBook && !showManualForm) {
      setError("Pesquise e selecione um livro da lista.");
      return;
    }

    const titleToAdd = showManualForm ? manualTitle.trim() : selectedBook?.title;
    const authorToAdd = showManualForm
      ? manualAuthor.trim()
      : selectedBook?.author || "Autor desconhecido";
    const coverToAdd = showManualForm
      ? manualCover.trim() || undefined
      : selectedBook?.coverUrl || undefined;

    if (!titleToAdd) {
      setError("Informe o título do livro.");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToAdd,
          author: authorToAdd,
          coverUrl: coverToAdd,
          isbn: selectedBook?.isbn || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          initialPrice: manualPrice ? parseFloat(manualPrice) : undefined,
          userBookId:
            selectedBook && shelfBooks.some((b) => b.id === selectedBook.id)
              ? selectedBook.id
              : defaultBook?.userBookId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao adicionar livro.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Novo Livro no Radar de Preços
              </h2>
              <p className="text-xs text-zinc-400">
                O Farol busca capa, dados da API e o menor preço de mercado automaticamente!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Selected Book Banner Preview (if a book was chosen) */}
        {selectedBook && !showManualForm && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-15 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                {selectedBook.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base">📖</span>
                )}
              </div>

              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Livro Selecionado
                </span>
                <h4 className="text-sm font-bold text-white truncate">
                  {selectedBook.title}
                </h4>
                <p className="text-xs text-zinc-300 truncate">
                  por {selectedBook.author}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Trocar
            </button>
          </div>
        )}

        {/* Search & Selection Section */}
        {!selectedBook && !showManualForm && (
          <div className="mt-4 space-y-3 flex-1 flex flex-col min-h-0">
            {/* Quick shelf import dropdown if user has books */}
            {wantToReadBooks.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ou escolha da sua estante (&ldquo;Quero Ler&rdquo;)</span>
                </label>
                <select
                  onChange={(e) => handleSelectShelfBook(e.target.value)}
                  defaultValue=""
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">-- Selecionar da estante --</option>
                  {wantToReadBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} - {b.author}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Search Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Pesquisar livro na API (Google Books / Catálogo Nacional)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite o título (ex: Harry Potter, Duna, Game of Thrones)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 focus:border-amber-500 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[320px]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
                  <p className="text-xs">Buscando edições e capas na API...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className="p-3 rounded-2xl bg-[#14141d] hover:bg-[#191924] border border-zinc-800/80 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Cover from API */}
                      <div className="w-11 h-15 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                        {book.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-base">📖</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          por {book.author}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-zinc-800/80 text-zinc-300">
                            {book.language}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-zinc-800/80 text-zinc-400">
                            {book.format}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectBook(book);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/20 transition-all shrink-0 cursor-pointer"
                    >
                      Selecionar
                    </button>
                  </div>
                ))
              ) : hasSearched && searchQuery.trim().length >= 2 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                  <p className="text-xs">Nenhum livro encontrado com esse termo.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualForm(true);
                      setManualTitle(searchQuery);
                    }}
                    className="mt-2 text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Deseja cadastrar manualmente?
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
                  <Sparkles className="w-6 h-6 text-amber-400/40 mb-2" />
                  <p className="text-xs">
                    Comece digitando o nome do livro para puxar a capa e dados automaticamente!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Form Toggle / View */}
        {showManualForm && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Título do Livro *
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex: O Nome do Vento"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Autor
              </label>
              <input
                type="text"
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                placeholder="Ex: Patrick Rothfuss"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                URL da Capa (opcional)
              </label>
              <input
                type="url"
                value={manualCover}
                onChange={(e) => setManualCover(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
            >
              ← Voltar para busca automática por API
            </button>
          </div>
        )}

        {/* Price Target and Submission section (when book is selected or manual) */}
        {(selectedBook || showManualForm) && (
          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preço Alvo Desejado (R$) <span className="text-zinc-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 35.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preço Atual de Referência <span className="text-zinc-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Auto (busca nas livrarias)"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Ao confirmar, o Farol fará a consulta do menor preço em tempo real no mercado e salvará o valor para monitorar quedas futuras!
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          {!showManualForm && !selectedBook ? (
            <button
              type="button"
              onClick={() => setShowManualForm(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Não encontrou? Cadastrar manualmente
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={adding}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleAddSelectedBook()}
              disabled={adding || (!selectedBook && !showManualForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando Menor Preço...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar ao Radar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
