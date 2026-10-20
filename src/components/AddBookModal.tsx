"use client";

import { useState } from "react";
import { X, Book, User, Hash, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState<number | string>(300);
  const [currentPage, setCurrentPage] = useState<number | string>(0);
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("READING");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      // Reset form
      setTitle("");
      setAuthor("");
      setTotalPages(300);
      setCurrentPage(0);
      setCoverUrl("");
      setNotes("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
            📚
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Adicionar Livro na Estante</h2>
            <p className="text-xs text-slate-400">Cadastre um novo título para registrar seu progresso</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

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
                Página Atual
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
              URL da Capa (Opcional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="url"
                placeholder="https://exemplo.com/capa.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notas ou Sinopse Inicial (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Onde conheceu o livro, expectativas, edição..."
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
              disabled={loading}
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
