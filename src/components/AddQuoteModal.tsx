"use client";

import { useState } from "react";
import { X, Quote, BookOpen, Plus, Loader2 } from "lucide-react";
import { Book } from "./BookDetailModal";

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shelfBooks?: Book[];
}

export function AddQuoteModal({
  isOpen,
  onClose,
  onSuccess,
  shelfBooks = [],
}: AddQuoteModalProps) {
  const [selectedBookId, setSelectedBookId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleSelectBook(id: string) {
    setSelectedBookId(id);
    const found = shelfBooks.find((b) => b.id === id);
    if (found) {
      setBookTitle(found.title);
      setAuthor(found.author);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote.trim()) {
      setError("Digite o trecho ou citação.");
      return;
    }
    if (!bookTitle.trim()) {
      setError("Informe o livro de onde é a citação.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: bookTitle.trim(),
          author: author.trim() || undefined,
          quote: quote.trim(),
          pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar citação.");
        return;
      }

      onSuccess();
      onClose();
      // Reset
      setQuote("");
      setBookTitle("");
      setAuthor("");
      setPageNumber("");
      setSelectedBookId("");
    } catch (err) {
      console.error(err);
      setError("Erro ao se comunicar com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Nova Citação Marcante
              </h2>
              <p className="text-xs text-zinc-400">
                Guarde suas passagens favoritas e a página correspondente no seu perfil
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Quick select from shelf */}
          {shelfBooks.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Escolher livro da sua estante:</span>
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => handleSelectBook(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-amber-500"
              >
                <option value="">-- Selecione ou digite manualmente abaixo --</option>
                {shelfBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Citação ou Trecho do Livro *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ex: Não há nada como um sonho para criar o futuro..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 resize-none italic leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Título do Livro *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Os Miseráveis"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Autor
              </label>
              <input
                type="text"
                placeholder="Ex: Victor Hugo"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Página do Livro <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              placeholder="Ex: 142"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publicar no Perfil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
