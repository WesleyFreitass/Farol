"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Save,
  ArrowLeft,
  Palette,
  Star,
  User as UserIcon,
  Sparkles,
  FileImage,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import {
  PROFILE_THEMES,
  AVATAR_FRAMES,
  CENTER_THEMES,
  CenterThemeColor,
} from "@/lib/profileThemes";
import { ProfileData } from "./ProfileView";

interface ProfileEditViewProps {
  profile: ProfileData;
  shelfBooks?: Book[];
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export function ProfileEditView({
  profile,
  shelfBooks = [],
  onSaveSuccess,
  onCancel,
}: ProfileEditViewProps) {
  const [activeTab, setActiveTab] = useState<
    "avatar" | "background" | "centerColor" | "featured" | "general"
  >("background");

  // Form states
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [profileBackground, setProfileBackground] = useState(
    profile.profileBackground || ""
  );
  const [themeColor, setThemeColor] = useState(
    profile.themeColor || "steam_purple"
  );
  const [avatarFrame, setAvatarFrame] = useState(
    profile.avatarFrame || "cosmic"
  );

  const [selectedFeaturedBookIds, setSelectedFeaturedBookIds] = useState<
    string[]
  >(() => {
    try {
      return JSON.parse(profile.featuredBookIds || "[]");
    } catch {
      return [];
    }
  });

  // Uploading states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "bg"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isBg = type === "bg";
    if (isBg) setUploadingBg(true);
    else setUploadingAvatar(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no upload do arquivo.");
        return;
      }

      if (isBg) {
        setProfileBackground(data.url);
      } else {
        setAvatarUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao enviar arquivo do computador.");
    } finally {
      if (isBg) setUploadingBg(false);
      else setUploadingAvatar(false);
    }
  }

  function toggleFeaturedBook(id: string) {
    if (selectedFeaturedBookIds.includes(id)) {
      setSelectedFeaturedBookIds(
        selectedFeaturedBookIds.filter((bId) => bId !== id)
      );
    } else {
      if (selectedFeaturedBookIds.length >= 6) {
        alert("Você pode escolher até 6 livros para o expositor.");
        return;
      }
      setSelectedFeaturedBookIds([...selectedFeaturedBookIds, id]);
    }
  }

