"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Anchor,
  Compass,
  Star,
  Quote,
  BookOpen,
  Plus,
  Check,
  Flame,
  MessageSquare,
  Sparkles,
  Share2,
  Loader2,
  BookmarkPlus,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import { AVATAR_FRAMES } from "@/lib/profileThemes";

interface UserProfilePreview {
  id: string;
  name: string;
  avatarUrl?: string | null;
  avatarFrame?: string | null;
  bio?: string | null;
  isJoined?: boolean;
  currentlyReading?: { title: string; coverUrl?: string | null } | null;
}

interface ActivityItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  status: string;
  rating?: number | null;
  currentPercentage: number;
  currentPage: number;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    avatarFrame?: string | null;
  };
  sessions?: {
    comment?: string | null;
    emotions?: string;
  }[];
}

interface RecommendationItem {
  id: string;
  bookTitle: string;
  author: string;
  coverUrl?: string | null;
  note?: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface CommunityViewProps {
  onSelectBook?: (book: Book) => void;
  onAddWishlist?: (title: string, author: string, coverUrl?: string) => void;
}

export function CommunityView({ onSelectBook }: CommunityViewProps) {
  const [feedMode, setFeedMode] = useState<"all" | "crew">("all");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [crewList, setCrewList] = useState<UserProfilePreview[]>([]);
  const [crewCaptainIds, setCrewCaptainIds] = useState<string[]>([]);
  const [likedFeedIds, setLikedFeedIds] = useState<Set<string>>(new Set());
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [joiningCrewId, setJoiningCrewId] = useState<string | null>(null);

  async function loadCommunity() {
    try {
      setLoading(true);
      const res = await fetch("/api/community");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities?.books || []);
        setRecommendations(data.recommendations || []);
        setCrewList(data.crewList || []);
        setCrewCaptainIds(data.crewCaptainIds || []);
      }
    } catch (err) {
      console.error("Erro ao carregar comunidade:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunity();
  }, []);

  async function toggleCrew(captainId: string) {
    if (joiningCrewId) return;
    setJoiningCrewId(captainId);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_crew", captainId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.joined) {
          setCrewCaptainIds((prev) => [...prev, captainId]);
          setCrewList((prev) =>
            prev.map((c) => (c.id === captainId ? { ...c, isJoined: true } : c))
          );
        } else {
          setCrewCaptainIds((prev) => prev.filter((id) => id !== captainId));
          setCrewList((prev) =>
            prev.map((c) => (c.id === captainId ? { ...c, isJoined: false } : c))
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningCrewId(null);
    }
  }

