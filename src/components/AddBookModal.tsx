"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Book,
  User,
  Hash,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Search,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import { BookSearchResult } from "@/app/api/books/search/route";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
  // Search query & results
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Selected or manual book fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState<number | string>(300);
  const [currentPage, setCurrentPage] = useState<number | string>(0);
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("READING");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-search as the user types
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/books/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  function handleSelectBook(book: BookSearchResult) {
    setTitle(book.title);
    setAuthor(book.author);
    setTotalPages(book.totalPages || 250);
    setCoverUrl(book.coverUrl || "");
    setShowDropdown(false);
  }

  function handleClearSelection() {
    setTitle("");
    setAuthor("");
    setTotalPages(300);
    setCurrentPage(0);
    setCoverUrl("");
    setNotes("");
    setSearchQuery("");
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          totalPages: Number(totalPages),
          currentPage: Number(currentPage),
          coverUrl: coverUrl || undefined,
          status,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao adicionar livro.");
      }

      onSuccess();
      onClose();
      handleClearSelection();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao adicionar livro.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isBookChosen = Boolean(title.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
            📚
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Adicionar Livro à Estante</h2>
            <p className="text-xs text-slate-400">
              Busca automática de capas, páginas e autores
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Input Box */}
        <div className="relative mb-6">
          <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Buscar Livro (Título ou Autor)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setManualMode(!manualMode);
                setShowDropdown(false);
              }}
              className="text-[11px] font-normal text-slate-400 hover:text-amber-300 transition-colors underline cursor-pointer"
            >
              {manualMode ? "Usar busca online" : "Preencher tudo manualmente"}
            </button>
          </label>

          {!manualMode && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ex: Harry Potter, Torto Arado, Dom Casmurro..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none shadow-inner"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-3" />
              )}
            </div>
          )}

          {/* Autocomplete Results Dropdown */}
          {!manualMode && showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-800/80 p-1.5">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Resultados encontrados ({searchResults.length})
              </div>
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="flex items-center gap-3 p-2.5 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                    {book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-amber-300 truncate">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span>{book.totalPages} págs</span>
                      {book.publishedYear && (
                        <>
                          <span>•</span>
                          <span>{book.publishedYear}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium px-2 py-1 rounded-md bg-amber-500/10">
                    Selecionar
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Book Preview Banner */}
        {isBookChosen && (
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center gap-4">
            <div className="w-12 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xl shadow-md">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>📖</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-0.5">
                <Check className="w-3 h-3 text-amber-400" />
                Livro Selecionado
              </span>
              <h3 className="text-sm font-bold text-white truncate">{title}</h3>
              <p className="text-xs text-slate-400 truncate">{author}</p>
            </div>

            <button
              type="button"
              onClick={handleClearSelection}
              title="Trocar ou limpar livro"
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar</span>
            </button>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Título do Livro *
            </label>
            <div className="relative">
              <Book className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ex: Cem Anos de Solidão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Autor(a) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ex: Gabriel García Márquez"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total de Páginas *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="300"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Página Onde Parou
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min={0}
                  max={Number(totalPages) || 9999}
                  placeholder="0"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Status na Estante
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "READING", label: "Lendo", icon: "📖" },
                { id: "WANT_TO_READ", label: "Quero Ler", icon: "🔖" },
                { id: "READ", label: "Lido", icon: "✅" },
                { id: "DROPPED", label: "Pausado", icon: "⏸️" },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatus(st.id)}
                  className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                    status === st.id
                      ? "border-amber-500/80 bg-amber-500/10 text-amber-300 shadow-sm"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-base mb-0.5">{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              URL da Capa
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="url"
                placeholder="Preenchida automaticamente pela busca..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notas ou Sinopse (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Anotações sobre a edição, onde conheceu o livro..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !author.trim()}
              className="py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                "Adicionar à Estante"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
