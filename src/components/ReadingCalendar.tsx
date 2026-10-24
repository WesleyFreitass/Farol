"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  BookOpen,
  X,
} from "lucide-react";
import { Book, ReadingSession } from "./BookDetailModal";
import { EMOTIONS_BY_ID } from "@/lib/emotions";

interface ReadingCalendarProps {
  books: Book[];
}

interface DaySessionDetail {
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string | null;
  session: ReadingSession;
  deltaPages: number;
}

export function ReadingCalendar({ books }: ReadingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Aggregate all reading sessions from all books by Date string "YYYY-MM-DD"
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, DaySessionDetail[]>();

    books.forEach((book) => {
      // Sort sessions chronologically to correctly compute delta pages read
      const sortedSessions = [...(book.sessions || [])].sort(
        (a, b) => new Date(a.readDate).getTime() - new Date(b.readDate).getTime()
      );

      sortedSessions.forEach((session, idx) => {
        try {
          const d = new Date(session.readDate);
          if (!isNaN(d.getTime())) {
            const dateKey = d.toISOString().split("T")[0];
            const prevPage = idx === 0 ? 0 : sortedSessions[idx - 1].pageRead;
            const deltaPages = Math.max(0, session.pageRead - prevPage);

            const existing = map.get(dateKey) || [];
            existing.push({
              bookTitle: book.title,
              bookAuthor: book.author,
              bookCover: book.coverUrl,
              session,
              deltaPages,
            });
            map.set(dateKey, existing);
          }
        } catch {
          // ignore invalid date
        }
      });
    });

    return map;
  }, [books]);

  // Calendar Grid computation
  const { days, monthName, daysWithReadingInMonth, totalPagesInMonth } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const monthStr = firstDayOfMonth.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    const daysList: {
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      hasReading: boolean;
      sessions: DaySessionDetail[];
      pagesRead: number;
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = d.toISOString().split("T")[0];
      const sessions = sessionsByDate.get(dateKey) || [];
      const pagesRead = sessions.reduce((sum, s) => sum + s.deltaPages, 0);

      daysList.push({
        date: d,
        dateKey,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        hasReading: sessions.length > 0,
        sessions,
        pagesRead,
      });
    }

    let readDaysCount = 0;
    let pagesSum = 0;

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = d.toISOString().split("T")[0];
      const sessions = sessionsByDate.get(dateKey) || [];
      const pagesRead = sessions.reduce((sum, s) => sum + s.deltaPages, 0);

      if (sessions.length > 0) {
        readDaysCount++;
        pagesSum += pagesRead;
      }

      daysList.push({
        date: d,
        dateKey,
        dayNumber: day,
        isCurrentMonth: true,
        hasReading: sessions.length > 0,
        sessions,
        pagesRead,
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remainingDays = 42 - daysList.length;
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const d = new Date(year, month + 1, day);
        const dateKey = d.toISOString().split("T")[0];
        const sessions = sessionsByDate.get(dateKey) || [];
        const pagesRead = sessions.reduce((sum, s) => sum + s.session.pageRead, 0);

        daysList.push({
          date: d,
          dateKey,
          dayNumber: day,
          isCurrentMonth: false,
          hasReading: sessions.length > 0,
          sessions,
          pagesRead,
        });
      }
    }

    return {
      days: daysList,
      monthName: monthStr.charAt(0).toUpperCase() + monthStr.slice(1),
      daysWithReadingInMonth: readDaysCount,
      totalPagesInMonth: pagesSum,
    };
  }, [year, month, sessionsByDate]);

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayKey(null);
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayKey(null);
  }

  function handleToday() {
    setCurrentDate(new Date());
    setSelectedDayKey(null);
  }

  const selectedDayData = selectedDayKey ? sessionsByDate.get(selectedDayKey) || [] : null;

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#12121a] border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Calendário de Leituras
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visualize os dias que você leu, ritmo diário e histórico de sentimentos
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            Hoje
          </button>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-zinc-100 px-3 min-w-[130px] text-center">
              {monthName}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Próximo mês"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-[#161622] border border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 block">Dias lidos no mês</span>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-lg font-extrabold text-white">
              {daysWithReadingInMonth} dias
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#161622] border border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 block">Páginas lidas no mês</span>
          <div className="flex items-center gap-2 mt-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-lg font-extrabold text-white">
              {totalPagesInMonth} págs
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#161622] border border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 block">Status de hábito</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">
              {daysWithReadingInMonth >= 15
                ? "Ritmo Frequente"
                : daysWithReadingInMonth > 0
                ? "Em Progresso"
                : "Aguardando Leitura"}
            </span>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold text-zinc-500">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, index) => {
          const isToday = d.dateKey === todayKey;
          const isSelected = d.dateKey === selectedDayKey;

          return (
            <div
              key={index}
              onClick={() => {
                if (d.hasReading) {
                  setSelectedDayKey(isSelected ? null : d.dateKey);
                }
              }}
              className={`min-h-[48px] sm:min-h-[70px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between select-none ${
                !d.isCurrentMonth
                  ? "opacity-30 bg-zinc-950/40 border-zinc-900"
                  : d.hasReading
                  ? "bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-zinc-900 border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-500/5 cursor-pointer transform hover:-translate-y-0.5"
                  : "bg-[#14141d]/70 border-zinc-800/70 text-zinc-400"
              } ${isToday ? "ring-2 ring-amber-400/80" : ""} ${
                isSelected ? "ring-2 ring-amber-500 border-amber-400 bg-amber-950/40" : ""
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] sm:text-xs font-bold ${
                    d.hasReading ? "text-amber-300" : isToday ? "text-amber-400" : "text-zinc-400"
                  }`}
                >
                  {d.dayNumber}
                </span>

                {d.hasReading && (
                  <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                )}
              </div>

              {/* Day Footer / Progress Pill */}
              {d.hasReading ? (
                <div className="mt-0.5 sm:mt-1">
                  <span className="text-[8px] sm:text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded sm:rounded-md truncate block">
                    +{d.pagesRead}p
                  </span>
                </div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDayKey && selectedDayData && selectedDayData.length > 0 && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Sessões do dia{" "}
                <span className="text-amber-300">
                  {new Date(selectedDayKey + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayData.map((item, idx) => {
              let emotionsList: string[] = [];
              try {
                emotionsList = JSON.parse(item.session.emotions || "[]");
              } catch {
                emotionsList = [];
              }

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row gap-3 items-start justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                      {item.bookCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.bookCover}
                          alt={item.bookTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-white">
                        {item.bookTitle}
                      </h5>
                      <p className="text-[11px] text-zinc-400">
                        por {item.bookAuthor}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-amber-300">
                          Página {item.session.pageRead} ({item.session.percentageRead}%)
                        </span>
                        {item.deltaPages > 0 ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            +{item.deltaPages} págs
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-zinc-500">
                            (Anotação de emoção)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emotions on that day */}
                  {emotionsList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 sm:mt-0 sm:max-w-xs justify-start sm:justify-end">
                      {emotionsList.map((emoId) => {
                        const emo = EMOTIONS_BY_ID.get(emoId);
                        if (!emo) return null;
                        return (
                          <span
                            key={emo.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#14141d] border border-zinc-800 text-zinc-200"
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
                    </div>
                  )}

                  {item.session.comment && (
                    <p className="w-full text-xs text-zinc-300 mt-2 p-2 bg-[#101018] rounded-lg border border-zinc-800/80 italic">
                      &ldquo;{item.session.comment}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
