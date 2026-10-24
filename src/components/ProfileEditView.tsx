"use client";

import { useState, useRef, useMemo } from "react";
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
  Sliders,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import { Book } from "./BookDetailModal";
import {
  PROFILE_THEMES,
  AVATAR_FRAMES,
  CENTER_THEMES,
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
  // Reorganized logical tab sequence (Item 13)
  const [activeTab, setActiveTab] = useState<
    "general" | "avatar" | "theme" | "showcase"
  >("general");

  // Form states
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [profileBackground, setProfileBackground] = useState(
    profile.profileBackground || ""
  );
  const [themeColor, setThemeColor] = useState(
    profile.themeColor || "steam_midnight"
  );
  const [themeOpacity, setThemeOpacity] = useState<number>(
    profile.themeOpacity ?? 85
  );
  const [replayMonth, setReplayMonth] = useState<string>(
    profile.replayMonth || "current"
  );
  const [readingGoal, setReadingGoal] = useState<number>(
    profile.readingGoal ?? 12
  );
  const [avatarFrame, setAvatarFrame] = useState(
    profile.avatarFrame || "gold"
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

  const availableReplayMonths = useMemo(() => {
    const list: { value: string; label: string }[] = [
      { value: "current", label: "Mês Atual / Dinâmico (Sempre em tempo real)" },
    ];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const name = d.toLocaleDateString("pt-BR", { month: "long" });
      const formatted = name.charAt(0).toUpperCase() + name.slice(1);
      list.push({
        value: val,
        label: `${formatted} / ${d.getFullYear()}`,
      });
    }
    if (
      replayMonth &&
      replayMonth !== "current" &&
      !list.some((item) => item.value === replayMonth)
    ) {
      list.push({ value: replayMonth, label: replayMonth });
    }
    return list;
  }, [replayMonth]);

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

      if (!res.ok) {
        if (res.status === 413) {
          setError("O arquivo é muito grande para o servidor. Tente um GIF de até 35MB.");
          return;
        }
        try {
          const data = await res.json();
          setError(data.error || `Erro no envio do arquivo (código ${res.status}).`);
        } catch {
          setError(`Erro no servidor ao enviar arquivo (código ${res.status}).`);
        }
        return;
      }

      const data = await res.json();
      if (isBg) {
        setProfileBackground(data.url);
      } else {
        setAvatarUrl(data.url);
      }
    } catch (err) {
      console.error(err);
      setError("Falha na conexão ao enviar o arquivo do computador. Verifique o tamanho do arquivo.");
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
          themeOpacity,
          replayMonth,
          readingGoal,
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
    <div className="min-h-screen max-w-6xl mx-auto rounded-3xl bg-[#0c121d] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#101726] border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Voltar ao perfil"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">Editar Perfil</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-medium">
                Farol
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Personalize sua identidade, avatar, fundo exterior, cor central e expositores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Perfil</span>
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

      {/* Configuration Container: Sidebar Tabs + Content */}
      <div className="flex flex-col md:flex-row md:min-h-[720px]">
        {/* Navigation Tabs (Logical Order) */}
        <div className="w-full md:w-64 bg-[#0a0e17] border-b md:border-b-0 md:border-r border-slate-800 p-2 sm:p-4 flex flex-row md:flex-col overflow-x-auto gap-1 sm:space-y-1 shrink-0 scrollbar-none">
          <div className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Configurações
          </div>

          {[
            {
              id: "general",
              label: "1. Geral & Bio",
              icon: UserIcon,
            },
            {
              id: "avatar",
              label: "2. Avatar & Moldura",
              icon: Sparkles,
            },
            {
              id: "theme",
              label: "3. Fundo, Cor & Opacidade",
              icon: Palette,
            },
            {
              id: "showcase",
              label: "4. Destaques & Replay",
              icon: Star,
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
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration Panel Content */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: GERAL (NOME & BIO) */}
          {activeTab === "general" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">
                  Identidade do Leitor
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Seu nome visível na comunidade e a biografia/frase marcante do seu perfil.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome de Perfil
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Biografia / Lema do Leitor
                </label>
                <textarea
                  rows={4}
                  placeholder="Escreva algo sobre você, seus hábitos de leitura ou citações que inspiram sua vida..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: AVATAR & MOLDURAS */}
          {activeTab === "avatar" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Foto de Perfil & Moldura
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Envie uma foto ou <strong>GIF animado</strong> da sua máquina para o seu avatar e escolha uma moldura exclusiva.
                </p>
              </div>

              {/* Upload Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
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
                    className={`w-28 h-28 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center text-3xl font-black text-amber-300 ${activeFrame.borderClass} ${activeFrame.ringClass} ${activeFrame.glowClass}`}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : "F"}</span>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-bold text-white">
                    Avatar Personalizado
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Formatos suportados: <strong>.GIF animado</strong>, <strong>.PNG</strong> ou <strong>.JPG</strong> (até 35MB).
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingAvatar ? "Enviando..." : "Escolher do Computador"}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Frames Grid */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-3">
                  Escolha sua Moldura de Leitor:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVATAR_FRAMES.map((f) => {
                    const isSelected = avatarFrame === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setAvatarFrame(f.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-slate-900/60 ${
                          isSelected
                            ? "border-amber-400 ring-2 ring-amber-500/30"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center text-xs font-bold text-amber-300 ${f.borderClass} ${f.ringClass}`}
                          >
                            <BookOpen className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {f.name}
                            </span>
                            <span className="text-[10px] text-amber-300/80 font-medium">
                              {f.badge}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEMA, FUNDO & TRANSLUCIDEZ */}
          {activeTab === "theme" && (
            <div className="max-w-2xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-white">
                  Plano de Fundo, Cor & Translucidez
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Defina o GIF ou foto exterior de tela cheia, a cor central do perfil e o nível exato de transparência.
                </p>
              </div>

              {/* 1. Translucency Slider Control (Item 2) */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Translucidez (Opacidade) da Cor do Meio:
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {themeOpacity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={themeOpacity}
                  onChange={(e) => setThemeOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Mais transparente (vê mais o GIF/fundo)</span>
                  <span>Mais sólido (foco nas informações)</span>
                </div>
              </div>

              {/* 2. Upload from PC (GIF / Image) */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-amber-500/60 transition-colors flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={bgInputRef}
                  accept="image/*,.gif"
                  onChange={(e) => handleFileUpload(e, "bg")}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  {uploadingBg ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <h4 className="text-sm font-bold text-white">
                  Carregar Fundo Exterior do Computador (.GIF ou Imagem)
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Selecione um arquivo <strong>.GIF</strong> animado ou imagem (.PNG, .JPG) de até 35MB.
                </p>

                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  disabled={uploadingBg}
                  className="mt-3.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBg ? "Enviando Fundo..." : "Escolher Arquivo da Máquina"}</span>
                </button>
              </div>

              {/* Current Background Preview */}
              {profileBackground && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Fundo Selecionado:</span>
                    <button
                      type="button"
                      onClick={() => setProfileBackground("")}
                      className="text-rose-400 hover:underline"
                    >
                      Remover fundo
                    </button>
                  </div>
                  <div
                    className="w-full h-36 rounded-xl bg-cover bg-center border border-slate-700 shadow-inner"
                    style={{ backgroundImage: `url(${profileBackground})` }}
                  />
                  <span className="text-[11px] text-slate-500 truncate block">
                    {profileBackground}
                  </span>
                </div>
              )}

              {/* 3. Center Theme Colors */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-3">
                  Cor da Coluna Central:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CENTER_THEMES.map((theme) => {
                    const isSelected = themeColor === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setThemeColor(theme.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-gradient-to-r ${theme.bgGradient} ${
                          isSelected
                            ? "border-amber-400 ring-2 ring-amber-500/40 shadow-lg"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-xs font-bold text-white">
                            {theme.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Themes presets */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-3">
                  Ou escolha um Wallpaper Clássico da Coleção Farol:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {PROFILE_THEMES.map((theme) => {
                    const isSelected = profileBackground === theme.imageUrl;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setProfileBackground(theme.imageUrl)}
                        className={`relative rounded-2xl overflow-hidden border h-24 cursor-pointer group transition-all ${
                          isSelected
                            ? "border-amber-400 ring-2 ring-amber-500/40"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                          style={{ backgroundImage: `url(${theme.imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3" />
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

          {/* TAB 4: DESTAQUES, REPLAY & META ANUAL */}
          {activeTab === "showcase" && (
            <div className="max-w-2xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-white">
                  Expositores, Replay Mensal & Meta de Leitura
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Defina o que você mais se orgulha de exibir para os tripulantes do Farol.
                </p>
              </div>

              {/* Replay Farol Month Selector (Item 7) */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Período em Destaque no Replay Farol:
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Escolha se o card de Replay no seu perfil deve exibir o mês corrente ou um mês específico da sua jornada literária:
                </p>
                <select
                  value={replayMonth}
                  onChange={(e) => setReplayMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  {availableReplayMonths.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Annual Reading Goal (Item 18) */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    Meta Anual de Leitura (Desafio do Farol):
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Quantos livros você deseja concluir este ano?
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={readingGoal}
                    onChange={(e) => setReadingGoal(Math.max(1, Number(e.target.value) || 1))}
                    className="w-32 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-amber-400 text-center outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">livros por ano</span>
                </div>
              </div>

              {/* Featured Books Showcase */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 block">
                    Vitrine de Livros Favoritos (Até 6 livros):
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {selectedFeaturedBookIds.length} de 6 selecionados
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
                              ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/30"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className="w-16 h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shadow-md flex items-center justify-center shrink-0 mb-2">
                            {book.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-6 h-6 text-slate-600" />
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[120px]">
                            {book.author}
                          </p>

                          <div className="mt-2">
                            {isFeatured ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                                ⭐ Destaque
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 hover:text-slate-300">
                                + Destacar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Sua estante ainda não tem livros cadastrados.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
