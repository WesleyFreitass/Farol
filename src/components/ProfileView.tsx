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
} from "lucide-react";
import { Book } from "./BookDetailModal";
import { EditProfileModal } from "./EditProfileModal";
import { AddQuoteModal } from "./AddQuoteModal";
import { PROFILE_THEMES, AVATAR_FRAMES } from "@/lib/profileThemes";

export interface UserQuoteItem {
  id: string;
  bookTitle: string;
  author?: string | null;
  quote: string;
  pageNumber?: number | null;
  createdAt: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  profileBackground?: string | null;
  avatarFrame?: string | null;
  featuredBookIds?: string | null;
  createdAt: string;
  quotes: UserQuoteItem[];
  featuredBooks: Book[];
  stats: {
    booksRead: number;
    booksReading: number;
    totalBooks: number;
    totalPagesRead: number;
    totalQuotes: number;
    level: number;
    totalXP: number;
    levelProgressPercent: number;
    badgeTitle: string;
    badgeIcon: string;
  };
}

interface ProfileViewProps {
  shelfBooks?: Book[];
  onSelectBook?: (book: Book) => void;
}

export function ProfileView({
  shelfBooks = [],
  onSelectBook,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

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
      <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-xs">Carregando seu perfil do leitor...</p>
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

  // Resolve background theme
  const bgTheme = PROFILE_THEMES.find(
    (t) => t.id === profile.profileBackground
  );
  const bgImageUrl =
    profile.profileBackground && profile.profileBackground.startsWith("http")
      ? profile.profileBackground
      : bgTheme?.imageUrl ||
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2000&auto=format&fit=crop";

  // Resolve avatar frame
  const frame =
    AVATAR_FRAMES.find((f) => f.id === profile.avatarFrame) ||
    AVATAR_FRAMES[0];

  return (
    <div className="relative min-h-[85vh] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl animate-in fade-in duration-300">
      {/* STEAM BACKGROUND WALLPAPER LAYER */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none opacity-40 scale-105"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e13]/85 via-[#0e0e13]/92 to-[#0e0e13] pointer-events-none" />

      {/* STEAM PROFILE CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
        {/* HEADER: STEAM USER BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Left: Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with Frame */}
            <div className="relative shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center text-3xl font-black text-amber-300 transition-all ${frame.borderClass} ${frame.ringClass} ${frame.glowClass}`}
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

            {/* Name, Status & Bio */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online no Farol</span>
                </span>
              </div>

              {profile.bio ? (
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md italic leading-relaxed bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Nenhum lema de leitor definido ainda.
                </p>
              )}

              <div className="text-[11px] text-zinc-400 flex items-center justify-center sm:justify-start gap-3 pt-1">
                <span>🏮 Farol Membro</span>
                <span>&bull;</span>
                <span>
                  Desde{" "}
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Steam Level & Edit Profile Button */}
          <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
            {/* Steam Level Circle & Badge */}
            <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl shadow-inner">
              <div className="w-13 h-13 rounded-full border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold leading-none">
                  Nível
                </span>
                <span className="text-lg font-black text-white leading-tight">
                  {profile.stats.level}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{profile.stats.badgeIcon}</span>
                  <span className="text-xs font-bold text-white tracking-wide">
                    {profile.stats.badgeTitle}
                  </span>
                </div>
                <div className="w-32 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile.stats.levelProgressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  {profile.stats.totalXP} XP acumulados
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>

        {/* STEAM PROFILE COUNTER BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Livros Lidos
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">
                {profile.stats.booksRead}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
              📚
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Páginas Lidas
              </span>
              <span className="text-2xl font-black text-amber-400 mt-0.5 block">
                {profile.stats.totalPagesRead}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
              📖
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Citações Salvas
              </span>
              <span className="text-2xl font-black text-sky-400 mt-0.5 block">
                {profile.stats.totalQuotes}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl">
              💬
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Lendo Atualmente
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                {profile.stats.booksReading}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
              🚀
            </div>
          </div>
        </div>

        {/* SHOWCASE 1: LIVROS EM DESTAQUE (STEAM FAVORITE GAME SHOWCASE) */}
        <div className="rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl overflow-hidden">
          {/* Steam Header Bar */}
          <div className="px-6 py-3.5 bg-gradient-to-r from-purple-950/50 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-purple-200">
                Expositor de Livros Favoritos & Destaques
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              Configurar Expositor
            </button>
          </div>

          <div className="p-6">
            {profile.featuredBooks && profile.featuredBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {profile.featuredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook && onSelectBook(book)}
                    className="p-3 rounded-2xl bg-[#14141d] hover:bg-[#181826] border border-zinc-800/80 hover:border-purple-500/50 transition-all flex flex-col items-center text-center cursor-pointer group shadow-lg"
                  >
                    <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform">
                      {book.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📖</span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-[130px]">
                      {book.author}
                    </p>

                    {book.rating ? (
                      <div className="flex items-center gap-1 mt-1.5 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{book.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 mt-1.5">
                        {book.totalPages} páginas
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-3">
                  ⭐
                </div>
                <h3 className="text-sm font-bold text-white">
                  Seu expositor de favoritos está vazio
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Escolha até 5 livros da sua estante para exibir em destaque aqui no seu perfil.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer shadow-md"
                >
                  Escolher Livros em Destaque
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SHOWCASE 2: CITAÇÕES & TRECHOS MARCANTES COM NÚMERO DE PÁGINA */}
        <div className="rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl overflow-hidden">
          {/* Steam Header Bar */}
          <div className="px-6 py-3.5 bg-gradient-to-r from-amber-950/50 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QuoteIcon className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200">
                Expositor de Citações & Trechos Marcantes
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAddQuoteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova Citação</span>
            </button>
          </div>

          <div className="p-6">
            {profile.quotes && profile.quotes.length > 0 ? (
              <div className="space-y-4">
                {profile.quotes.map((item) => (
                  <div
                    key={item.id}
                    className="relative p-5 rounded-2xl bg-[#14141d] border border-zinc-800/80 hover:border-amber-500/40 transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Quote Text */}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm sm:text-base text-zinc-100 italic font-serif leading-relaxed">
                          &ldquo;{item.quote}&rdquo;
                        </p>

                        {/* Citation info: Book, Page, Author */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold pt-1">
                          <span className="text-zinc-400">&mdash;</span>
                          <span className="text-white font-bold">
                            {item.bookTitle}
                          </span>
                          {item.pageNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
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

                      {/* Delete Quote button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(item.id)}
                        disabled={deletingQuoteId === item.id}
                        title="Excluir citação"
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-3">
                  📜
                </div>
                <h3 className="text-sm font-bold text-white">
                  Nenhuma citação favoritada ainda
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Marque frases inesquecíveis e guarde a página exata do livro para mostrar no seu perfil.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddQuoteOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeira Citação</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={loadProfile}
        currentProfile={profile}
        shelfBooks={shelfBooks}
      />

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
