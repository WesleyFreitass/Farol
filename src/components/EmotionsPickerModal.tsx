"use client";

import { useState, useMemo } from "react";
import { X, LayoutGrid, ArrowUpDown } from "lucide-react";
import { READING_EMOTIONS } from "@/lib/emotions";

interface EmotionsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmotions: string[];
  onSave: (emotions: string[]) => void;
}

export function EmotionsPickerModal({
  isOpen,
  onClose,
  selectedEmotions,
  onSave,
}: EmotionsPickerModalProps) {
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedEmotions);
  const [search, setSearch] = useState("");
  const [sortAlphabetical, setSortAlphabetical] = useState(false);
  const [groupByColor, setGroupByColor] = useState(true);

  if (!isOpen) return null;

  function toggleEmotion(id: string) {
    if (currentSelection.includes(id)) {
      setCurrentSelection(currentSelection.filter((item) => item !== id));
    } else {
      if (currentSelection.length >= 6) {
        return; // Max 6 emotions
      }
      setCurrentSelection([...currentSelection, id]);
    }
  }

  const displayedEmotions = useMemo(() => {
    let list = [...READING_EMOTIONS];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((e) => e.label.toLowerCase().includes(q));
    }

    if (sortAlphabetical) {
      list.sort((a, b) => a.label.localeCompare(b.label));
    }

    return list;
  }, [search, sortAlphabetical]);

  function handleContinue() {
    onSave(currentSelection);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0c0c11] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Escolha até 6 emoções
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40">
              {currentSelection.length}/6
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Action Buttons Row */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#14141d] border border-purple-500/80 focus:ring-2 focus:ring-purple-600/30 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Group View Toggle Button */}
          <button
            type="button"
            onClick={() => setGroupByColor(!groupByColor)}
            title="Alternar agrupamento"
            className="p-2.5 rounded-2xl bg-[#14141d] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Sort Toggle Button */}
          <button
            type="button"
            onClick={() => setSortAlphabetical(!sortAlphabetical)}
            title="Ordenar alfabeticamente"
            className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
              sortAlphabetical
                ? "bg-purple-950 border-purple-500/60 text-purple-300"
                : "bg-[#14141d] border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Emotions Chips Grid */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 max-h-[460px]">
          <div className="flex flex-wrap gap-2">
            {displayedEmotions.map((emotion) => {
              const isSelected = currentSelection.includes(emotion.id);

              return (
                <button
                  type="button"
                  key={emotion.id}
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "border border-purple-500 bg-purple-950/40 text-purple-200 ring-1 ring-purple-500/50 shadow-sm"
                      : "bg-[#14141d] border border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {/* Dot or Star */}
                  {emotion.isStar ? (
                    <span className={`text-[12px] leading-none ${emotion.dotColor}`}>
                      ★
                    </span>
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${emotion.dotColor.split(" ")[0]}`}
                    />
                  )}

                  <span>{emotion.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom with Centered Continuar Button */}
        <div className="pt-4 mt-3 border-t border-zinc-800/80 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-[#161622] hover:bg-zinc-800 border border-zinc-700/60 text-zinc-100 transition-colors cursor-pointer"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
