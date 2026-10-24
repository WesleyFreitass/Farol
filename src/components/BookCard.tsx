"use client";

import { Star } from "lucide-react";
import { EMOTIONS_BY_ID } from "@/lib/emotions";
import { Book } from "./BookDetailModal";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  // Get latest emotions from the last session if available
  const latestSession = book.sessions && book.sessions.length > 0 ? book.sessions[0] : null;
  let latestEmotions: string[] = [];
  if (latestSession) {
    try {
      latestEmotions = JSON.parse(latestSession.emotions || "[]");
    } catch {
      latestEmotions = [];
    }
  }

  const statusBadge = {
    READING: { label: "Lendo", class: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
    WANT_TO_READ: { label: "Quero Ler", class: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    READ: { label: "Lido", class: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    DROPPED: { label: "Pausado", class: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  }[book.status] || { label: book.status, class: "bg-slate-500/10 text-slate-400 border-slate-500/20" };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer"
    >
      <div>
        {/* Cover with badge */}
        <div className="relative aspect-[2/3] w-full rounded-2xl bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center text-5xl shadow-md group-hover:shadow-amber-500/10 transition-shadow">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="opacity-70 group-hover:scale-110 transition-transform duration-300">
              📖
            </span>
          )}

          {/* Status Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border ${statusBadge.class}`}
            >
              {statusBadge.label}
            </span>
          </div>

          {/* Rating */}
          {book.rating && book.rating > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{book.rating.toFixed(1).replace(".0", "")}</span>
            </div>
          )}
        </div>

        {/* Title & Author */}
        <div className="mt-3.5">
          <h3 className="font-bold text-sm sm:text-base text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {book.author}
          </p>
        </div>

        {/* Latest Emotions Preview */}
        {latestEmotions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1 items-center">
            {latestEmotions.slice(0, 3).map((emoId) => {
              const emo = EMOTIONS_BY_ID.get(emoId);
              if (!emo) return null;
              return (
                <span
                  key={emo.id}
                  title={emo.label}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-full text-zinc-300"
                >
                  {emo.isStar ? (
                    <span className={`text-[10px] ${emo.dotColor}`}>★</span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${emo.dotColor.split(" ")[0]}`}
                    />
                  )}
                  <span>{emo.label}</span>
                </span>
              );
            })}
            {latestEmotions.length > 3 && (
              <span className="text-[10px] text-slate-500 font-medium">
                +{latestEmotions.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5">
          <span>
            Pág. <strong className="text-slate-200">{book.currentPage}</strong> / {book.totalPages}
          </span>
          <span className="font-semibold text-amber-400">
            {book.currentPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, book.currentPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
