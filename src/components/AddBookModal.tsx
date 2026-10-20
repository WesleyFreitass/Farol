"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ScanBarcode,
  Filter,
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
      <div className="relative w-full max-w-xl bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Pesquisar livro
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle prompt */}
        <p className="text-xs sm:text-sm font-medium text-zinc-300 mt-2 mb-2">
          Procure pela obra, autoria, ISBN ou link Amazon:
        </p>

        {/* Search Input Bar with Scan icon and Purple glow */}
        <div className="relative">
          <div className="relative flex items-center bg-[#15151e] border-2 border-purple-600/70 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-600/30 rounded-2xl transition-all shadow-inner">
            <div className="pl-3.5 pr-2 text-zinc-400">
              <ScanBarcode className="w-5 h-5" />
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Pelo menos 3 caracteres"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pr-10 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 mt-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181824] border border-zinc-800 text-xs font-medium text-zinc-200">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Filtros</span>
          </div>

          {/* Formato Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFormatMenu(!showFormatMenu);
                setShowLangMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                formatFilter !== "all"
                  ? "bg-purple-950/40 border-purple-500/60 text-purple-300"
                  : "bg-[#181824] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>
                {formatFilter === "all"
                  ? "Formato"
                  : formatFilter === "fisico"
                  ? "Físico 📖"
                  : "eBook 📱"}
              </span>
              <span className="text-[10px]">🔍</span>
            </button>

            {showFormatMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-36 bg-[#161622] border border-zinc-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFormatFilter("all");
                    setShowFormatMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800"
                >
                  Todos formatos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormatFilter("fisico");
                    setShowFormatMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800"
                >
                  📖 Livro Físico
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormatFilter("ebook");
                    setShowFormatMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800"
                >
                  📱 eBook / Digital
                </button>
              </div>
            )}
          </div>

          {/* Idioma Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowFormatMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                langFilter === "pt"
                  ? "bg-purple-950/40 border-purple-500/60 text-purple-300"
                  : "bg-[#181824] border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>
                {langFilter === "pt"
                  ? "Português 🇧🇷"
                  : langFilter === "en"
                  ? "Inglês 🇬🇧"
                  : "Todos Idiomas"}
              </span>
              <span className="text-[10px]">🔍</span>
            </button>

            {showLangMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-40 bg-[#161622] border border-zinc-800 rounded-xl shadow-xl z-30 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLangFilter("pt");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>Português 🇧🇷</span>
                  {langFilter === "pt" && <Check className="w-3 h-3 text-purple-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLangFilter("all");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>Todos os idiomas</span>
                  {langFilter === "all" && <Check className="w-3 h-3 text-purple-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLangFilter("en");
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>Inglês 🇬🇧</span>
                  {langFilter === "en" && <Check className="w-3 h-3 text-purple-400" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Books List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 min-h-[140px] max-h-[480px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Loader2 className="w-7 h-7 text-purple-500 animate-spin mb-2" />
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
                  className="bg-[#15151e] hover:bg-[#181824] border border-zinc-800/80 rounded-2xl p-4 transition-all shadow-sm"
                >
                  <div className="flex gap-4 items-start">
                    {/* Cover thumbnail */}
                    <div className="w-18 sm:w-22 h-26 sm:h-32 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>

                    {/* Book Information */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        {/* Title & Series */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-100 leading-tight">
                            {book.title}
                          </h3>
                          <div className="w-5 h-5 rounded-md border border-pink-500/40 bg-pink-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-pink-400" />
                          </div>
                        </div>

                        {/* Author */}
                        <p className="text-xs text-zinc-400 mt-1">
                          por <strong className="text-zinc-200">{book.author}</strong>
                        </p>

                        {/* Badges: Pages, Format, Language */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#20202e] text-zinc-300 border border-zinc-700/60">
                            {book.totalPages} pág.
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#20202e] text-zinc-300 border border-zinc-700/60">
                            <span>📖</span>
                            <span>{book.format}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#20202e] text-zinc-300 border border-zinc-700/60">
                            <span>{book.language}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action row: Info on the left, Button on the right */}
                      <div className="flex items-center justify-between pt-3 mt-1 border-t border-zinc-800/60">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedInfoId(isInfoExpanded ? null : book.id)
                          }
                          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Info</span>
                        </button>

                        {alreadyAdded ? (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/40 cursor-default">
                            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                            <span>Já adicionado</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isAdding}
                            onClick={() => handleAddBook(book)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-700 to-rose-700 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white transition-all shadow-md shadow-pink-950/30 cursor-pointer disabled:opacity-50"
                          >
                            {isAdding ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
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
                    <div className="mt-3 pt-3 border-t border-zinc-800/70 text-xs text-zinc-300 leading-relaxed bg-[#101018] p-3 rounded-xl border border-zinc-800/60 animate-in fade-in duration-150">
                      <p className="font-semibold text-zinc-200 mb-1">Sinopse / Detalhes:</p>
                      <p className="text-zinc-400">
                        {book.description ||
                          `Edição de ${book.title}, com ${book.totalPages} páginas, formato ${book.format}.`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : hasSearched && searchQuery.length >= 3 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm font-semibold text-zinc-300">
                Nenhum livro encontrado
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Tente buscar pelo título em português, nome do autor ou código ISBN.
              </p>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom with Centered Fechar Button */}
        <div className="pt-4 mt-2 border-t border-zinc-800/80 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-[#181824] hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
