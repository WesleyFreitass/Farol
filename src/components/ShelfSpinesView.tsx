"use client";

import { useMemo } from "react";
import { Book } from "./BookDetailModal";

interface ShelfSpinesViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

// Color palettes for realistic literary book spines
const SPINE_GRADIENTS = [
  { from: "from-sky-950", via: "via-sky-850", to: "to-sky-900", border: "border-sky-400/30", text: "text-amber-200" },
  { from: "from-rose-950", via: "via-red-900", to: "to-rose-950", border: "border-amber-400/40", text: "text-amber-100" },
  { from: "from-amber-950", via: "via-amber-800", to: "to-yellow-950", border: "border-amber-400/40", text: "text-amber-100" },
  { from: "from-emerald-950", via: "via-emerald-800", to: "to-teal-950", border: "border-emerald-400/40", text: "text-emerald-100" },
  { from: "from-purple-950", via: "via-indigo-900", to: "to-purple-950", border: "border-purple-400/30", text: "text-amber-300" },
  { from: "from-zinc-950", via: "via-zinc-800", to: "to-zinc-900", border: "border-zinc-500/30", text: "text-zinc-200" },
  { from: "from-blue-950", via: "via-indigo-950", to: "to-blue-900", border: "border-indigo-400/30", text: "text-sky-200" },
  { from: "from-orange-950", via: "via-amber-900", to: "to-orange-950", border: "border-orange-400/30", text: "text-amber-200" },
];

export function ShelfSpinesView({ books, onSelectBook }: ShelfSpinesViewProps) {
  // Chunk books into shelves of max 8-10 books per shelf
  const shelves = useMemo(() => {
    const chunkSize = 8;
    const result: Book[][] = [];
    for (let i = 0; i < books.length; i += chunkSize) {
      result.push(books.slice(i, i + chunkSize));
    }
    return result.length > 0 ? result : [[]];
  }, [books]);

  return (
    <div className="space-y-10 py-4 animate-in fade-in duration-300">
      {shelves.map((shelfBooks, shelfIdx) => (
        <div
          key={shelfIdx}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#382013]"
          style={{
            background: "linear-gradient(180deg, #100a06 0%, #1a100a 60%, #120b07 100%)",
          }}
        >
          {/* Ambient light glow from the shelf ceiling */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />

          {/* Books Row Container */}
          <div className="flex items-end justify-center gap-1.5 sm:gap-3.5 h-72 sm:h-80 pt-10 px-4 sm:px-8 overflow-x-auto scrollbar-none">
            {shelfBooks.map((book, bookIdx) => {
              // Calculate width proportional to pages (min 36px, max 68px on desktop)
              const pages = book.totalPages || 300;
              let widthClass = "w-10 sm:w-12";
              if (pages > 700) widthClass = "w-14 sm:w-18";
              else if (pages > 500) widthClass = "w-12 sm:w-15";
              else if (pages < 250) widthClass = "w-8 sm:w-10";

              // Subtle height variation (5-10%)
              let heightClass = "h-64 sm:h-68";
              if (pages > 600) heightClass = "h-66 sm:h-72";
              else if (pages < 250) heightClass = "h-60 sm:h-64";

              const theme =
                SPINE_GRADIENTS[(shelfIdx * 8 + bookIdx) % SPINE_GRADIENTS.length];

              const statusColor =
                book.status === "READ"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : book.status === "READING"
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : "bg-slate-500";

              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  title={`${book.title} • por ${book.author} (${book.totalPages} págs - ${book.status === "READ" ? "Lido" : book.status === "READING" ? `${book.currentPercentage}% Lendo` : "Quero Ler"})`}
                  className={`group relative ${widthClass} ${heightClass} rounded-sm bg-gradient-to-r ${theme.from} ${theme.via} ${theme.to} border-x ${theme.border} flex flex-col justify-between py-3.5 sm:py-4 px-1 text-center select-none cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:rotate-1 hover:shadow-2xl hover:shadow-amber-500/20 shrink-0`}
                  style={{
                    boxShadow:
                      "-4px 0 10px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.12), inset -2px 0 5px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Top Rib */}
                  <div className="h-1 w-full bg-gradient-to-r from-white/20 via-white/5 to-black/40 rounded-full" />

                  {/* Spine Vertical Title */}
                  <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
                    <span
                      className={`text-[10px] sm:text-xs font-black tracking-widest uppercase truncate ${theme.text} drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        maxHeight: "180px",
                      }}
                    >
                      {book.title}
                    </span>
                  </div>

                  {/* Author Name */}
                  <div
                    className="text-[9px] font-bold text-white/70 truncate uppercase mb-1"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      maxHeight: "60px",
                    }}
                  >
                    {book.author.split(" ").slice(-1)[0]}
                  </div>

                  {/* Bottom Rib */}
                  <div className="h-1 w-full bg-gradient-to-r from-white/20 via-white/5 to-black/40 rounded-full mb-1" />

                  {/* Status Indicator Dot */}
                  <div
                    className={`w-2 sm:w-2.5 h-2 sm:h-2.5 mx-auto rounded-full ${statusColor}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Heavy Wooden Shelf Board */}
          <div
            className="h-7 sm:h-8 w-full relative z-10 flex items-center justify-between px-6 border-t border-[#5a331c]"
            style={{
              background:
                "linear-gradient(180deg, #3d2314 0%, #2b180d 60%, #1a0e07 100%)",
              boxShadow:
                "0 15px 35px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -4px 8px rgba(0,0,0,0.8)",
            }}
          >
            <span className="text-[9px] font-black tracking-widest uppercase text-amber-200/40">
              PRATELEIRA #{shelfIdx + 1}
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-amber-200/30">
              FAROL LITERÁRIO
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
