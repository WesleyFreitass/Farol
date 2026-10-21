export interface ProfileTheme {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  accentColor: string;
}

export interface CenterThemeColor {
  id: string;
  name: string;
  bgGradient: string;
  borderClass: string;
  glowClass: string;
  accentColor: string;
}

export interface AvatarFrame {
  id: string;
  name: string;
  borderClass: string;
  ringClass: string;
  glowClass: string;
  badge: string;
}

export const CENTER_THEMES: CenterThemeColor[] = [
  {
    id: "steam_purple",
    name: "Roxo Steam Clássico 🔮",
    bgGradient: "from-[#351540]/90 via-[#220d29]/90 to-[#120716]/95",
    borderClass: "border-purple-500/30",
    glowClass: "shadow-[0_0_50px_rgba(168,85,247,0.15)]",
    accentColor: "#a855f7",
  },
  {
    id: "steam_midnight",
    name: "Azul Meia-Noite 🌌",
    bgGradient: "from-[#11223e]/90 via-[#0c1628]/90 to-[#060b14]/95",
    borderClass: "border-blue-500/30",
    glowClass: "shadow-[0_0_50px_rgba(59,130,246,0.15)]",
    accentColor: "#3b82f6",
  },
  {
    id: "steam_emerald",
    name: "Verde Esmeralda 🌲",
    bgGradient: "from-[#0e2c1e]/90 via-[#0a1d14]/90 to-[#050f0a]/95",
    borderClass: "border-emerald-500/30",
    glowClass: "shadow-[0_0_50px_rgba(16,185,129,0.15)]",
    accentColor: "#10b981",
  },
  {
    id: "steam_crimson",
    name: "Carmesim Nobre 🔥",
    bgGradient: "from-[#3b121c]/90 via-[#260b12]/90 to-[#140509]/95",
    borderClass: "border-rose-500/30",
    glowClass: "shadow-[0_0_50px_rgba(244,63,94,0.15)]",
    accentColor: "#f43f5e",
  },
  {
    id: "steam_gold",
    name: "Âmbar Dourado Farol 🏮",
    bgGradient: "from-[#38240f]/90 via-[#24170a]/90 to-[#130c05]/95",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-[0_0_50px_rgba(245,158,11,0.15)]",
    accentColor: "#f59e0b",
  },
  {
    id: "steam_cyber",
    name: "Cyberpunk Synthwave ⚡",
    bgGradient: "from-[#2f113a]/90 via-[#10192e]/90 to-[#080b13]/95",
    borderClass: "border-cyan-500/30",
    glowClass: "shadow-[0_0_50px_rgba(6,182,212,0.15)]",
    accentColor: "#06b6d4",
  },
  {
    id: "steam_pure_dark",
    name: "Preto Obsidiana Clássico 🖤",
    bgGradient: "from-[#14141e]/92 via-[#0e0e14]/94 to-[#08080c]/98",
    borderClass: "border-zinc-800",
    glowClass: "shadow-2xl",
    accentColor: "#71717a",
  },
];

export const PROFILE_THEMES: ProfileTheme[] = [
  {
    id: "farol_noturno",
    name: "Farol Noturno nas Ondas 🏮",
    category: "Farol Clássico",
    imageUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#f59e0b",
  },
  {
    id: "biblioteca_antiga",
    name: "Biblioteca Ancestral 🏰",
    category: "Fantasia & Clássicos",
    imageUrl:
      "https://images.unsplash.com/photo-1507842229451-9f22be220f86?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#d97706",
  },
  {
    id: "nebulosa_cosmica",
    name: "Nebulosa Cósmica 🌌",
    category: "Ficção Científica",
    imageUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#a855f7",
  },
  {
    id: "noite_chuvosa",
    name: "Chuva & Café Aconchegante 🌧️",
    category: "Atmosférico",
    imageUrl:
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#38bdf8",
  },
  {
    id: "floresta_fantasia",
    name: "Floresta dos Elfos 🌲",
    category: "Fantasia",
    imageUrl:
      "https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#10b981",
  },
  {
    id: "cyberpunk_neon",
    name: "Cyberpunk Synthwave 🔮",
    category: "Futurista",
    imageUrl:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop",
    accentColor: "#ec4899",
  },
];

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: "gold",
    name: "Dourado Nobre 👑",
    borderClass: "border-amber-400 border-2",
    ringClass: "ring-4 ring-amber-400/40",
    glowClass: "shadow-[0_0_20px_rgba(251,191,36,0.5)]",
    badge: "Ouro",
  },
  {
    id: "cosmic",
    name: "Arcano Cósmico 🔮",
    borderClass: "border-purple-400 border-2",
    ringClass: "ring-4 ring-purple-500/40",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    badge: "Místico",
  },
  {
    id: "flame",
    name: "Fogo Primordial 🔥",
    borderClass: "border-orange-500 border-2",
    ringClass: "ring-4 ring-orange-500/40",
    glowClass: "shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    badge: "Chamas",
  },
  {
    id: "emerald",
    name: "Élfico Esmeralda 🌿",
    borderClass: "border-emerald-400 border-2",
    ringClass: "ring-4 ring-emerald-500/40",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.5)]",
    badge: "Élfico",
  },
  {
    id: "neon",
    name: "Neon Synth ⚡",
    borderClass: "border-cyan-400 border-2",
    ringClass: "ring-4 ring-pink-500/40",
    glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    badge: "Cyber",
  },
  {
    id: "classic",
    name: "Minimalista Clássico ⚪",
    borderClass: "border-zinc-500 border-2",
    ringClass: "ring-2 ring-zinc-700/60",
    glowClass: "shadow-md",
    badge: "Clássico",
  },
];
