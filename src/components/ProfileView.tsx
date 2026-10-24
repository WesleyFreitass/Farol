"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Star,
  Quote as QuoteIcon,
  Sparkles,
  Edit3,
  Award,
  Trash2,
  Plus,
  Loader2,
  Flame,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Anchor,
  Compass,
  Target,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import { ProfileEditView } from "./ProfileEditView";
import { AddQuoteModal } from "./AddQuoteModal";
import {
  PROFILE_THEMES,
  AVATAR_FRAMES,
  CENTER_THEMES,
  CenterThemeColor,
} from "@/lib/profileThemes";

export interface UserQuoteItem {
  id: string;
  bookTitle: string;
  author?: string | null;
  quote: string;
  pageNumber?: number | null;
  createdAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  profileBackground?: string | null;
  themeColor?: string | null;
  themeOpacity?: number | null;
  replayMonth?: string | null;
  readingGoal?: number | null;
  avatarFrame?: string | null;
  featuredBookIds?: string | null;
  createdAt: string;
  isOwner?: boolean;
  isJoinedToCrew?: boolean;
  shelfBooks?: Book[];
  quotes: UserQuoteItem[];
  featuredBooks: Book[];
  stats: {
    booksRead: number;
    booksReading: number;
    totalBooks: number;
    totalPagesRead: number;
    totalQuotes: number;
    wishlistCount?: number;
    level: number;
    totalXP: number;
    levelProgressPercent: number;
    badgeTitle: string;
    badgeIcon: string;
    achievements?: AchievementBadge[];
    replay?: {
      title: string;
      month: string;
      monthLabel?: string;
      year?: number;
      booksRead: number;
      pagesRead: number;
      quotesCount: number;
      readingCount: number;
      books?: {
        id: string;
        title: string;
        author: string;
        coverUrl?: string | null;
        currentPercentage: number;
        status: string;
      }[];
    };
  };
}

interface ProfileViewProps {
  shelfBooks?: Book[];
  onSelectBook?: (book: Book) => void;
  onNavigateTab?: (tab: "shelf" | "stats" | "wishlist" | "community") => void;
  viewUserId?: string | null;
  onBack?: () => void;
}

function getAchievementIcon(id: string) {
  switch (id) {
    case "first_pages":
      return <BookOpen className="w-4 h-4 text-amber-300" />;
    case "first_port":
      return <Anchor className="w-4 h-4 text-blue-300" />;
    case "quotes_collector":
      return <QuoteIcon className="w-4 h-4 text-amber-300" />;
    case "navigator":
      return <Compass className="w-4 h-4 text-emerald-300" />;
    case "thousand_miles":
      return <Award className="w-4 h-4 text-slate-200" />;
    case "radar_active":
      return <Target className="w-4 h-4 text-amber-400" />;
    default:
      return <Award className="w-4 h-4 text-amber-400" />;
  }
}

function getBadgeLucideIcon(level: number) {
  if (level >= 30) return <Sparkles className="w-5 h-5 text-amber-300" />;
  if (level >= 20) return <Award className="w-5 h-5 text-amber-400" />;
  if (level >= 15) return <BookOpen className="w-5 h-5 text-amber-400" />;
  if (level >= 10) return <Flame className="w-5 h-5 text-amber-500" />;
  if (level >= 5) return <Compass className="w-5 h-5 text-amber-400" />;
  return <Sparkles className="w-5 h-5 text-amber-400" />;
}

