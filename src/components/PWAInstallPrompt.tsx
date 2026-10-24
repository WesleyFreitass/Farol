"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando como app instalado (standalone)
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // Verifica se o usuário já dispensou recentemente
    const dismissedUntil = localStorage.getItem("farol_pwa_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsDismissed(true);
    }
  }

  function handleDismiss() {
    // Guarda dispensa por 5 dias
    localStorage.setItem(
      "farol_pwa_dismissed_until",
      String(Date.now() + 5 * 24 * 60 * 60 * 1000)
    );
    setIsDismissed(true);
  }

  if (isStandalone || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-auto sm:right-5 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl bg-slate-900/95 border border-amber-500/30 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/40 p-1 shrink-0 flex items-center justify-center shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Farol"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
              <span>Instalar o Farol no Celular</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Android
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Acesse como aplicativo nativo direto da sua tela inicial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
