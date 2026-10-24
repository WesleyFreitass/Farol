"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Anchor } from "lucide-react";
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
  { from: "from-slate-950", via: "via-slate-800", to: "to-slate-900", border: "border-amber-400/30", text: "text-amber-300" },
  { from: "from-zinc-950", via: "via-zinc-800", to: "to-zinc-900", border: "border-zinc-500/30", text: "text-zinc-200" },
  { from: "from-blue-950", via: "via-indigo-950", to: "to-blue-900", border: "border-indigo-400/30", text: "text-sky-200" },
  { from: "from-orange-950", via: "via-amber-900", to: "to-orange-950", border: "border-orange-400/30", text: "text-amber-200" },
];

export function ShelfSpinesView({ books, onSelectBook }: ShelfSpinesViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shelfCapacity, setShelfCapacity] = useState(16);

  // Calcula dinamicamente a capacidade da prateleira para preencher o máximo de espaço sem sobras
  useEffect(() => {
    function updateCapacity() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Largura média de uma lombada no desktop ~54px com gap
        const count = Math.max(6, Math.floor((width - 48) / 54));
        setShelfCapacity(count);
      }
    }
    updateCapacity();
    window.addEventListener("resize", updateCapacity);
    return () => window.removeEventListener("resize", updateCapacity);
  }, []);

  // Divide os livros pelas prateleiras dinâmicas preenchidas ao máximo
  const shelves = useMemo(() => {
    if (!books || books.length === 0) return [[]];
    const result: Book[][] = [];
    for (let i = 0; i < books.length; i += shelfCapacity) {
      result.push(books.slice(i, i + shelfCapacity));
    }
    return result;
  }, [books, shelfCapacity]);

  return (
    <div ref={containerRef} className="space-y-10 py-4 animate-in fade-in duration-300">
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

          {/* Books Row Container - Preenchido da esquerda para a direita */}
          <div className="flex items-end justify-start gap-1 sm:gap-2 h-72 sm:h-80 pt-8 px-4 sm:px-8 overflow-x-auto scrollbar-none">
            {shelfBooks.map((book, bookIdx) => {
              // Calculate width proportional to pages (min 36px, max 68px on desktop)
              const pages = book.totalPages || 300;
              let widthClass = "w-10 sm:w-12";
              if (pages > 700) widthClass = "w-14 sm:w-16";
              else if (pages > 500) widthClass = "w-12 sm:w-14";
              else if (pages < 250) widthClass = "w-8 sm:w-10";

              // Subtle height variation (5-10%)
              let heightClass = "h-64 sm:h-68";
              if (pages > 600) heightClass = "h-66 sm:h-72";
              else if (pages < 250) heightClass = "h-60 sm:h-64";

              const theme =
                SPINE_GRADIENTS[(shelfIdx * shelfCapacity + bookIdx) % SPINE_GRADIENTS.length];

              const statusColor =
                book.status === "READ"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : book.status === "READING"
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : "bg-slate-500";

              // Ajusta o tamanho da fonte dinamicamente pelo tamanho do título para NUNCA cortar
              const titleLen = book.title.length;
              const fontSizeClass =
                titleLen > 28
                  ? "text-[8px] sm:text-[9px] tracking-tight"
                  : titleLen > 18
                  ? "text-[9px] sm:text-[10px] tracking-normal"
                  : "text-[10px] sm:text-[11px] tracking-wider";

              const authorSurname = book.author
                ? book.author.split(" ").slice(-1)[0]
                : "";

              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  title={`${book.title} • por ${book.author} (${book.totalPages} págs - ${book.status === "READ" ? "Lido" : book.status === "READING" ? `${book.currentPercentage}% Lendo` : "Quero Ler"})`}
                  className={`group relative ${widthClass} ${heightClass} rounded-sm bg-gradient-to-r ${theme.from} ${theme.via} ${theme.to} border-x ${theme.border} flex flex-col justify-between py-3 px-1 text-center select-none cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:rotate-1 hover:shadow-2xl hover:shadow-amber-500/20 shrink-0`}
                  style={{
                    boxShadow:
                      "-4px 0 10px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.12), inset -2px 0 5px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Top Rib */}
                  <div className="h-1 w-full bg-gradient-to-r from-white/20 via-white/5 to-black/40 rounded-full" />

                  {/* Spine Vertical Title (Orientado de cima para baixo com tamanho adaptativo sem cortes) */}
                  <div className="flex-1 flex items-center justify-center py-1 overflow-hidden">
                    <span
                      className={`${fontSizeClass} font-black uppercase ${theme.text} drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-center select-none`}
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                        maxHeight: "190px",
                        lineHeight: 1.1,
                      }}
                    >
                      {book.title}
                    </span>
                  </div>

                  {/* Author Name */}
                  {authorSurname && (
                    <div
                      className="text-[8px] font-bold text-white/70 uppercase mb-1"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                        maxHeight: "55px",
                      }}
                    >
                      {authorSurname}
                    </div>
                  )}

                  {/* Bottom Rib */}
                  <div className="h-1 w-full bg-gradient-to-r from-white/20 via-white/5 to-black/40 rounded-full mb-1" />

                  {/* Status Indicator Dot */}
                  <div
                    className={`w-2 sm:w-2.5 h-2 sm:h-2.5 mx-auto rounded-full ${statusColor}`}
                  />
                </div>
              );
            })}

            {/* Suporte de Livros (Aparador náutico de prateleira) */}
            <div className="h-44 sm:h-52 w-7 sm:w-8 rounded-r-lg bg-gradient-to-r from-[#24130a] to-[#140a05] border-y border-r border-[#4a2612] flex items-center justify-center opacity-60 shrink-0 self-end shadow-lg ml-1">
              <Anchor className="w-3.5 h-3.5 text-amber-500/40" />
            </div>
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
