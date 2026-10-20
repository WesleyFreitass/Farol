export interface ReadingEmotion {
  id: string;
  label: string;
  category: "positiva" | "intensa" | "reflexiva" | "densa";
  color: string;
  emoji: string;
}

export const READING_EMOTIONS: ReadingEmotion[] = [
  // Inspiradoras / Positivas
  { id: "curiosa", label: "Curiosa", category: "positiva", color: "bg-amber-500/15 text-amber-300 border-amber-500/30", emoji: "🧐" },
  { id: "inspirada", label: "Inspirada", category: "positiva", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", emoji: "💡" },
  { id: "pensativa", label: "Pensativa", category: "reflexiva", color: "bg-blue-500/15 text-blue-300 border-blue-500/30", emoji: "🤔" },
  { id: "relaxada", label: "Relaxada", category: "positiva", color: "bg-teal-500/15 text-teal-300 border-teal-500/30", emoji: "🌿" },
  { id: "comovida", label: "Comovida", category: "reflexiva", color: "bg-purple-500/15 text-purple-300 border-purple-500/30", emoji: "🥺" },
  { id: "nostálgica", label: "Nostálgica", category: "reflexiva", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", emoji: "📻" },
  { id: "agraciada", label: "Agraciada", category: "positiva", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", emoji: "✨" },
  { id: "afetuosa", label: "Afetuosa", category: "positiva", color: "bg-rose-500/15 text-rose-300 border-rose-500/30", emoji: "🥰" },
  { id: "surpresa", label: "Surpresa", category: "intensa", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", emoji: "😲" },
  { id: "apaixonada", label: "Apaixonada", category: "positiva", color: "bg-pink-500/15 text-pink-300 border-pink-500/30", emoji: "❤️" },
  { id: "divertida", label: "Divertida", category: "positiva", color: "bg-orange-500/15 text-orange-300 border-orange-500/30", emoji: "😄" },
  { id: "alegre", label: "Alegre", category: "positiva", color: "bg-lime-500/15 text-lime-300 border-lime-500/30", emoji: "😊" },
  { id: "cômica", label: "Cômica", category: "positiva", color: "bg-amber-400/15 text-amber-300 border-amber-400/30", emoji: "🤣" },

  // Intensas / Eufóricas / Ansiosas
  { id: "surtada", label: "Surtada", category: "intensa", color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30", emoji: "🤯" },
  { id: "ansiosa", label: "Ansiosa", category: "intensa", color: "bg-violet-500/15 text-violet-300 border-violet-500/30", emoji: "🫣" },
  { id: "aflita", label: "Aflita", category: "intensa", color: "bg-purple-600/15 text-purple-300 border-purple-600/30", emoji: "😣" },
  { id: "tensa", label: "Tensa", category: "intensa", color: "bg-red-500/15 text-red-300 border-red-500/30", emoji: "😬" },
  { id: "empolgada", label: "Empolgada", category: "intensa", color: "bg-amber-400/15 text-amber-200 border-amber-400/30", emoji: "🤩" },
  { id: "excitada", label: "Excitada", category: "intensa", color: "bg-pink-600/15 text-pink-300 border-pink-600/30", emoji: "🔥" },
  { id: "eufórica", label: "Eufórica", category: "intensa", color: "bg-yellow-400/15 text-yellow-200 border-yellow-400/30", emoji: "🎉" },
  { id: "chocada", label: "Chocada", category: "intensa", color: "bg-sky-500/15 text-sky-300 border-sky-500/30", emoji: "😱" },
  { id: "horrorizada", label: "Horrorizada", category: "densa", color: "bg-red-700/15 text-red-300 border-red-700/30", emoji: "😨" },
  { id: "enojada", label: "Enojada", category: "densa", color: "bg-emerald-700/15 text-emerald-300 border-emerald-700/30", emoji: "🤢" },
  { id: "devastada", label: "Devastada", category: "densa", color: "bg-slate-700/20 text-slate-300 border-slate-600/30", emoji: "💔" },

  // Foco & Conexão
  { id: "conectada", label: "Conectada", category: "reflexiva", color: "bg-sky-500/15 text-sky-300 border-sky-500/30", emoji: "🔗" },
  { id: "focada", label: "Focada", category: "reflexiva", color: "bg-cyan-600/15 text-cyan-300 border-cyan-600/30", emoji: "🎯" },
  { id: "intensa", label: "Intensa", category: "intensa", color: "bg-rose-600/15 text-rose-300 border-rose-600/30", emoji: "⚡" },

  // Reflexivas / Vulneráveis
  { id: "vulnerável", label: "Vulnerável", category: "reflexiva", color: "bg-indigo-400/15 text-indigo-200 border-indigo-400/30", emoji: "🫀" },
  { id: "envergonhada", label: "Envergonhada", category: "densa", color: "bg-rose-400/15 text-rose-300 border-rose-400/30", emoji: "🙈" },
  { id: "triste", label: "Triste", category: "densa", color: "bg-blue-600/15 text-blue-300 border-blue-600/30", emoji: "😢" },
  { id: "melancólica", label: "Melancólica", category: "reflexiva", color: "bg-slate-500/15 text-slate-300 border-slate-500/30", emoji: "🌧️" },

  // Dúvida, Distração e Reação Crítica
  { id: "distraída", label: "Distraída", category: "densa", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30", emoji: "😶‍🌫️" },
  { id: "confusa", label: "Confusa", category: "densa", color: "bg-stone-500/15 text-stone-300 border-stone-500/30", emoji: "😵‍💫" },
  { id: "desconfiada", label: "Desconfiada", category: "intensa", color: "bg-amber-600/15 text-amber-300 border-amber-600/30", emoji: "🤨" },
  { id: "irritada", label: "Irritada", category: "densa", color: "bg-orange-600/15 text-orange-300 border-orange-600/30", emoji: "😤" },
  { id: "raivosa", label: "Raivosa", category: "densa", color: "bg-red-600/15 text-red-300 border-red-600/30", emoji: "😡" },
  { id: "indignada", label: "Indignada", category: "densa", color: "bg-rose-700/15 text-rose-300 border-rose-700/30", emoji: "🤬" },
  { id: "amedrontada", label: "Amedrontada", category: "densa", color: "bg-slate-600/15 text-slate-300 border-slate-600/30", emoji: "😰" },
  { id: "frustrada", label: "Frustrada", category: "densa", color: "bg-neutral-600/15 text-neutral-300 border-neutral-600/30", emoji: "🫥" },
  { id: "cansada", label: "Cansada", category: "densa", color: "bg-zinc-600/15 text-zinc-300 border-zinc-600/30", emoji: "🥱" },
  { id: "entediada", label: "Entediada", category: "densa", color: "bg-stone-600/15 text-stone-300 border-stone-600/30", emoji: "😴" },
  { id: "rançosa", label: "Rançosa", category: "densa", color: "bg-emerald-800/15 text-emerald-300 border-emerald-800/30", emoji: "🙄" },
  { id: "indiferente", label: "Indiferente", category: "densa", color: "bg-gray-500/15 text-gray-300 border-gray-500/30", emoji: "😐" },
  { id: "apática", label: "Apática", category: "densa", color: "bg-zinc-700/15 text-zinc-400 border-zinc-700/30", emoji: "😶" },
];

export const EMOTIONS_BY_ID = new Map(READING_EMOTIONS.map(e => [e.id, e]));
