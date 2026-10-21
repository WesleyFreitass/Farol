"use client";

import { useState } from "react";
import { X, Search, Plus, Loader2, Sparkles, DollarSign, BookOpen } from "lucide-react";
import { Book } from "./BookDetailModal";

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
  const [title, setTitle] = useState(defaultBook?.title || "");
  const [author, setAuthor] = useState(defaultBook?.author || "");
  const [coverUrl, setCoverUrl] = useState(defaultBook?.coverUrl || "");
  const [targetPrice, setTargetPrice] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [selectedShelfBookId, setSelectedShelfBookId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter shelf books that are in "Quero Ler"
  const wantToReadBooks = shelfBooks.filter(
    (b) => b.status === "WANT_TO_READ" || b.status === "READING"
  );

  function handleSelectShelfBook(bookId: string) {
    setSelectedShelfBookId(bookId);
    const found = shelfBooks.find((b) => b.id === bookId);
    if (found) {
      setTitle(found.title);
      setAuthor(found.author);
      setCoverUrl(found.coverUrl || "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Informe o título do livro.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          initialPrice: initialPrice ? parseFloat(initialPrice) : undefined,
          userBookId: selectedShelfBookId || defaultBook?.userBookId || undefined,
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
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Novo Livro no Radar de Preços
              </h2>
              <p className="text-xs text-zinc-400">
                O Farol buscará o menor preço e avisará se ele cair!
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
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Select from shelf if available */}
          {wantToReadBooks.length > 0 && !defaultBook && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Importar da sua estante (&ldquo;Quero Ler&rdquo;)</span>
              </label>
              <select
                value={selectedShelfBookId}
                onChange={(e) => handleSelectShelfBook(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">-- Escolher livro da estante ou digitar abaixo --</option>
                {wantToReadBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Título do Livro *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: O Nome do Vento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Autor
            </label>
            <input
              type="text"
              placeholder="Ex: Patrick Rothfuss"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Preço Atual (R$) <span className="text-zinc-500 font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Busca automática se vazio"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

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
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              URL da Capa <span className="text-zinc-500 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Ao adicionar, o Farol fará a varredura nas livrarias e marketplaces parceiros, registrará o menor valor e passará a monitorar descontos!
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando Preço...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar ao Radar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
