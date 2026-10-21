"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Loader2,
  Sparkles,
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
  existingWishlistTitles?: Set<string>;
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
  existingWishlistTitles = new Set(),
  defaultBook,
}: AddWishlistModalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState(defaultBook?.title || "");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Added books tracking in this modal session
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Optional target price
  const [targetPrice, setTargetPrice] = useState("");

  // Manual fallback state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualCover, setManualCover] = useState("");

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(defaultBook?.title || "");
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setAddingId(null);
      setShowManualForm(false);
      setTargetPrice("");
      setManualTitle("");
      setManualAuthor("");
      setManualCover("");
    }
  }, [isOpen, defaultBook]);

  // Books from shelf that can be imported
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

  // Check if book is already in wishlist
  function isAlreadyInWishlist(book: BookSearchResult): boolean {
    if (addedBookIds.has(book.id)) return true;
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
    const target = norm(book.title);

    if (existingWishlistTitles.has(target)) return true;

    for (const t of existingWishlistTitles) {
      if (
        (target.length > 5 && t.includes(target)) ||
        (t.length > 5 && target.includes(t))
      ) {
        return true;
      }
    }

    return false;
  }

  // 1-Click Add Book directly from search result
  async function handleAddBookDirectly(book: BookSearchResult) {
    if (addingId || isAlreadyInWishlist(book)) return;

    setAddingId(book.id);
    setError(null);

    try {
      const parsedTarget = targetPrice ? parseFloat(targetPrice) : undefined;
      const matchingShelfBook = shelfBooks.find(
        (b) =>
          b.title.toLowerCase().replace(/[^a-z0-9]/g, "") ===
          book.title.toLowerCase().replace(/[^a-z0-9]/g, "")
      );

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl || undefined,
          isbn: book.isbn || undefined,
          targetPrice: parsedTarget,
          userBookId: matchingShelfBook?.id || defaultBook?.userBookId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao adicionar livro.");
        return;
      }

      setAddedBookIds((prev) => new Set([...prev, book.id]));
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setAddingId(null);
    }
  }

  // Add from Shelf dropdown
  async function handleAddShelfBook(bookId: string) {
    if (!bookId || addingId) return;
    const found = shelfBooks.find((b) => b.id === bookId);
    if (!found) return;

    setAddingId(found.id);
    setError(null);

    try {
      const parsedTarget = targetPrice ? parseFloat(targetPrice) : undefined;

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: found.title,
          author: found.author,
          coverUrl: found.coverUrl || undefined,
          targetPrice: parsedTarget,
          userBookId: found.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao adicionar livro.");
        return;
      }

      setAddedBookIds((prev) => new Set([...prev, found.id]));
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Erro ao adicionar livro.");
    } finally {
      setAddingId(null);
    }
  }

  // Add manual
  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitle.trim()) {
      setError("Informe o título do livro.");
      return;
    }

    setAddingId("manual");
    setError(null);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle.trim(),
          author: manualAuthor.trim() || undefined,
          coverUrl: manualCover.trim() || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
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
      setError("Erro ao conectar ao servidor.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e0e13] border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Novo Livro no Radar de Preços
              </h2>
              <p className="text-xs text-zinc-400">
                Pesquise e adicione com 1 clique. O Farol busca o menor preço e avisa se ele cair!
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

        {/* Target Price Pre-Configuration (Optional) */}
        <div className="mt-3 flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5 font-medium shrink-0">
            <span>🎯</span>
            <span>Preço Alvo Opcional:</span>
          </span>
          <div className="flex items-center gap-1.5 w-44">
            <span className="text-zinc-500">R$</span>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 35.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {!showManualForm ? (
          <div className="mt-3 space-y-3 flex-1 flex flex-col min-h-0">
            {/* Shelf import option */}
            {wantToReadBooks.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Importar da sua estante (&ldquo;Quero Ler&rdquo;)</span>
                </label>
                <select
                  onChange={(e) => {
                    handleAddShelfBook(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">-- Escolha um livro para adicionar ao radar --</option>
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
                Pesquisar livro pelo nome ou autor:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: O despertar da lua caída, Harry Potter, Duna..."
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

            {/* Results list with 1-click addition */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[340px]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
                  <p className="text-xs">Buscando no acervo nacional...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((book) => {
                  const alreadyAdded = isAlreadyInWishlist(book);
                  const isAdding = addingId === book.id;

                  return (
                    <div
                      key={book.id}
                      className="p-3 rounded-2xl bg-[#14141d] hover:bg-[#191924] border border-zinc-800/80 transition-all flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Cover from API */}
                        <div className="w-12 h-16 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                          {book.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base">📖</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            por <span className="text-zinc-200">{book.author}</span>
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

                      {/* 1-Click Action Button */}
                      {alreadyAdded ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 select-none">
                          <Check className="w-3.5 h-3.5" />
                          <span>No Radar</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddBookDirectly(book)}
                          disabled={isAdding}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Buscando preço...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Monitorar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
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
                    Digite o título para buscar capa e menor preço automaticamente!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manual Form */
          <form onSubmit={handleAddManual} className="mt-4 space-y-3">
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

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                ← Voltar para busca por API
              </button>

              <button
                type="submit"
                disabled={addingId === "manual"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer"
              >
                {addingId === "manual" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Cadastrar</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          {!showManualForm ? (
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

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
