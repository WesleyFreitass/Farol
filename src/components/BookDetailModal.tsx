"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Sparkles,
  BookOpen,
  MessageSquare,
  Trash2,
  Loader2,
  Clock,
  Star,
  Plus,
  Target,
  Check,
} from "lucide-react";
import { EMOTIONS_BY_ID } from "@/lib/emotions";
import { EmotionsPickerModal } from "./EmotionsPickerModal";
import { StarRating } from "./StarRating";

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
  genre?: string | null;
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
  // Update Reading Dialog state (opened by the button inside the book page)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isEmotionsPickerOpen, setIsEmotionsPickerOpen] = useState(false);

  // Mode: "page" | "percentage"
  const [mode, setMode] = useState<"page" | "percentage">("page");
  const [pageValue, setPageValue] = useState<string>("");
  const [percentageValue, setPercentageValue] = useState<string>("");
  const [readDate, setReadDate] = useState<string>("");
  const [comment, setComment] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const [savingSession, setSavingSession] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingToRadar, setAddingToRadar] = useState(false);
  const [radarStatus, setRadarStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReadDate(new Date().toISOString().split("T")[0]);
      setIsUpdateDialogOpen(false);
      setIsEmotionsPickerOpen(false);
      setRadarStatus(null);
    }
  }, [isOpen]);

  async function handleAddToRadar() {
    if (!book || addingToRadar) return;
    setAddingToRadar(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          userBookId: book.id,
        }),
      });
      if (res.ok || res.status === 409) {
        setRadarStatus("✓ No Radar de Preços!");
      } else {
        setRadarStatus("Erro ao adicionar");
      }
    } catch {
      setRadarStatus("Erro");
    } finally {
      setAddingToRadar(false);
    }
  }

  if (!isOpen || !book) return null;

  function handleOpenUpdateDialog() {
    setPageValue(book?.currentPage ? String(book.currentPage) : "");
    setPercentageValue(book?.currentPercentage ? String(book.currentPercentage) : "");
    setComment("");
    setSelectedEmotions([]);
    setError(null);
    setIsUpdateDialogOpen(true);
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

      setIsUpdateDialogOpen(false);
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

  async function handleUpdateRating(rating: number | null) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl text-slate-100 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Book Header Card */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-slate-800">
          {/* Cover */}
          <div className="w-28 sm:w-36 h-40 sm:h-52 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700/60 overflow-hidden shrink-0 shadow-xl flex items-center justify-center text-5xl">
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

          {/* Book Info & Status */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {book.status === "READING" && "📖 Lendo"}
                  {book.status === "WANT_TO_READ" && "🔖 Quero Ler"}
                  {book.status === "READ" && "✅ Lido"}
                  {book.status === "DROPPED" && "⏸️ Pausado"}
                </span>

                {book.genre && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    🏷️ {book.genre}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-400 mt-1">
                por <span className="text-slate-200 font-semibold">{book.author}</span>
              </p>

              {/* Avaliação com suporte a Meias Estrelas abaixo do autor */}
              <div className="mt-2.5">
                <StarRating
                  rating={book.rating}
                  onChange={handleUpdateRating}
                  size="md"
                  showValue
                />
              </div>

              {book.notes && (
                <p className="text-xs text-slate-300 mt-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 italic leading-relaxed">
                  &ldquo;{book.notes}&rdquo;
                </p>
              )}

              {/* Radar de Preços quick action */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAddToRadar}
                  disabled={addingToRadar || !!radarStatus}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    radarStatus
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>
                    {radarStatus
                      ? radarStatus
                      : addingToRadar
                      ? "Buscando menor preço..."
                      : "🎯 Monitorar Preço no Radar"}
                  </span>
                </button>
              </div>
            </div>

            {/* Status change tabs & delete */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir livro</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Card with PROMINENT "Atualizar Leitura" BUTTON */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>
                  Progresso:{" "}
                  <strong className="text-amber-300 font-bold text-base">
                    {book.currentPage}
                  </strong>{" "}
                  de {book.totalPages} páginas
                </span>
              </span>
              <span className="font-extrabold text-amber-400 text-base">
                {book.currentPercentage}%
              </span>
            </div>

            {/* Gauge bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/90 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, book.currentPercentage)}%` }}
              />
            </div>
          </div>

          {/* Button to update reading inside book page */}
          <button
            type="button"
            onClick={handleOpenUpdateDialog}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Atualizar Leitura</span>
          </button>
        </div>

        {/* Reading Diary & Sessions History */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Diário de Leituras & Emoções ({book.sessions?.length || 0})
              </h3>
            </div>

            {book.sessions && book.sessions.length > 0 && (
              <button
                type="button"
                onClick={handleOpenUpdateDialog}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                + Nova atualização
              </button>
            )}
          </div>

          <div className="space-y-3">
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
                    month: "long",
                    year: "numeric",
                  }
                );

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between text-xs mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 text-sm">
                          Página {session.pageRead}
                        </span>
                        <span className="text-slate-400 font-normal">
                          ({session.percentageRead}%)
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">{formattedDate}</span>
                    </div>

                    {/* Emotions Badges */}
                    {emotionsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {emotionsList.map((emoId) => {
                          const emo = EMOTIONS_BY_ID.get(emoId);
                          if (!emo) return null;
                          return (
                            <span
                              key={emo.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#14141d] border border-zinc-800 text-zinc-200"
                            >
                              {emo.isStar ? (
                                <span className={`text-[11px] leading-none ${emo.dotColor}`}>
                                  ★
                                </span>
                              ) : (
                                <span
                                  className={`w-2 h-2 rounded-full inline-block ${emo.dotColor.split(" ")[0]}`}
                                />
                              )}
                              <span>{emo.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Comment */}
                    {session.comment && (
                      <p className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        {session.comment}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs">
                <p className="text-3xl mb-2">🏮</p>
                <p className="font-semibold text-slate-300 text-sm">
                  Nenhuma sessão de leitura registrada ainda
                </p>
                <p className="mt-1 max-w-sm mx-auto text-slate-400">
                  Clique no botão <strong>&ldquo;Atualizar Leitura&rdquo;</strong> acima para registrar sua página atual, sentimentos e anotações!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP DE ATUALIZAÇÃO DE LEITURA (ABERTO PELO BOTÃO) */}
      {isUpdateDialogOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0e0e13] border border-purple-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Atualizar Leitura
                  </h3>
                  <p className="text-xs text-zinc-400 truncate max-w-xs">
                    {book.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUpdateDialogOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSession} className="space-y-4 mt-4">
              {/* Progress Mode Toggle: Pages vs Percentage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-200">
                    Onde você parou?
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setMode("page")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        mode === "page"
                          ? "bg-purple-600 text-white font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Por Página
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("percentage")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        mode === "percentage"
                          ? "bg-purple-600 text-white font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Por %
                    </button>
                  </div>
                </div>

                {mode === "page" ? (
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min={0}
                      max={book.totalPages}
                      required
                      placeholder={`Página atual (de ${book.totalPages})`}
                      value={pageValue}
                      onChange={(e) => setPageValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <span className="text-zinc-500 font-bold absolute left-3.5 top-2.5 text-sm">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Read Date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Data da Leitura
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={readDate}
                    onChange={(e) => setReadDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl text-sm text-zinc-100 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* EMOÇÕES: TRIGGER CONFORME A IMAGEM DO USUÁRIO */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-2">
                  Como você se sentiu?
                </label>

                {selectedEmotions.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsEmotionsPickerOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#14141d] border-2 border-purple-500/70 hover:border-purple-400 text-sm font-semibold text-zinc-100 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span>Adicionar emoções</span>
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedEmotions.map((emoId) => {
                      const emo = EMOTIONS_BY_ID.get(emoId);
                      if (!emo) return null;
                      return (
                        <span
                          key={emo.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/60 bg-purple-950/40 text-purple-200 shadow-sm"
                        >
                          {emo.isStar ? (
                            <span className={`text-[11px] leading-none ${emo.dotColor}`}>
                              ★
                            </span>
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${emo.dotColor.split(" ")[0]}`}
                            />
                          )}
                          <span>{emo.label}</span>
                        </span>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setIsEmotionsPickerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14141d] border border-zinc-700/80 hover:border-purple-400 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-400" />
                      <span>Alterar ({selectedEmotions.length}/6)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Comment / Thoughts */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Comentário / Citação dessa sessão</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Que reviravolta! Esse capítulo mudou tudo..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingSession}
                  className="py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    "Salvar Atualização"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SELEÇÃO DAS 44 EMOÇÕES (ATÉ 6 EMOÇÕES) */}
      <EmotionsPickerModal
        isOpen={isEmotionsPickerOpen}
        onClose={() => setIsEmotionsPickerOpen(false)}
        selectedEmotions={selectedEmotions}
        onSave={(newEmotions) => setSelectedEmotions(newEmotions)}
      />
    </div>
  );
}
