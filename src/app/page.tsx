export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/20">
            🏮
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Farol
            </h1>
            <p className="text-xs text-slate-400">Guia de Leitura & Avaliações</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Produção Pronta
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-6">
          <span>✨</span>
          <span>farol.pampo.tech</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Ilumine sua jornada de{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            leituras
          </span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Registre seu progresso, avalie títulos, organize suas estantes e descubra novos livros com o Farol.
        </p>

        {/* Feature Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-slate-100">Estantes & Progresso</h3>
            <p className="text-sm text-slate-400 mt-2">
              Acompanhe páginas lidas, porcentagens e status de cada leitura (Lendo, Lido, Quero Ler).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-slate-100">Avaliações & Notas</h3>
            <p className="text-sm text-slate-400 mt-2">
              Dê notas de 1 a 5 estrelas, escreva resenhas detalhadas e guarde suas citações favoritas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-slate-100">Busca & Catálogo</h3>
            <p className="text-sm text-slate-400 mt-2">
              Pesquise facilmente milhões de títulos, autores, sinopses e capas de livros.
            </p>
          </div>
        </div>

        {/* Status Box */}
        <div className="mt-12 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4">
          <span>Docker Standalone (Alpine)</span>
          <span>•</span>
          <span>Porta 3100 (Host)</span>
          <span>•</span>
          <span>SSL Let&apos;s Encrypt</span>
          <span>•</span>
          <span>CI/CD Automático via GitHub Actions</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Farol &bull; Desenvolvido para WesleyFreitass &bull; farol.pampo.tech
      </footer>
    </div>
  );
}