  async function handleSaveAll() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          profileBackground: profileBackground.trim() || null,
          themeColor,
          avatarFrame,
          featuredBookIds: selectedFeaturedBookIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar alterações.");
        return;
      }

      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  // Active theme details
  const activeCenterTheme =
    CENTER_THEMES.find((t) => t.id === themeColor) || CENTER_THEMES[0];
  const activeFrame =
    AVATAR_FRAMES.find((f) => f.id === avatarFrame) || AVATAR_FRAMES[0];

  return (
    <div className="min-h-screen max-w-6xl mx-auto rounded-3xl bg-[#17141f] border border-zinc-800/80 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#1e1a29] border-b border-zinc-800 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Voltar ao perfil"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">Editar Perfil</span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                Steam
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 truncate hidden sm:block">
              Personalize o fundo exterior, cor central, avatar animado e destaques
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Steam Configuration Container: Tabs + Content */}
      <div className="flex flex-col md:flex-row md:min-h-[750px]">
        {/* Steam Navigation Tabs: Horizontal scroll on mobile, vertical sidebar on desktop */}
        <div className="w-full md:w-64 bg-[#14111c] border-b md:border-b-0 md:border-r border-zinc-800 p-2 sm:p-4 flex flex-row md:flex-col overflow-x-auto gap-1 sm:space-y-1 shrink-0 scrollbar-none">
          <div className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-2">
            Configurações
          </div>

          {[
            {
              id: "background",
              label: "Fundo (GIF / Foto)",
              icon: ImageIcon,
            },
            {
              id: "centerColor",
              label: "Cor do Meio",
              icon: Palette,
            },
            {
              id: "avatar",
              label: "Avatar & Moldura",
              icon: Sparkles,
            },
            {
              id: "featured",
              label: "Expositor",
              icon: Star,
            },
            {
              id: "general",
              label: "Geral",
              icon: UserIcon,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`whitespace-nowrap px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-purple-900/40 text-purple-200 border border-purple-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Configuration Panel */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB: PLANO DE FUNDO (BACKGROUND) */}
          {activeTab === "background" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Plano de Fundo do Perfil (Exterior)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  A imagem ou <strong>GIF animado</strong> fica no fundo geral da tela, aparecendo nas laterais esquerda e direita da coluna central do perfil.
                </p>
              </div>

              {/* Upload from Machine (GIF / Image) */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border-2 border-dashed border-zinc-700 hover:border-purple-500 transition-colors flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={bgInputRef}
                  accept="image/*,.gif"
                  onChange={(e) => handleFileUpload(e, "bg")}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  {uploadingBg ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">
                  Carregar Imagem ou GIF Animado do Computador
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  Selecione um arquivo <strong>.GIF</strong>, <strong>.PNG</strong> ou <strong>.JPG</strong> da sua máquina (até 25MB).
                </p>

                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  disabled={uploadingBg}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  {uploadingBg ? "Enviando GIF..." : "📁 Escolher Arquivo da Máquina"}
                </button>
              </div>

              {/* Current Background Preview */}
              {profileBackground && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">
                    Pré-visualização do Fundo Atual:
                  </span>
                  <div
                    className="w-full h-40 rounded-xl bg-cover bg-center border border-zinc-700 shadow-inner"
                    style={{ backgroundImage: `url(${profileBackground})` }}
                  />
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span className="truncate max-w-md">{profileBackground}</span>
                    <button
                      type="button"
                      onClick={() => setProfileBackground("")}
                      className="text-red-400 hover:underline"
                    >
                      Remover fundo
                    </button>
                  </div>
                </div>
              )}

              {/* Presets Gallery */}
              <div>
                <span className="text-xs font-bold text-zinc-300 block mb-3">
                  Ou selecione um dos Temas Clássicos:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {PROFILE_THEMES.map((theme) => {
                    const isSelected = profileBackground === theme.imageUrl;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setProfileBackground(theme.imageUrl)}
                        className={`relative rounded-2xl overflow-hidden border h-28 cursor-pointer group transition-all ${
                          isSelected
                            ? "border-purple-400 ring-2 ring-purple-500/40"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                          style={{ backgroundImage: `url(${theme.imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: COR DO MEIO (TEMA CENTRAL) */}
          {activeTab === "centerColor" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Cor do Meio (Container Central do Perfil)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Como no perfil da Steam, o centro possui uma cor e gradiente translúcido personalizável que contrasta perfeitamente com a imagem do fundo exterior.
                </p>
              </div>

              {/* Center Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CENTER_THEMES.map((theme) => {
                  const isSelected = themeColor === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setThemeColor(theme.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-gradient-to-r ${theme.bgGradient} ${
                        isSelected
                          ? "border-purple-400 ring-2 ring-purple-500/40 shadow-lg"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {theme.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            Translúcido com gradiente
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Visual Mini Mockup */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">
                  Exemplo de como o centro ficará:
                </span>
                <div
                  className={`w-full p-4 rounded-xl border bg-gradient-to-b ${activeCenterTheme.bgGradient} ${activeCenterTheme.borderClass} ${activeCenterTheme.glowClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700" />
                    <div>
                      <div className="h-3 w-28 bg-white/40 rounded mb-1.5" />
                      <div className="h-2 w-44 bg-white/20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AVATAR & MOLDURAS */}
          {activeTab === "avatar" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Foto de Perfil & Moldura
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Envie uma foto ou <strong>GIF animado</strong> da sua máquina para o seu avatar.
                </p>
              </div>

              {/* Upload Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*,.gif"
                  onChange={(e) => handleFileUpload(e, "avatar")}
                  className="hidden"
                />

                {/* Avatar Preview with active frame */}
                <div className="relative shrink-0">
                  <div
                    className={`w-28 h-28 rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center text-3xl font-black text-amber-300 ${activeFrame.borderClass} ${activeFrame.ringClass} ${activeFrame.glowClass}`}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white">
                    Enviar GIF ou Foto do Computador
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Suporta avatares animados no formato <strong>.GIF</strong>, exatamente como na Steam!
                  </p>

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>📁 Escolher Arquivo (.gif / .png / .jpg)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Steam Avatar Frames */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2.5">
                  Escolha a Moldura de Avatar:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AVATAR_FRAMES.map((f) => {
                    const isSelected = avatarFrame === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setAvatarFrame(f.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-zinc-800 border-purple-400 ring-2 ring-purple-500/30"
                            : "bg-[#14141d] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-zinc-900 shrink-0 flex items-center justify-center font-bold text-xs ${f.borderClass} ${f.glowClass}`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {f.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {f.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPOSITOR DE DESTAQUES */}
          {activeTab === "featured" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  Expositor de Livros Favoritos (Até 6 títulos)
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione os livros que você quer colocar em destaque na sua vitrine do perfil.
                </p>
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
                  Sua estante ainda não tem livros cadastrados.
                </div>
              )}
            </div>
          )}

          {/* TAB: GERAL (NOME & BIO) */}
          {activeTab === "general" && (
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Informações Gerais do Perfil
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Seu nome visível e biografia/resumo de leitor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome de Perfil
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Biografia / Lema do Leitor
                </label>
                <textarea
                  rows={4}
                  placeholder="Escreva algo sobre você, seus hábitos ou seu lema de leitura..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
