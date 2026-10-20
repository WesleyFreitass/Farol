"use client";

import { LogOut, BookOpen, Plus, User as UserIcon } from "lucide-react";

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
  stats,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
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
              Registro, Emoções & Avaliações
            </p>
          </div>
        </div>

        {/* Quick Stats (When logged in) */}
        {user && stats && (
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 border-x border-slate-800/60 px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong className="text-slate-200 font-semibold">{stats.reading}</strong> lendo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                <strong className="text-slate-200 font-semibold">{stats.read}</strong> lidos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total:</span>
              <strong className="text-slate-200 font-semibold">{stats.total}</strong>
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={onOpenAddBook}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Livro</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate hidden sm:inline">
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
