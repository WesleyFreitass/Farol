"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Star,
  BookOpen,
  Quote as QuoteIcon,
  Palette,
  Layout,
  Sliders,
  Loader2,
  Heart,
  Camera,
  Smartphone,
  Image as ImageIcon,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import { Book } from "./BookDetailModal";
import { EMOTIONS_BY_ID } from "@/lib/emotions";

interface InstagramStoryModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

type TemplateFormat = "story" | "post"; // 9:16 vs 4:5
type TemplateTheme = "amber" | "steam" | "emerald" | "rose" | "obsidian";

const THEMES: Record<
  TemplateTheme,
  {
    name: string;
    icon: string;
    gradient: string;
    cardBg: string;
    accentColor: string;
    textColor: string;
    badgeBg: string;
    border: string;
  }
> = {
  amber: {
    name: "Farol Dourado",
    icon: "Farol",
    gradient: "from-[#1a1103] via-[#0a0702] to-[#120b02]",
    cardBg: "bg-amber-950/20",
    accentColor: "#f59e0b",
    textColor: "text-amber-200",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    border: "border-amber-500/30",
  },
  steam: {
    name: "Mar Noturno",
    icon: "Oceano",
    gradient: "from-[#0a1220] via-[#050912] to-[#0d1627]",
    cardBg: "bg-slate-900/40",
    accentColor: "#38bdf8",
    textColor: "text-sky-200",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    border: "border-sky-500/30",
  },
  emerald: {
    name: "Floresta Calma",
    icon: "Floresta",
    gradient: "from-[#061811] via-[#020a07] to-[#0a2016]",
    cardBg: "bg-emerald-950/25",
    accentColor: "#34d399",
    textColor: "text-emerald-200",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/30",
  },
  rose: {
    name: "Pôr do Sol",
    icon: "Sunset",
    gradient: "from-[#240c16] via-[#0d0407] to-[#200913]",
    cardBg: "bg-rose-950/25",
    accentColor: "#fb7185",
    textColor: "text-rose-200",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    border: "border-rose-500/30",
  },
  obsidian: {
    name: "Obsidiana Noir",
    icon: "Noir",
    gradient: "from-[#18181b] via-[#09090b] to-[#111114]",
    cardBg: "bg-zinc-900/40",
    accentColor: "#e4e4e7",
    textColor: "text-zinc-200",
    badgeBg: "bg-zinc-800 text-zinc-200 border-zinc-700",
    border: "border-zinc-700/60",
  },
};