  function toggleLike(id: string) {
    setLikedFeedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleQuickAddToShelf(bookTitle: string, author: string, coverUrl?: string | null) {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          author,
          coverUrl: coverUrl || undefined,
          status: "WANT_TO_READ",
          totalPages: 300,
        }),
      });
      if (res.ok) {
        setSavedBooks((prev) => new Set([...prev, bookTitle]));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const displayedActivities = activities.filter((act) => {
    if (feedMode === "crew") {
      return crewCaptainIds.includes(act.user.id);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Community Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>Comunidade dos Faroleiros</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              Tripulação
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Descubra o que outros navegantes literários estão lendo e troque indicações.
          </p>
        </div>

        {/* Dual Mode Switcher (Mar Aberto vs Minha Tripulação) */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setFeedMode("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              feedMode === "all"
                ? "bg-slate-800 text-amber-300 border border-slate-700/80 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🌊</span>
            <span>Mar Aberto</span>
          </button>

          <button
            type="button"
            onClick={() => setFeedMode("crew")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              feedMode === "crew"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>⚓</span>
            <span>Minha Tripulação ({crewCaptainIds.length})</span>
          </button>
        </div>
      </div>

      {/* Recommendations Carousel (Item 15) */}
      {recommendations.length > 0 && (
        <div className="rounded-3xl bg-[#0d1422] border border-amber-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Indicações Quentes da Tripulação
              </h3>
            </div>
            <span className="text-[11px] text-amber-300/80 font-medium">
              Livros recomendados por leitores
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {recommendations.map((rec) => {
              const isSaved = savedBooks.has(rec.bookTitle);
              return (
                <div
                  key={rec.id}
                  className="w-64 sm:w-72 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shrink-0 flex gap-3 hover:border-amber-500/40 transition-all shadow-md"
                >
                  <div className="w-14 h-20 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 shadow-sm">
                    {rec.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rec.coverUrl}
                        alt={rec.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        📖
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {rec.bookTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {rec.author}
                      </p>
                      {rec.note && (
                        <p className="text-[10px] text-amber-300/90 italic line-clamp-2 mt-1">
                          &ldquo;{rec.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
                      <span className="text-[9px] text-slate-500 truncate">
                        por {rec.sender.name}
                      </span>

                      {isSaved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>Salvo</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAddToShelf(rec.bookTitle, rec.author, rec.coverUrl)
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Quero Ler</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Community Grid: Feed (Left) + Crew Discovery Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>
              {feedMode === "all" ? "Últimas leituras no Farol" : "Leituras da sua tripulação"}
            </span>
            <span className="font-semibold text-slate-300">
              {displayedActivities.length} atividade(s)
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-2" />
              <p className="text-xs">Sintonizando faróis da comunidade...</p>
            </div>
          ) : displayedActivities.length > 0 ? (
            displayedActivities.map((act) => {
              const isLiked = likedFeedIds.has(act.id);
              const isSaved = savedBooks.has(act.title);
              const frame =
                AVATAR_FRAMES.find((f) => f.id === act.user.avatarFrame) ||
                AVATAR_FRAMES[0];

              return (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-3.5"
                >
                  {/* Activity Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center text-sm font-bold text-amber-300 shrink-0 ${frame.borderClass}`}
                      >
                        {act.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={act.user.avatarUrl}
                            alt={act.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{act.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {act.user.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Tripulante
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {act.status === "READ"
                            ? "concluiu uma leitura"
                            : "está lendo uma nova aventura"}
                        </p>
                      </div>
                    </div>

                    {act.rating && act.rating > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{act.rating} / 5</span>
                      </div>
                    )}
                  </div>

                  {/* Book Card Snippet */}
                  <div className="flex gap-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="w-14 h-20 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 shadow-sm">
                      {act.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={act.coverUrl}
                          alt={act.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base">
                          📖
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          por {act.author}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-[140px]">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${act.currentPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-amber-300">
                            {act.currentPercentage}%
                          </span>
                        </div>
                      </div>

                      {act.sessions?.[0]?.comment && (
                        <p className="text-[11px] text-slate-300 italic line-clamp-1 mt-1">
                          &ldquo;{act.sessions[0].comment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => toggleLike(act.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isLiked
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                          : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="text-sm">🏮</span>
                      <span>{isLiked ? "Farol Aceso (+1)" : "Acender Farol"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10">
                          <Check className="w-3.5 h-3.5" />
                          <span>Na Estante</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickAddToShelf(act.title, act.author, act.coverUrl)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                          <span>+ Quero Ler</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
              {feedMode === "crew"
                ? "Sua tripulação ainda não tem atividades registradas. Adicione mais navegantes à direita!"
                : "Nenhuma atividade encontrada."}
            </div>
          )}
        </div>

        {/* Right Column: Crew Management & Discovery */}
        <div className="space-y-6">
          {/* Crew Card */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Sua Tripulação
                </h3>
              </div>
              <span className="text-xs font-extrabold text-amber-300">
                {crewCaptainIds.length} membros
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Os leitores que você segue formam sua tripulação. Você verá as leituras e resumos deles no feed exclusivo.
            </p>

            {/* Crew Members List */}
            <div className="space-y-2.5 pt-1">
              {crewList.filter((c) => c.isJoined).length > 0 ? (
                crewList
                  .filter((c) => c.isJoined)
                  .map((crew) => (
                    <div
                      key={crew.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                          {crew.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={crew.avatarUrl}
                              alt={crew.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span>{crew.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">
                            {crew.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {crew.currentlyReading ? `Lendo ${crew.currentlyReading.title}` : "Em pausa"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCrew(crew.id)}
                        className="text-[10px] font-semibold text-rose-400 hover:underline shrink-0"
                      >
                        Sair
                      </button>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Você ainda não adicionou ninguém à sua tripulação.
                </p>
              )}
            </div>
          </div>

          {/* Discover Readers */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Descobrir Navegantes
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Conecte-se com outros leitores ativos na plataforma:
            </p>

            <div className="space-y-3 pt-1">
              {crewList.map((reader) => (
                <div
                  key={reader.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                      {reader.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={reader.avatarUrl}
                          alt={reader.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span>{reader.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {reader.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {reader.bio || "Leitor no Farol"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCrew(reader.id)}
                    disabled={joiningCrewId === reader.id}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                      reader.isJoined
                        ? "bg-slate-800 text-slate-400 hover:text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                    }`}
                  >
                    {reader.isJoined ? "✓ Na Tripulação" : "+ Tripulação"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
