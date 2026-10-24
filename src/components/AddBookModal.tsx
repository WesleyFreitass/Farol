"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ScanBarcode,
  Search,
  Check,
  AlertTriangle,
  Plus,
  Loader2,
  Info,
  BookOpen,
} from "lucide-react";
import { BookSearchResult } from "@/app/api/books/search/route";
import { Book } from "./BookDetailModal";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingBooks?: Book[];
}

export function AddBookModal({
  isOpen,
  onClose,
  onSuccess,
  existingBooks = [],
}: AddBookModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [formatFilter, setFormatFilter] = useState<string>("all"); // "all" | "fisico" | "ebook"
  const [langFilter, setLangFilter] = useState<string>("pt"); // default to "pt" as requested!
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // State to track added books in this session
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [expandedInfoId, setExpandedInfoId] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or run search when query, language or format changes
  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
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
          lang: langFilter,
          format: formatFilter,
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
  }, [searchQuery, langFilter, formatFilter, isOpen]);

  if (!isOpen) return null;

  // Helper to check if book is already in shelf
  function isAlreadyAdded(book: BookSearchResult): boolean {
    if (addedBookIds.has(book.id)) return true;

    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
    const target = norm(book.title);

    return existingBooks.some((eb) => {
      const ebNorm = norm(eb.title);
      return (
        ebNorm === target ||
        (target.length > 5 && ebNorm.includes(target)) ||
        (ebNorm.length > 5 && target.includes(ebNorm))
      );
    });
  }

  // Quick 1-click add book
  async function handleAddBook(book: BookSearchResult) {
    if (isAlreadyAdded(book) || addingId) return;

    setAddingId(book.id);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          totalPages: book.totalPages || 250,
          currentPage: 0,
          coverUrl: book.coverUrl || undefined,
          status: "READING",
          notes: book.description || undefined,
          genre: book.genre || "Ficção Geral",
        }),
      });

      if (res.ok) {
        setAddedBookIds((prev) => new Set([...prev, book.id]));
        onSuccess();
      }
    } catch (err) {
      console.error("Erro ao adicionar livro:", err);
    } finally {
      setAddingId(null);
    }
  }

  function handleClear() {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d1420] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ScanBarcode className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Pesquisar Livro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle prompt */}
        <p className="text-xs text-slate-400 mt-3 mb-2">
          Procure pela obra, autoria, ISBN ou link da Amazon:
        </p>

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <div className="relative flex items-center bg-[#131b29] border border-slate-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl transition-all shadow-inner">
            <div className="pl-3.5 pr-2 text-slate-400">
              <Search className="w-4 h-4 text-amber-400/80" />
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Digite o título ou autor (mín. 3 letras)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pr-10 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Books List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 min-h-[140px] max-h-[480px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-2" />
              <p className="text-xs">Buscando edições em português...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((book) => {
              const alreadyAdded = isAlreadyAdded(book);
              const isAdding = addingId === book.id;
              const isInfoExpanded = expandedInfoId === book.id;

              return (
                <div
                  key={book.id}
                  className="bg-[#121927] hover:bg-[#162032] border border-slate-800 rounded-2xl p-3.5 transition-all shadow-md"
                >
                  <div className="flex gap-3.5 items-start">
                    {/* Cover thumbnail */}
                    <div className="w-16 sm:w-20 h-24 sm:h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    {/* Book Information */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        {/* Title & Series */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-xs sm:text-sm text-slate-100 leading-tight">
                            {book.title}
                          </h3>
                        </div>

                        {/* Author */}
                        <p className="text-xs text-slate-400 mt-0.5">
                          por <strong className="text-slate-300 font-semibold">{book.author}</strong>
                        </p>

                        {/* Badges: Pages, Format, Language */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            {book.totalPages} pág.
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            <span>📖</span>
                            <span>{book.format}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            <span>{book.language}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action row: Info on the left, Button on the right */}
                      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedInfoId(isInfoExpanded ? null : book.id)
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isInfoExpanded ? "Menos info" : "Ver sinopse"}</span>
                        </button>

                        {alreadyAdded ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Na Estante</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isAdding}
                            onClick={() => handleAddBook(book)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                          >
                            {isAdding ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Adicionando...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Info / Synopsis */}
                  {isInfoExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-[#0b101a] p-3 rounded-xl border border-slate-800/80 animate-in fade-in duration-150">
                      <p className="font-semibold text-amber-300 mb-1">Sinopse:</p>
                      <p className="text-slate-400 leading-relaxed">
                        {book.description ||
                          `Edição de ${book.title}, com ${book.totalPages} páginas.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : hasSearched && searchQuery.length >= 3 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
              <p className="text-2xl mb-1.5">🔍</p>
              <p className="text-xs font-semibold text-slate-300">
                Nenhum livro encontrado
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                Tente buscar pelo título em português, nome do autor ou código ISBN.
              </p>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom with Centered Fechar Button */}
        <div className="pt-3 mt-1 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