export function InstagramStoryModal({
  book,
  isOpen,
  onClose,
  userName = "Leitor Farol",
}: InstagramStoryModalProps) {
  const [format, setFormat] = useState<TemplateFormat>("story");
  const [theme, setTheme] = useState<TemplateTheme>("amber");

  // Toggles
  const [showProgress, setShowProgress] = useState(true);
  const [showRating, setShowRating] = useState(true);
  const [showEmotions, setShowEmotions] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [customQuote, setCustomQuote] = useState("");
  const [customThoughts, setCustomThoughts] = useState("");

  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Extract latest emotions from book sessions
  const latestEmotions = (() => {
    if (!book || !book.sessions || book.sessions.length === 0) return [];
    const emotionsSet = new Set<string>();
    book.sessions.forEach((s) => {
      try {
        const list: string[] = JSON.parse(s.emotions || "[]");
        list.forEach((e) => emotionsSet.add(e));
      } catch {
        // ignore
      }
    });
    return Array.from(emotionsSet).slice(0, 4);
  })();

  // Reset or initialize quote if book has notes or session comment
  useEffect(() => {
    if (book) {
      if (book.notes) {
        setCustomQuote(book.notes);
        setShowQuote(true);
      } else if (book.sessions && book.sessions.length > 0 && book.sessions[0].comment) {
        setCustomQuote(book.sessions[0].comment);
        setShowQuote(true);
      } else {
        setCustomQuote("");
        setShowQuote(false);
      }
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const currentTheme = THEMES[theme];

  // Resolve cover URL with proxy if external to avoid CORS issues
  const safeCoverUrl = book.coverUrl
    ? book.coverUrl.startsWith("http")
      ? `/api/proxy-image?url=${encodeURIComponent(book.coverUrl)}`
      : book.coverUrl
    : null;

  // Status label
  const statusLabel =
    {
      READING: "LENDO AGORA",
      READ: "LIVRO CONCLUÍDO",
      WANT_TO_READ: "NA MINHA LISTA",
      DROPPED: "PAUSADO",
    }[book.status] || "LEITURA FAROL";

  async function generateImageBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await htmlToImage.toPng(cardRef.current, {
      pixelRatio: 2.5, // High Resolution 1080p+
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  // 1. Download Image
  async function handleDownload() {
    if (!cardRef.current || generating) return;
    setGenerating(true);
    setStatusMessage("Gerando imagem em alta resolução...");

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement("a");
      const cleanTitle = book?.title ? book.title.replace(/[^a-zA-Z0-9]/g, "_") : "Livro";
      link.download = `Farol_${cleanTitle}_${format === "story" ? "Story" : "Post"}.png`;
      link.href = dataUrl;
      link.click();
      setStatusMessage("Imagem baixada com sucesso!");
    } catch (err) {
      console.error(err);
      setStatusMessage("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setGenerating(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  }

  // 2. Share via Web Share API (native share on mobile to Instagram)
  async function handleShare() {
    if (!cardRef.current || !book || generating) return;
    setGenerating(true);
    setStatusMessage("Preparando para compartilhar...");

    try {
      const blob = await generateImageBlob();
      if (!blob) throw new Error("Falha ao gerar blob");

      const file = new File(
        [blob],
        `Farol_${book?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Livro"}.png`,
        { type: "image/png" }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Lendo ${book.title}`,
          text: `Acompanhando minha leitura de "${book.title}" no Farol`,
          files: [file],
        });
        setStatusMessage("Compartilhado com sucesso!");
      } else {
        // Fallback to download
        await handleDownload();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Não foi possível abrir o menu nativo. Baixando imagem...");
      await handleDownload();
    } finally {
      setGenerating(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  }

  // 3. Copy Image to Clipboard
  async function handleCopy() {
    if (!cardRef.current || generating) return;
    setGenerating(true);
    setStatusMessage("Copiando imagem...");

    try {
      const blob = await generateImageBlob();
      if (!blob) throw new Error("Falha ao gerar blob");

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setStatusMessage("Imagem copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
      setStatusMessage("Erro ao copiar. Use o botão Baixar Imagem.");
    } finally {
      setGenerating(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0e0e14] border border-zinc-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gerador de Card para Instagram</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Bookstagram
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Gere um card lindo e profissional para postar no seu Stories ou Feed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Controls + Right Live Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 cols) */}
          <div className="md:col-span-5 space-y-5 order-2 md:order-1">
            {/* Format Selection (Story vs Feed) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-amber-400" />
                <span>Formato da Publicação</span>
              </label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormat("story")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    format === "story"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Story (9:16)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("post")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    format === "post"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Feed (4:5)</span>
                </button>
              </div>
            </div>

            {/* Aesthetic Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Tema & Paleta</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(THEMES) as TemplateTheme[]).map((tKey) => {
                  const t = THEMES[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTheme(tKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-zinc-800 border-amber-400 ring-1 ring-amber-400 text-white shadow-md"
                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="text-xs font-semibold truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Elementos Visíveis</span>
              </label>

              <div className="space-y-2 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
                {/* Progress Toggle */}
                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-zinc-300">Progresso & Porcentagem</span>
                  <input
                    type="checkbox"
                    checked={showProgress}
                    onChange={(e) => setShowProgress(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Rating Toggle */}
                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-zinc-300">Estrelas de Avaliação</span>
                  <input
                    type="checkbox"
                    checked={showRating}
                    onChange={(e) => setShowRating(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Emotions Toggle */}
                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-zinc-300">Emoções Sentidas ({latestEmotions.length})</span>
                  <input
                    type="checkbox"
                    checked={showEmotions}
                    onChange={(e) => setShowEmotions(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Quote Toggle */}
                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-zinc-300">Citação ou Frase Marcante</span>
                  <input
                    type="checkbox"
                    checked={showQuote}
                    onChange={(e) => setShowQuote(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Custom Quote Field if enabled */}
            {showQuote && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-semibold text-zinc-400">
                  Frase em destaque no card:
                </label>
                <textarea
                  rows={2}
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="Digite uma frase ou citação favorita deste livro..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-amber-400 outline-none"
                />
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-in fade-in">
                {statusMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={generating}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando imagem...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Imagem HD</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 transition-colors cursor-pointer"
                  title="Compartilhar direto no Stories ou Feed do celular"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compartilhar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 transition-colors cursor-pointer"
                  title="Copiar imagem para área de transferência"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Column (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center order-1 md:order-2">
            <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
              <span>Pré-visualização ao vivo:</span>
              <span className="text-[11px] font-semibold text-amber-400">
                {format === "story" ? "Story (1080 × 1920)" : "Feed (1080 × 1350)"}
              </span>
            </div>

            {/* PREVIEW CONTAINER WITH ZOOM/FIT TO SCREEN */}
            <div className="w-full flex items-center justify-center p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-inner overflow-hidden">
              <div
                ref={cardRef}
                style={{
                  width: format === "story" ? "360px" : "360px",
                  height: format === "story" ? "640px" : "450px",
                }}
                className={`relative shrink-0 rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-b ${currentTheme.gradient} border ${currentTheme.border} shadow-2xl select-none`}
              >
                {/* Background decorative glows */}
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
                  style={{ backgroundColor: currentTheme.accentColor }}
                />

                {/* CENTER: Book Cover & Details */}
                <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-3 pt-2">
                  {/* Book Cover with 3D shadow */}
                  <div className="relative">
                    <div
                      className={`w-28 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border-2 border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}
                    >
                      {safeCoverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeCoverUrl}
                          alt={book.title}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-2 text-zinc-400">
                          <BookOpen className="w-8 h-8 mb-1" />
                          <span className="text-[10px] text-center line-clamp-2">
                            {book.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-0.5 max-w-[290px]">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-zinc-300 line-clamp-1">
                      por <strong className="text-white">{book.author}</strong>
                    </p>
                  </div>

                  {/* Rating Stars */}
                  {showRating && book.rating && book.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const filled = (book.rating || 0) >= star;
                          const half = !filled && (book.rating || 0) >= star - 0.5;
                          return (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                filled
                                  ? "fill-amber-400 text-amber-400"
                                  : half
                                  ? "fill-amber-400/50 text-amber-400"
                                  : "text-zinc-600"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="ml-1 text-[11px] text-zinc-200">
                        {book.rating.toFixed(1).replace(".0", "")}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar & Pages */}
                  {showProgress && (
                    <div className="w-full max-w-[260px] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-300">
                        <span>
                          Pág. {book.currentPage} de {book.totalPages}
                        </span>
                        <span style={{ color: currentTheme.accentColor }}>
                          {book.currentPercentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, book.currentPercentage)}%`,
                            backgroundColor: currentTheme.accentColor,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Emotions Badges */}
                  {showEmotions && latestEmotions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-[280px]">
                      {latestEmotions.map((emoId) => {
                        const emo = EMOTIONS_BY_ID.get(emoId);
                        if (!emo) return null;
                        return (
                          <span
                            key={emo.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-black/60 border border-white/10 text-zinc-200 backdrop-blur-md"
                          >
                            {emo.isStar ? (
                              <span className={`text-[10px] ${emo.dotColor}`}>★</span>
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full inline-block ${
                                  emo.dotColor.split(" ")[0]
                                }`}
                              />
                            )}
                            <span>{emo.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Highlight Quote (Limpa, legível e sem ícone de aspas) */}
                  {showQuote && customQuote.trim() && (
                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 text-center max-w-[300px] backdrop-blur-md shadow-lg">
                      <p className="text-xs sm:text-sm font-sans font-medium text-zinc-100 leading-relaxed italic">
                        &ldquo;{customQuote}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. FOOTER: Reader Handle & Farol App Signature */}
                <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">
                    {userName}
                  </span>
                  <span className="font-bold opacity-80 flex items-center gap-1.5">
                    <span>farol.pampo.tech</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Farol" className="w-3.5 h-3.5 rounded object-cover" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
