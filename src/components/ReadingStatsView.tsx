"use client";

import { useMemo } from "react";
import { Book } from "./BookDetailModal";
import { PieChart, PieChartItem } from "./PieChart";
import { ReadingCalendar } from "./ReadingCalendar";
import { EMOTIONS_BY_ID } from "@/lib/emotions";
import { BookOpen, Star, Sparkles, Award } from "lucide-react";

interface ReadingStatsViewProps {
  books: Book[];
}

export function ReadingStatsView({ books }: ReadingStatsViewProps) {
  // 1. KPI Stats computation
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const readBooks = books.filter((b) => b.status === "READ").length;
    const readingBooks = books.filter((b) => b.status === "READING").length;

    let totalPagesRead = 0;
    let totalSessions = 0;
    let sumRatings = 0;
    let ratedCount = 0;

    const emotionCounts: Record<string, number> = {};

    books.forEach((book) => {
      totalPagesRead += book.currentPage || 0;

      if (book.rating && book.rating > 0) {
        sumRatings += book.rating;
        ratedCount++;
      }

      book.sessions?.forEach((s) => {
        totalSessions++;
        try {
          const list: string[] = JSON.parse(s.emotions || "[]");
          list.forEach((emoId) => {
            emotionCounts[emoId] = (emotionCounts[emoId] || 0) + 1;
          });
        } catch {
          // ignore
        }
      });
    });

    const averageRating = ratedCount > 0 ? (sumRatings / ratedCount).toFixed(1) : "-";

    // Most frequent emotion
    let topEmotionId: string | null = null;
    let maxEmotionCount = 0;
    for (const [id, count] of Object.entries(emotionCounts)) {
      if (count > maxEmotionCount) {
        maxEmotionCount = count;
        topEmotionId = id;
      }
    }

    const topEmotion = topEmotionId ? EMOTIONS_BY_ID.get(topEmotionId) : null;

    return {
      totalBooks,
      readBooks,
      readingBooks,
      totalPagesRead,
      totalSessions,
      averageRating,
      topEmotion,
      emotionCounts,
    };
  }, [books]);

  // 2. Gráfico de Pizza 1: EMOÇÕES
  const emotionsPieData = useMemo(() => {
    const GROUP_COLORS: Record<string, string> = {
      green: "#84cc16",
      yellow: "#fbbf24",
      orange: "#f97316",
      red: "#f43f5e",
      blue: "#38bdf8",
      purple: "#a855f7",
      gray: "#9ca3af",
    };

    const items: PieChartItem[] = [];

    for (const [id, count] of Object.entries(stats.emotionCounts)) {
      const emo = EMOTIONS_BY_ID.get(id);
      const label = emo ? `${emo.label} ${emo.isStar ? "★" : ""}` : id;
      const color = emo ? GROUP_COLORS[emo.group] || "#c084fc" : "#c084fc";

      items.push({
        id,
        label,
        value: count,
        color,
      });
    }

    items.sort((a, b) => b.value - a.value);
    return items;
  }, [stats.emotionCounts]);

  // 3. Gráfico de Pizza 2: GÊNEROS
  const genresPieData = useMemo(() => {
    const GENRE_COLORS = [
      "#a855f7",
      "#ec4899",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#06b6d4",
      "#f97316",
      "#6366f1",
      "#84cc16",
    ];

    const counts: Record<string, number> = {};
    books.forEach((b) => {
      const g = b.genre?.trim() || "Ficção Geral";
      counts[g] = (counts[g] || 0) + 1;
    });

    const items: PieChartItem[] = Object.entries(counts).map(([label, value], idx) => ({
      label,
      value,
      color: GENRE_COLORS[idx % GENRE_COLORS.length],
    }));

    items.sort((a, b) => b.value - a.value);
    return items;
  }, [books]);

  // 4. Gráfico de Pizza 3: AUTORES
  const authorsPieData = useMemo(() => {
    const AUTHOR_COLORS = [
      "#f59e0b",
      "#6366f1",
      "#14b8a6",
      "#ec4899",
      "#84cc16",
      "#e11d48",
      "#8b5cf6",
      "#38bdf8",
    ];

    const counts: Record<string, number> = {};
    books.forEach((b) => {
      const a = b.author?.trim() || "Autor Desconhecido";
      counts[a] = (counts[a] || 0) + 1;
    });

    const items: PieChartItem[] = Object.entries(counts).map(([label, value], idx) => ({
      label,
      value,
      color: AUTHOR_COLORS[idx % AUTHOR_COLORS.length],
    }));

    items.sort((a, b) => b.value - a.value);
    return items.slice(0, 8); // top 8 autores
  }, [books]);

  // 5. Gráfico de Pizza 4: MESES
  const monthsPieData = useMemo(() => {
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const MONTH_COLORS = [
      "#38bdf8",
      "#818cf8",
      "#c084fc",
      "#f472b6",
      "#fb7185",
      "#f97316",
      "#fbbf24",
      "#a3e635",
      "#34d399",
      "#2dd4bf",
      "#60a5fa",
      "#a78bfa",
    ];

    const counts: Record<number, number> = {};

    books.forEach((b) => {
      b.sessions?.forEach((s) => {
        try {
          const d = new Date(s.readDate);
          if (!isNaN(d.getTime())) {
            const m = d.getMonth();
            counts[m] = (counts[m] || 0) + 1;
          }
        } catch {
          // ignore
        }
      });
    });

    const items: PieChartItem[] = Object.entries(counts).map(([mStr, value]) => {
      const m = parseInt(mStr, 10);
      return {
        label: monthNames[m],
        value,
        color: MONTH_COLORS[m % MONTH_COLORS.length],
      };
    });

    items.sort((a, b) => b.value - a.value);
    return items;
  }, [books]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Total de Livros</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {stats.totalBooks}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 block truncate">
            {stats.readBooks} lidos &bull; {stats.readingBooks} lendo
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Páginas Lidas</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {stats.totalPagesRead}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 block truncate">
            {stats.totalSessions} sessões
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Nota Média</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1">
              <span>{stats.averageRating}</span>
              <span className="text-xs font-normal text-zinc-500">/ 5</span>
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 block truncate">
            avaliação média
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Sentimento Top</span>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-sm sm:text-lg font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">
              {stats.topEmotion ? stats.topEmotion.label : "-"}
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 block truncate">
            mais frequente
          </span>
        </div>
      </div>

      {/* OS 4 GRÁFICOS DE PIZZA */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Gráficos & Distribuição das Leituras
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Análises visuais de emoções, gêneros, autores e frequência mensal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pizza 1: Emoção */}
          <PieChart
            title="Distribuição de Emoções 🎭"
            subtitle="Sentimentos vivenciados durante as leituras"
            emptyText="Nenhuma emoção registrada ainda"
            data={emotionsPieData}
          />

          {/* Pizza 2: Gênero */}
          <PieChart
            title="Gêneros Literários 📚"
            subtitle="Proporção dos temas e categorias na sua estante"
            emptyText="Nenhum gênero cadastrado"
            data={genresPieData}
          />

          {/* Pizza 3: Autores */}
          <PieChart
            title="Principais Autores ✍️"
            subtitle="Autores com maior presença nas suas estantes"
            emptyText="Nenhum autor cadastrado"
            data={authorsPieData}
          />

          {/* Pizza 4: Meses */}
          <PieChart
            title="Leituras por Mês 📅"
            subtitle="Distribuição da frequência de sessões ao longo do ano"
            emptyText="Nenhuma leitura registrada nos meses"
            data={monthsPieData}
          />
        </div>
      </div>

      {/* O CALENDÁRIO DE LEITURAS */}
      <div>
        <ReadingCalendar books={books} />
      </div>
    </div>
  );
}
