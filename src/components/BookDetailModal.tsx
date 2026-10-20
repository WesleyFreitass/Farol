"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Sparkles,
  BookOpen,
  MessageSquare,
  Search,
  Check,
  Trash2,
  Loader2,
  Clock,
  Star,
} from "lucide-react";
import { READING_EMOTIONS, EMOTIONS_BY_ID } from "@/lib/emotions";

export interface ReadingSession {
  id: string;
  pageRead: number;
  percentageRead: number;
  readDate: string;
  comment?: string | null;
  emotions: string; // JSON string
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  totalPages: number;
  currentPage: number;
  currentPercentage: number;
  status: string;
  notes?: string | null;
  rating?: number | null;
  startDate?: string | null;
  finishDate?: string | null;
  sessions?: ReadingSession[];
}

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onBookUpdated: () => void;
}

export function BookDetailModal({
  book,
  isOpen,
  onClose,
  onBookUpdated,
}: BookDetailModalProps) {
  // Mode: "page" | "percentage"
  const [mode, setMode] = useState<"page" | "percentage">("page");
  const [pageValue, setPageValue] = useState<string>("");
  const [percentageValue, setPercentageValue] = useState<string>("");
  const [readDate, setReadDate] = useState<string>("");
  const [comment, setComment] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [emotionSearch, setEmotionSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");

  const [savingSession, setSavingSession] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReadDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  // Filter emotions based on search and category
  const filteredEmotions = READING_EMOTIONS.filter((emotion) => {
    const matchesSearch =
      emotion.label.toLowerCase().includes(emotionSearch.toLowerCase()) ||
      emotion.id.toLowerCase().includes(emotionSearch.toLowerCase());
    const matchesCategory =
      categoryFilter === "todas" || emotion.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function toggleEmotion(emotionId: string) {
    setSelectedEmotions((prev) =>
      prev.includes(emotionId)
        ? prev.filter((id) => id !== emotionId)
        : [...prev, emotionId]
    );
  }

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault();
    if (!book) return;
    setError(null);
    setSavingSession(true);

    try {
      const payload: Record<string, unknown> = {
        readDate,
        comment: comment || undefined,
        emotions: selectedEmotions,
      };

      if (mode === "page") {
        if (!pageValue) throw new Error("Informe a página alcançada.");
        payload.pageRead = Number(pageValue);
      } else {
        if (!percentageValue) throw new Error("Informe a porcentagem lida.");
        payload.percentageRead = Number(percentageValue);
      }

      const res = await fetch(`/api/books/${book.id}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar leitura.");
      }

      // Reset session form
      setPageValue("");
      setPercentageValue("");
      setComment("");
      setSelectedEmotions([]);
      onBookUpdated();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao registrar leitura.");
      }
    } finally {
      setSavingSession(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    if (!book) return;
    try {
      await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onBookUpdated();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  }

  async function handleUpdateRating(rating: number) {
    if (!book) return;
    try {
      await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      onBookUpdated();
    } catch (err) {
      console.error("Erro ao atualizar avaliação:", err);
    }
  }

  async function handleDeleteBook() {
    if (!book) return;
    if (!confirm("Tem certeza que deseja remover este livro da sua estante?")) {
      return;
    }

    setDeleting(true);
    try {
      await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      onBookUpdated();
      onClose();
    } catch (err) {
      console.error("Erro ao excluir livro:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Book Header Card */}
        <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-slate-800">
          {/* Cover */}
          <div className="w-24 sm:w-32 h-36 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700/60 overflow-hidden shrink-0 shadow-lg flex items-center justify-center text-4xl">
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

          {/* Book Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {book.status === "READING" && "Lendo"}
                  {book.status === "WANT_TO_READ" && "Quero Ler"}
                  {book.status === "READ" && "Lido"}
                  {book.status === "DROPPED" && "Pausado"}
                </span>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 ml-auto">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleUpdateRating(star)}
                      title={`Avaliar com ${star} estrelas`}
                      className="cursor-pointer text-slate-600 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          (book.rating || 0) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-400 mt-0.5">
                por <span className="text-slate-200">{book.author}</span>
              </p>

              {book.notes && (
                <p className="text-xs text-slate-400 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                  &ldquo;{book.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Progress Bar & Status Controls */}
            <div className="mt-4 pt-3 border-t border-slate-800/60">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-1.5">
                <span>
                  Progresso:{" "}
                  <strong className="text-amber-300 font-bold">
                    {book.currentPage}
                  </strong>{" "}
                  / {book.totalPages} págs
                </span>
                <span className="font-bold text-amber-400">
                  {book.currentPercentage}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, book.currentPercentage)}%` }}
                />
              </div>

              {/* Status change tabs & delete */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 mr-1 text-[11px]">Mudar status:</span>
                  {[
                    { id: "READING", label: "Lendo" },
                    { id: "WANT_TO_READ", label: "Quero Ler" },
                    { id: "READ", label: "Lido" },
                    { id: "DROPPED", label: "Pausar" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdateStatus(s.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        book.status === s.id
                          ? "bg-slate-800 text-amber-300 border border-slate-700 font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDeleteBook}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 text-[11px] text-red-400/80 hover:text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Registration & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Form to log progress (Left/Main col: 7) */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Registrar Atualização de Leitura
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSession} className="space-y-4">
              {/* Progress Mode Toggle: Pages vs Percentage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Onde você parou?
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setMode("page")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        mode === "page"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Por Página
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("percentage")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        mode === "percentage"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Por %
                    </button>
                  </div>
                </div>

                {mode === "page" ? (
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min={0}
                      max={book.totalPages}
                      required
                      placeholder={`Página atual (ex: ${Math.min(
                        book.totalPages,
                        book.currentPage + 20
                      )}) de ${book.totalPages}`}
                      value={pageValue}
                      onChange={(e) => setPageValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <span className="text-slate-500 font-bold absolute left-3.5 top-2.5 text-sm">
                      %
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      required
                      placeholder="Porcentagem atual (ex: 45.5)"
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Read Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Data da Leitura
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={readDate}
                    onChange={(e) => setReadDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 44 Emotions Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span>O que você sentiu lendo?</span>
                    <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10">
                      {selectedEmotions.length} selecionada(s)
                    </span>
                  </label>
                </div>

                {/* Filter and search row */}
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar emoção..."
                      value={emotionSearch}
                      onChange={(e) => setEmotionSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
                    {[
                      { id: "todas", label: "Todas (44)" },
                      { id: "positiva", label: "Positivas" },
                      { id: "intensa", label: "Intensas" },
                      { id: "reflexiva", label: "Reflexivas" },
                      { id: "densa", label: "Densas" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                          categoryFilter === cat.id
                            ? "bg-slate-800 text-amber-300 font-semibold"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotion Chips Grid */}
                <div className="max-h-40 overflow-y-auto p-2 bg-slate-900/90 border border-slate-800/80 rounded-xl flex flex-wrap gap-1.5">
                  {filteredEmotions.map((emotion) => {
                    const isSelected = selectedEmotions.includes(emotion.id);
                    return (
                      <button
                        key={emotion.id}
                        type="button"
                        onClick={() => toggleEmotion(emotion.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? `${emotion.color} ring-1 ring-amber-400 font-semibold shadow-sm`
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <span>{emotion.emoji}</span>
                        <span>{emotion.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-300 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment / Thoughts */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Comentário / Citação dessa sessão</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Que reviravolta! Esse capítulo mudou tudo..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={savingSession}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {savingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando progresso...</span>
                  </>
                ) : (
                  "Salvar Atualização de Leitura"
                )}
              </button>
            </form>
          </div>

          {/* Reading History Timeline (Right col: 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Diário & Histórico ({book.sessions?.length || 0})
              </h3>
            </div>

            <div className="flex-1 max-h-[480px] overflow-y-auto space-y-3 pr-1">
              {book.sessions && book.sessions.length > 0 ? (
                book.sessions.map((session) => {
                  let emotionsList: string[] = [];
                  try {
                    emotionsList = JSON.parse(session.emotions || "[]");
                  } catch {
                    emotionsList = [];
                  }

                  const formattedDate = new Date(session.readDate).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-amber-300">
                          Página {session.pageRead}{" "}
                          <span className="text-slate-400 font-normal">
                            ({session.percentageRead}%)
                          </span>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Emotion badges */}
                      {emotionsList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {emotionsList.map((emoId) => {
                            const emo = EMOTIONS_BY_ID.get(emoId);
                            if (!emo) return null;
                            return (
                              <span
                                key={emo.id}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${emo.color}`}
                              >
                                <span>{emo.emoji}</span>
                                <span>{emo.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment */}
                      {session.comment && (
                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 leading-relaxed">
                          {session.comment}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
                  <p className="text-2xl mb-2">🕯️</p>
                  <p className="font-medium text-slate-400">
                    Nenhuma atualização registrada ainda.
                  </p>
                  <p className="mt-1">
                    Preencha o formulário ao lado para acender seu diário de leitura!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