export function ProfileView({
  shelfBooks = [],
  onSelectBook,
  onNavigateTab,
  viewUserId,
  onBack,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);
  const [isJoinedCrew, setIsJoinedCrew] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      const url = viewUserId ? `/api/profile?userId=${encodeURIComponent(viewUserId)}` : "/api/profile";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsJoinedCrew(Boolean(data.profile?.isJoinedToCrew));
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [viewUserId]);

  async function handleToggleCrew() {
    if (!profile) return;
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_crew", captainId: profile.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsJoinedCrew(data.joined);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteQuote(quoteId: string) {
    if (!confirm("Deseja excluir esta citação do seu perfil?")) return;
    setDeletingQuoteId(quoteId);
    try {
      const res = await fetch(`/api/profile/quotes/${quoteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingQuoteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs">Carregando perfil do leitor...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Não foi possível carregar o perfil.
      </div>
    );
  }

  // If in Edit Mode, render the Steam Profile Editor directly on the same screen!
  if (isEditing) {
    return (
      <ProfileEditView
        profile={profile}
        shelfBooks={shelfBooks}
        onSaveSuccess={() => {
          setIsEditing(false);
          loadProfile();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const isOwner = profile.isOwner !== false;
  const effectiveShelfBooks = isOwner ? shelfBooks : (profile.shelfBooks || shelfBooks);

  // 1. Outer Background Wallpaper (GIF or Image, can be from /uploads/... or preset)
  const bgTheme = PROFILE_THEMES.find((t) => t.id === profile.profileBackground);
  const bgImageUrl =
    profile.profileBackground &&
    (profile.profileBackground.startsWith("http") ||
      profile.profileBackground.startsWith("/uploads"))
      ? profile.profileBackground
      : bgTheme?.imageUrl ||
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2000&auto=format&fit=crop";

  // 2. Center Container Theme Color & Gradient ("a cor no meio")
  const centerTheme =
    CENTER_THEMES.find((t) => t.id === profile.themeColor) || CENTER_THEMES[0];

  // 3. Avatar Frame
  const frame =
    AVATAR_FRAMES.find((f) => f.id === profile.avatarFrame) || AVATAR_FRAMES[0];

  // Currently reading book (for the "Em leitura" sidebar widget)
  const currentlyReading = effectiveShelfBooks.find((b) => b.status === "READING");

  return (
    <div className="relative min-h-screen -mx-3 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-10 overflow-hidden select-none">
      {/* 1. OUTER BACKGROUND (WALLPAPER / ANIMATED GIF - SPANS FULL SCREEN) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      />
      {/* Subtle dark vignette on top of outer background */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />

      {/* Navigation back bar if viewing another user */}
      {(!isOwner || onBack) && (
        <div className="relative z-20 max-w-5xl mx-auto pt-3 px-3 sm:px-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Voltar para a Comunidade</span>
          </button>
          <span className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-full">
            Perfil de <strong className="text-amber-300 font-bold">{profile.name}</strong>
          </span>
        </div>
      )}

      {/* 2. CENTER CONTAINER ("ONDE COLOCAMOS UMA COR NO MEIO") */}
      <div
        className={`relative z-10 max-w-5xl mx-auto min-h-screen my-0 sm:my-6 p-3 sm:p-7 shadow-2xl border-x ${centerTheme.borderClass} ${centerTheme.glowClass} overflow-hidden rounded-2xl sm:rounded-3xl`}
      >
        {/* Dynamic Translucent Background Layer */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${centerTheme.bgGradient} backdrop-blur-md -z-10 transition-opacity duration-300`}
          style={{
            opacity: Math.max(0.15, Math.min(1, (profile.themeOpacity ?? 85) / 100)),
          }}
        />
        {/* STEAM PROFILE HEADER */}
        <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-white/10">
          {/* Left: Avatar with Steam Frame + Name/Status */}
          <div className="flex items-center sm:items-start gap-3.5 sm:gap-5 text-left">
            {/* Square Steam Avatar with Frame (Supports animated GIF!) */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-md overflow-hidden bg-black/80 flex items-center justify-center text-2xl sm:text-4xl font-black text-amber-300 transition-all shadow-2xl ${frame.borderClass} ${frame.ringClass} ${frame.glowClass}`}
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Steam Name, Custom Persona & Bio */}
            <div className="space-y-1 pt-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">{profile.name}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                </h1>

                {/* Level Circle visible inline on mobile */}
                <div className="flex md:hidden items-center gap-1.5 shrink-0 bg-black/50 px-2 py-1 rounded-full border border-amber-500/30">
                  <span className="text-[10px] text-zinc-300 font-bold uppercase">Nível</span>
                  <div className="w-6 h-6 rounded-full border border-amber-400 bg-amber-500/20 flex items-center justify-center text-xs font-black text-amber-300">
                    {profile.stats.level}
                  </div>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-zinc-300 font-medium truncate">
                {profile.name}
              </p>

              {profile.bio && (
                <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-2 sm:line-clamp-none italic pt-0.5 leading-relaxed bg-black/30 p-2 sm:p-2.5 rounded-lg border border-white/5">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Right: Steam Level Circle + Badge Box + "Editar perfil" Button */}
          <div className="flex items-center md:items-end justify-between md:justify-start flex-row md:flex-col gap-2.5 sm:gap-3 shrink-0">
            {/* Steam Level Circle on desktop */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-bold uppercase tracking-wider">
                Nível Farol
              </span>
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-black/60 flex items-center justify-center text-sm font-black text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                {profile.stats.level}
              </div>
            </div>

            {/* Badge Showcase Box */}
            <div className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-white/10 p-2 sm:p-2.5 rounded-xl flex-1 md:flex-initial min-w-0 md:min-w-[200px]">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                {getBadgeLucideIcon(profile.stats.level)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  {profile.stats.badgeTitle}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {profile.stats.totalXP} XP
                </span>
              </div>
            </div>

            {/* Steam "Editar perfil" Button or "Na Tripulação" toggle */}
            {isOwner ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-semibold bg-[#2a2a38] hover:bg-[#343446] text-zinc-200 border border-white/15 transition-all shadow-md cursor-pointer hover:text-white shrink-0 active:scale-95"
              >
                Editar perfil
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleCrew}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md ${
                  isJoinedCrew
                    ? "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                }`}
              >
                {isJoinedCrew ? "Na Tripulação" : "+ Tripulação"}
              </button>
            )}
          </div>
        </div>

        {/* STEAM PROFILE BODY: 2 COLUMNS (LEFT: SHOWCASES ~68% | RIGHT: SIDEBAR ~32%) */}
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          {/* LEFT COLUMN: MAIN SHOWCASES */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* SHOWCASE 1: DESTAQUE DE LIVROS FAVORITOS */}
            <div className="rounded-xl bg-black/50 border border-white/10 overflow-hidden shadow-xl">
              {/* Header */}
              <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Destaque de livros favoritos
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Alterar destaque
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4">
                {profile.featuredBooks && profile.featuredBooks.length > 0 ? (
                  <div>
                    {/* Featured Row */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 mb-4">
                      {profile.featuredBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => onSelectBook && onSelectBook(book)}
                          className="group cursor-pointer text-center"
                        >
                          <div className="w-full aspect-[2/3] rounded-lg bg-zinc-900 border border-zinc-700/80 overflow-hidden shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                            {book.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-6 h-6 text-slate-600" />
                            )}
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-white block truncate mt-1 group-hover:text-amber-300">
                            {book.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Stats under showcase */}
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-6 pt-3 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-base sm:text-lg font-black text-white block">
                          {profile.stats.booksRead}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                          Livros Lidos
                        </span>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg font-black text-white block">
                          {profile.stats.totalPagesRead}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                          Páginas
                        </span>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg font-black text-amber-400 block">
                          {profile.stats.level}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                          Nível Farol
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    {isOwner ? (
                      <>
                        Nenhum livro em destaque ainda. Clique em{" "}
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="text-amber-300 underline cursor-pointer"
                        >
                          Editar perfil
                        </button>{" "}
                        para escolher seus livros favoritos!
                      </>
                    ) : (
                      "Nenhum livro em destaque configurado por este leitor."
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SHOWCASE 2: RETROSPECTIVA REPLAY FAROL MENSAL (ITEM 7) */}
            <div className="rounded-xl bg-gradient-to-r from-teal-950/80 via-emerald-950/70 to-zinc-950/90 border border-emerald-500/30 overflow-hidden shadow-xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-3 sm:mb-4">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{profile.stats.replay?.title || "Replay Farol / Leituras"}</span>
                </span>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-normal">
                  Resumo das aventuras no mês
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                {/* Big number on the left */}
                <div className="text-center sm:text-left shrink-0">
                  <span className="text-4xl sm:text-6xl font-black text-white leading-none">
                    {profile.stats.replay?.booksRead ?? 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase block tracking-wider mt-1">
                    {profile.stats.replay?.booksRead === 1 ? "Livro lido no mês" : "Livros lidos no mês"}
                  </span>
                </div>

                {/* KPI trio in middle */}
                <div className="flex items-center gap-4 sm:gap-6 text-center">
                  <div>
                    <span className="text-lg sm:text-2xl font-black text-white block">
                      {profile.stats.replay?.pagesRead ?? 0}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                      Páginas
                    </span>
                  </div>
                  <div>
                    <span className="text-lg sm:text-2xl font-black text-white block">
                      {profile.stats.replay?.quotesCount ?? 0}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                      Citações
                    </span>
                  </div>
                  <div>
                    <span className="text-lg sm:text-2xl font-black text-amber-400 block">
                      {profile.stats.replay?.readingCount ?? 0}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase">
                      Lendo
                    </span>
                  </div>
                </div>

                {/* Thumbnails of books active/read in this replay month */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-md py-1 scrollbar-none">
                  {profile.stats.replay?.books && profile.stats.replay.books.length > 0 ? (
                    profile.stats.replay.books.slice(0, 10).map((b) => (
                      <div
                        key={b.id}
                        className="relative w-11 h-14 sm:w-12 sm:h-16 rounded overflow-hidden shrink-0 border border-white/20 shadow-md group"
                        title={`${b.title} — ${b.author}`}
                      >
                        {b.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs">
                            <BookOpen className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] text-center font-bold py-0.5 ${
                            b.status === "READ"
                              ? "bg-emerald-600/90 text-white"
                              : "bg-black/80 text-emerald-300"
                          }`}
                        >
                          {b.status === "READ" ? "Lido" : `${b.currentPercentage}%`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-zinc-400 italic text-center sm:text-right py-2 px-3 bg-white/5 rounded-lg border border-white/5">
                      Nenhuma leitura registrada neste mês
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SHOWCASE 3: EXPOSITOR DE CITAÇÕES COM PÁGINA */}
            <div className="rounded-xl bg-black/50 border border-white/10 overflow-hidden shadow-xl">
              <div className="px-3.5 sm:px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
                  <QuoteIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Citações Marcantes</span>
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsAddQuoteOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nova Citação</span>
                  </button>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-3">
                {profile.quotes && profile.quotes.length > 0 ? (
                  profile.quotes.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all flex items-start justify-between gap-2.5 group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-zinc-200 italic font-serif leading-relaxed">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                        <div className="text-[10px] sm:text-[11px] text-amber-300 font-semibold flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span>&mdash; {item.bookTitle}</span>
                          {item.pageNumber && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              Pág. {item.pageNumber}
                            </span>
                          )}
                          {item.author && (
                            <span className="text-zinc-400">
                              por {item.author}
                            </span>
                          )}
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(item.id)}
                          disabled={deletingQuoteId === item.id}
                          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shrink-0"
                          title="Excluir citação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    Nenhuma citação favoritada ainda.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STEAM SIDEBAR (~32% WIDTH) */}
          <div className="w-full md:w-72 space-y-5 shrink-0">
            {/* 1. EM LEITURA */}
            {currentlyReading ? (
              <div className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Em leitura
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-12 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-700">
                    {currentlyReading.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentlyReading.coverUrl}
                        alt={currentlyReading.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs flex items-center justify-center h-full">
                        <BookOpen className="w-4 h-4 text-slate-600" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {currentlyReading.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      Página {currentlyReading.currentPage} de{" "}
                      {currentlyReading.totalPages}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => onSelectBook && onSelectBook(currentlyReading)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors cursor-pointer"
                  >
                    Continuar Leitura
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Em leitura
                </span>
                <span className="text-xs text-zinc-500 block">
                  Nenhum livro em andamento no momento.
                </span>
              </div>
            )}

            {/* 2. CONQUISTAS REAIS DO LEITOR */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300">
                  Conquistas{" "}
                  <span className="text-amber-400 font-extrabold">
                    {profile.stats.achievements?.filter((a) => a.unlocked).length || 0}/
                    {profile.stats.achievements?.length || 6}
                  </span>
                </span>
                <span className="text-[10px] text-zinc-400">Passe o mouse</span>
              </div>

              {/* Badges icons row */}
              <div className="grid grid-cols-6 gap-1.5">
                {profile.stats.achievements?.map((badge) => (
                  <div
                    key={badge.id}
                    title={`${badge.title} • ${badge.description} [${badge.unlocked ? "Desbloqueado" : "Bloqueado"}]`}
                    className={`h-9 rounded-lg border flex items-center justify-center text-sm transition-all cursor-pointer ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${badge.color} shadow-md hover:scale-110`
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-600 opacity-40 grayscale"
                    }`}
                  >
                    {getAchievementIcon(badge.id)}
                  </div>
                ))}
              </div>
            </div>

            {/* 2.5 META ANUAL DE LEITURA */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Meta Anual {new Date().getFullYear()}</span>
                </span>
                <span className="text-amber-400 font-bold">
                  {profile.stats.booksRead} de {profile.readingGoal || 12}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((profile.stats.booksRead / (profile.readingGoal || 12)) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block text-right font-medium">
                {Math.min(100, Math.round((profile.stats.booksRead / (profile.readingGoal || 12)) * 100))}% concluído
              </span>
            </div>

            {/* 3. STEAM STATS LIST */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
              <div
                onClick={() => onNavigateTab && onNavigateTab("shelf")}
                className="flex items-center justify-between text-zinc-400 hover:text-white cursor-pointer py-0.5 transition-colors"
              >
                <span>Livros na Estante</span>
                <span className="font-bold text-zinc-200">
                  {profile.stats.totalBooks}
                </span>
              </div>

              <div
                onClick={() => onNavigateTab && onNavigateTab("shelf")}
                className="flex items-center justify-between text-zinc-400 hover:text-white cursor-pointer py-0.5 transition-colors"
              >
                <span>Livros Lidos</span>
                <span className="font-bold text-emerald-400">
                  {profile.stats.booksRead}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 py-0.5">
                <span>Citações Salvas</span>
                <span className="font-bold text-zinc-200">
                  {profile.stats.totalQuotes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Quote Modal */}
      <AddQuoteModal
        isOpen={isAddQuoteOpen}
        onClose={() => setIsAddQuoteOpen(false)}
        onSuccess={loadProfile}
        shelfBooks={shelfBooks}
      />
    </div>
  );
}
