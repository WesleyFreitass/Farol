"use client";

import { useState, useEffect } from "react";
import {
  TrendingDown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  DollarSign,
  AlertCircle,
  Clock,
  History,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { AddWishlistModal } from "./AddWishlistModal";
import { Book } from "./BookDetailModal";

export interface WishlistItem {
  id: string;
  userId: string;
  userBookId?: string | null;
  title: string;
  author: string;
  isbn?: string | null;
  coverUrl?: string | null;
  initialPrice: number;
  currentPrice: number;
  lowestPrice: number;
  targetPrice?: number | null;
  storeName?: string | null;
  productUrl?: string | null;
  lastCheckedAt: string;
  priceDropped: boolean;
  percentDrop: number;
  createdAt: string;
  history?: Array<{
    id: string;
    price: number;
    storeName?: string | null;
    recordedAt: string;
  }>;
}

interface WishlistSummary {
  totalItems: number;
  droppedCount: number;
  totalSaved: number;
}

interface WishlistViewProps {
  books?: Book[];
  onWishlistCountChange?: (count: number, droppedCount: number) => void;
}

export function WishlistView({
  books = [],
  onWishlistCountChange,
}: WishlistViewProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [summary, setSummary] = useState<WishlistSummary>({
    totalItems: 0,
    droppedCount: 0,
    totalSaved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "DROPPED" | "STABLE">("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  async function loadWishlist() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSummary(
          data.summary || { totalItems: 0, droppedCount: 0, totalSaved: 0 }
        );
        if (onWishlistCountChange) {
          onWishlistCountChange(
            data.items?.length || 0,
            data.summary?.droppedCount || 0
          );
        }
      }
    } catch (err) {
      console.error("Erro ao carregar wishlist:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function handleCheckSingle(id: string) {
    if (checkingId) return;
    setCheckingId(id);
    try {
      const res = await fetch(`/api/wishlist/${id}/check`, {
        method: "POST",
      });
      if (res.ok) {
        await loadWishlist();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingId(null);
    }
  }

  async function handleCheckAll() {
    if (checkingAll) return;
    setCheckingAll(true);
    try {
      const res = await fetch("/api/wishlist/check-all", {
        method: "POST",
      });
      if (res.ok) {
        await loadWishlist();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAll(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este livro do radar de preços?")) return;
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadWishlist();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "DROPPED") return item.priceDropped;
    if (filter === "STABLE") return !item.priceDropped;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total no radar */}
        <div className="p-5 rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-xs font-medium text-zinc-400">
            Livros Monitorados
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {summary.totalItems}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            buscando o menor preço do mercado
          </span>
        </div>

        {/* Baixaram de preço */}
        <div
          className={`p-5 rounded-3xl border shadow-md transition-all ${
            summary.droppedCount > 0
              ? "bg-gradient-to-br from-emerald-950/30 via-[#12121a] to-[#12121a] border-emerald-500/40 shadow-emerald-500/5"
              : "bg-[#12121a] border-zinc-800/80"
          }`}
        >
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <span>Baixaram de Preço</span>
            {summary.droppedCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </span>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                summary.droppedCount > 0 ? "text-emerald-400" : "text-white"
              }`}
            >
              {summary.droppedCount} {summary.droppedCount === 1 ? "livro" : "livros"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-400/90 font-medium mt-1 block">
            {summary.droppedCount > 0
              ? "🎉 Ofertas ativas mais baratas que o cadastro!"
              : "Nenhum desconto detectado no momento"}
          </span>
        </div>

        {/* Economia potencial */}
        <div className="p-5 rounded-3xl bg-[#12121a] border border-zinc-800/80 shadow-md">
          <span className="text-xs font-medium text-zinc-400">
            Economia Potencial Total
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              R$ {summary.totalSaved.toFixed(2)}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            valor economizado se comprar os livros em promoção
          </span>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Radar de Preços & Desejos</span>
            <span className="text-xl">🎯</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            O Farol acompanha os preços dos seus livros desejados e te avisa quando o valor cai!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCheckAll}
            disabled={checkingAll || items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-colors cursor-pointer disabled:opacity-50"
            title="Reconsultar preços de todos os livros agora"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${checkingAll ? "animate-spin text-amber-400" : ""}`}
            />
            <span>{checkingAll ? "Verificando..." : "Atualizar Preços"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Livro</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#12121a] p-1.5 rounded-2xl border border-zinc-800/80 w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            filter === "ALL"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Todos ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("DROPPED")}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
            filter === "DROPPED"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-emerald-300"
          }`}
        >
          <span>🔥 Baixaram de Preço</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 font-bold">
            {summary.droppedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("STABLE")}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            filter === "STABLE"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Preço Estável ({items.length - summary.droppedCount})
        </button>
      </div>

      {/* Grid of Wishlist Items */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
          <p className="text-xs">Carregando seu radar de preços...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const savings = item.initialPrice - item.currentPrice;
            const isChecking = checkingId === item.id;
            const isHistoryOpen = expandedHistoryId === item.id;

            return (
              <div
                key={item.id}
                className={`relative rounded-3xl bg-[#12121a] border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                  item.priceDropped
                    ? "border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {/* Dropped Price Alert Banner */}
                {item.priceDropped && (
                  <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 px-4 py-1.5 text-xs font-extrabold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>BAIXOU O PREÇO!</span>
                    </span>
                    <span className="bg-black/20 px-2 py-0.5 rounded-full text-[11px]">
                      -R$ {savings.toFixed(2)} ({item.percentDrop}%)
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Cover image */}
                    <div className="w-20 h-28 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 shadow-md flex items-center justify-center text-2xl">
                      {item.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>📖</span>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 truncate">
                        por <span className="text-zinc-200">{item.author}</span>
                      </p>

                      {/* Store tag */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                          🏪 {item.storeName || "Estante Virtual"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mt-5 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                        Menor Preço Atual
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span
                          className={`text-2xl font-black ${
                            item.priceDropped
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                        >
                          R$ {item.currentPrice.toFixed(2)}
                        </span>

                        {item.priceDropped && (
                          <span className="text-xs text-zinc-500 line-through">
                            R$ {item.initialPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block">
                        Cadastro: R$ {item.initialPrice.toFixed(2)}
                      </span>
                      {item.lowestPrice < item.currentPrice && (
                        <span className="text-[10px] text-amber-400/90 font-medium block">
                          Mín. Histórico: R$ {item.lowestPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Price Status if set */}
                  {item.targetPrice && (
                    <div className="mt-2.5 flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      <span className="flex items-center gap-1">
                        <span>🎯</span>
                        <span>Preço Alvo:</span>
                      </span>
                      <span className="font-bold">
                        R$ {item.targetPrice.toFixed(2)}{" "}
                        {item.currentPrice <= item.targetPrice
                          ? "✅ Atingido!"
                          : "(Falta R$ " + (item.currentPrice - item.targetPrice).toFixed(2) + ")"}
                      </span>
                    </div>
                  )}

                  {/* Last Checked */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Verificado em:{" "}
                        {new Date(item.lastCheckedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHistoryId(isHistoryOpen ? null : item.id)
                      }
                      className="text-amber-400/80 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3 h-3" />
                      <span>Histórico</span>
                    </button>
                  </div>

                  {/* Expandable History Table */}
                  {isHistoryOpen && (
                    <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs animate-in fade-in duration-150">
                      <span className="font-bold text-zinc-300 block mb-2">
                        Histórico de Preços:
                      </span>
                      {item.history && item.history.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {item.history.map((h, i) => (
                            <div
                              key={h.id || i}
                              className="flex items-center justify-between text-[11px] text-zinc-400 py-0.5 border-b border-zinc-900 last:border-none"
                            >
                              <span>
                                {new Date(h.recordedAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="font-semibold text-white">
                                R$ {h.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {h.storeName || "Loja"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500">
                          Primeiro registro cadastrado.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCheckSingle(item.id)}
                      disabled={isChecking}
                      title="Checar preço ao vivo agora"
                      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isChecking ? "animate-spin text-amber-400" : ""}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Remover do radar"
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Direct Buy Button */}
                  {item.productUrl ? (
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                        item.priceDropped
                          ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                          : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                      }`}
                    >
                      <span>Ver Oferta na Loja</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
                        item.title + " livro"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    >
                      <span>Buscar Ofertas</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-[#12121a] border border-zinc-800/80">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4">
            🎯
          </div>
          <h3 className="text-lg font-bold text-white">
            {filter === "DROPPED"
              ? "Nenhum livro com queda de preço no momento"
              : "Seu radar de preços está vazio"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
            {filter === "DROPPED"
              ? "Conforme as livrarias e sebos atualizarem os valores, os livros com desconto aparecerão aqui."
              : "Adicione livros que você deseja comprar. O Farol monitorará as livrarias e te avisará sempre que o preço cair!"}
          </p>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Primeiro Livro ao Radar</span>
          </button>
        </div>
      )}

      {/* Modal Add Wishlist */}
      <AddWishlistModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadWishlist}
        shelfBooks={books}
        existingWishlistTitles={
          new Set(
            items.map((i) =>
              i.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .trim()
            )
          )
        }
      />
    </div>
  );
}
