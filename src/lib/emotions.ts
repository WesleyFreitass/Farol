export interface ReadingEmotion {
  id: string;
  label: string;
  group: "green" | "yellow" | "orange" | "red" | "blue" | "purple" | "gray";
  dotColor: string;
  isStar?: boolean;
}

export const READING_EMOTIONS: ReadingEmotion[] = [
  // 1. Grupo Verde
  { id: "curiosa", label: "curiosa", group: "green", dotColor: "bg-lime-500 text-lime-400" },
  { id: "inspirada", label: "inspirada", group: "green", dotColor: "text-lime-400", isStar: true },
  { id: "pensativa", label: "pensativa", group: "green", dotColor: "bg-lime-500 text-lime-400" },
  { id: "relaxada", label: "relaxada", group: "green", dotColor: "bg-lime-500 text-lime-400" },
  { id: "comovida", label: "comovida", group: "green", dotColor: "bg-lime-500 text-lime-400" },
  { id: "nostálgica", label: "nostálgica", group: "green", dotColor: "bg-lime-500 text-lime-400" },
  { id: "agraciada", label: "agraciada", group: "green", dotColor: "bg-lime-500 text-lime-400" },

  // 2. Grupo Amarelo
  { id: "afetuosa", label: "afetuosa", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },
  { id: "surpresa", label: "surpresa", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },
  { id: "apaixonada", label: "apaixonada", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },
  { id: "divertida", label: "divertida", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },
  { id: "alegre", label: "alegre", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },
  { id: "cômica", label: "cômica", group: "yellow", dotColor: "bg-amber-400 text-amber-300" },

  // 3. Grupo Laranja
  { id: "surtada", label: "surtada", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "ansiosa", label: "ansiosa", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "aflita", label: "aflita", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "tensa", label: "tensa", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "distraída", label: "distraída", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "confusa", label: "confusa", group: "orange", dotColor: "bg-orange-500 text-orange-400" },
  { id: "desconfiada", label: "desconfiada", group: "orange", dotColor: "text-orange-400", isStar: true },

  // 4. Grupo Vermelho / Carmim
  { id: "irritada", label: "irritada", group: "red", dotColor: "bg-rose-500 text-rose-400" },
  { id: "raivosa", label: "raivosa", group: "red", dotColor: "bg-rose-500 text-rose-400" },
  { id: "indignada", label: "indignada", group: "red", dotColor: "bg-rose-500 text-rose-400" },
  { id: "amedrontada", label: "amedrontada", group: "red", dotColor: "bg-rose-500 text-rose-400" },
  { id: "vulnerável", label: "vulnerável", group: "red", dotColor: "bg-rose-500 text-rose-400" },
  { id: "envergonhada", label: "envergonhada", group: "red", dotColor: "bg-rose-500 text-rose-400" },

  // 5. Grupo Azul
  { id: "frustrada", label: "frustrada", group: "blue", dotColor: "bg-sky-500 text-sky-400" },
  { id: "triste", label: "triste", group: "blue", dotColor: "bg-sky-500 text-sky-400" },
  { id: "melancólica", label: "melancólica", group: "blue", dotColor: "bg-sky-500 text-sky-400" },
  { id: "cansada", label: "cansada", group: "blue", dotColor: "bg-sky-500 text-sky-400" },
  { id: "entediada", label: "entediada", group: "blue", dotColor: "text-sky-400", isStar: true },

  // 6. Grupo Roxo / Violeta
  { id: "conectada", label: "conectada", group: "purple", dotColor: "bg-purple-500 text-purple-400" },
  { id: "focada", label: "focada", group: "purple", dotColor: "bg-purple-500 text-purple-400" },
  { id: "intensa", label: "intensa", group: "purple", dotColor: "bg-purple-500 text-purple-400" },
  { id: "empolgada", label: "empolgada", group: "purple", dotColor: "bg-purple-500 text-purple-400" },
  { id: "excitada", label: "excitada", group: "purple", dotColor: "bg-purple-500 text-purple-400" },
  { id: "eufórica", label: "eufórica", group: "purple", dotColor: "bg-purple-500 text-purple-400" },

  // 7. Grupo Cinza
  { id: "chocada", label: "chocada", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "horrorizada", label: "horrorizada", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "enojada", label: "enojada", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "devastada", label: "devastada", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "rançosa", label: "rançosa", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "indiferente", label: "indiferente", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
  { id: "apática", label: "apática", group: "gray", dotColor: "bg-zinc-400 text-zinc-400" },
];

export const EMOTIONS_BY_ID = new Map(READING_EMOTIONS.map((e) => [e.id, e]));
