"use client";

import { useState } from "react";
import {
  X,
  Palette,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Check,
  Loader2,
  Save,
  Star,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import { PROFILE_THEMES, AVATAR_FRAMES } from "@/lib/profileThemes";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentProfile: {
    name: string;
    bio?: string | null;
    avatarUrl?: string | null;
    profileBackground?: string | null;
    avatarFrame?: string | null;
    featuredBookIds?: string | null;
  };
  shelfBooks?: Book[];
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
  shelfBooks = [],
}: EditProfileModalProps) {
  const [name, setName] = useState(currentProfile.name || "");
  const [bio, setBio] = useState(currentProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl || "");
  const [selectedBackground, setSelectedBackground] = useState(
    currentProfile.profileBackground || "farol_noturno"
  );
  const [customBgUrl, setCustomBgUrl] = useState(
    currentProfile.profileBackground &&
      currentProfile.profileBackground.startsWith("http")
      ? currentProfile.profileBackground
      : ""
  );
  const [selectedFrame, setSelectedFrame] = useState(
    currentProfile.avatarFrame || "gold"
  );

  // Parse existing featured book IDs
  const [selectedFeaturedBookIds, setSelectedFeaturedBookIds] = useState<
    string[]
  >(() => {
    try {
      return JSON.parse(currentProfile.featuredBookIds || "[]");
    } catch {
      return [];
    }
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "featured">(
    "theme"
  );

  if (!isOpen) return null;

  function toggleFeaturedBook(id: string) {
    if (selectedFeaturedBookIds.includes(id)) {
      setSelectedFeaturedBookIds(
        selectedFeaturedBookIds.filter((bId) => bId !== id)
      );
    } else {
      if (selectedFeaturedBookIds.length >= 5) {
        alert("Você pode escolher até 5 livros para o expositor de destaques.");
        return;
      }
      setSelectedFeaturedBookIds([...selectedFeaturedBookIds, id]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const finalBg = customBgUrl.trim() ? customBgUrl.trim() : selectedBackground;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          profileBackground: finalBg,
          avatarFrame: selectedFrame,
          featuredBookIds: selectedFeaturedBookIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar perfil.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao se conectar com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Personalizar Perfil (Estilo Steam)
              </h2>
              <p className="text-xs text-zinc-400">
                Escolha seu plano de fundo, moldura de avatar e livros em destaque
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="mt-3 flex items-center gap-1 p-1 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "theme"
                ? "bg-zinc-800 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Fundo & Molduras</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "featured"
                ? "bg-zinc-800 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Expositor de Livros ({selectedFeaturedBookIds.length}/5)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "general"
                ? "bg-zinc-800 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Dados & Bio</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto mt-4 pr-1 space-y-5">
          {/* TAB 1: THEME & AVATAR FRAMES */}
          {activeTab === "theme" && (
            <div className="space-y-5">
              {/* Avatar Frame Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Escolha sua Moldura de Avatar (Estilo Steam Points):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AVATAR_FRAMES.map((frame) => {
                    const isSelected = selectedFrame === frame.id;
                    return (
                      <div
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-zinc-800/90 border-amber-400 ring-2 ring-amber-400/30"
                            : "bg-[#14141d] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full bg-zinc-900 shrink-0 flex items-center justify-center font-bold text-xs ${frame.borderClass} ${frame.glowClass}`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {frame.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {frame.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Profile Background Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Escolha o Plano de Fundo do seu Perfil:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROFILE_THEMES.map((theme) => {
                    const isSelected =
                      selectedBackground === theme.id && !customBgUrl.trim();
                    return (
                      <div
                        key={theme.id}
                        onClick={() => {
                          setSelectedBackground(theme.id);
                          setCustomBgUrl("");
                        }}
                        className={`relative rounded-2xl overflow-hidden border transition-all cursor-pointer group h-24 ${
                          isSelected
                            ? "border-amber-400 ring-2 ring-amber-400/40"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {/* Background Thumbnail */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${theme.imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block drop-shadow-md">
                              {theme.name}
                            </span>
                            <span className="text-[10px] text-zinc-300 drop-shadow">
                              {theme.category}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Background URL */}
                <div className="mt-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Ou use uma imagem personalizada (URL):</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-imagem.jpg"
                    value={customBgUrl}
                    onChange={(e) => {
                      setCustomBgUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedBackground(e.target.value.trim());
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURED BOOKS SHOWCASE */}
          {activeTab === "featured" && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0 text-purple-400" />
                <span>
                  Selecione até 5 livros da sua estante para brilharem no seu Expositor de Livros Favoritos!
                </span>
              </div>

              {shelfBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {shelfBooks.map((book) => {
                    const isFeatured = selectedFeaturedBookIds.includes(book.id);
                    return (
                      <div
                        key={book.id}
                        onClick={() => toggleFeaturedBook(book.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between ${
                          isFeatured
                            ? "bg-purple-950/40 border-purple-400 ring-2 ring-purple-500/40"
                            : "bg-[#14141d] border-zinc-800/80 hover:border-zinc-700 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <div className="w-16 h-22 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md flex items-center justify-center shrink-0 mb-2">
                          {book.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">📖</span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-[120px]">
                          {book.author}
                        </p>

                        <div className="mt-2">
                          {isFeatured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                              ⭐ Destaque
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500 hover:text-zinc-300">
                              + Destacar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Você ainda não possui livros na estante para colocar em destaque.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GENERAL & BIO */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Biografia / Lema do Leitor
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva algo sobre você, seus autores favoritos ou seu lema de leitura..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  URL da Foto de Perfil (Avatar)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/meu-avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
