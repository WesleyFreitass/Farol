"use client";

import {
  LogOut,
  BookOpen,
  Plus,
  User as UserIcon,
  BarChart3,
  Library,
  Target,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenAddBook: () => void;
  onLogout: () => void;
  activeTab?: "shelf" | "stats" | "wishlist";
  onTabChange?: (tab: "shelf" | "stats" | "wishlist") => void;
  wishlistDroppedCount?: number;
  stats?: {
    total: number;
    reading: number;
    read: number;
  };
}

export function Navbar({
  user,
  onOpenAuth,
  onOpenAddBook,
  onLogout,
  activeTab = "shelf",
  onTabChange,
  wishlistDroppedCount = 0,
  stats,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/20">
            🏮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Farol
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Leituras
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Registro, Emoções & Estatísticas
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Estante vs Estatísticas & Gráficos) */}
        {user && onTabChange && (
          <div className="flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => onTabChange("shelf")}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "shelf"
                  ? "bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Estante</span>
              {stats && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-950 text-zinc-400">
                  {stats.total}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("stats")}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "stats"
                  ? "bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gráficos & Guia</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("wishlist")}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "wishlist"
                  ? "bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Radar de Desejos</span>
              {wishlistDroppedCount !== undefined && wishlistDroppedCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-0.5">
                  🔥 {wishlistDroppedCount}
                </span>
              ) : null}
            </button>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <button
                onClick={onOpenAddBook}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Adicionar Livro</span>
                <span className="sm:hidden">Novo</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[80px] sm:max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
