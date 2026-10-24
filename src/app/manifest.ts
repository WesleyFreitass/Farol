import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farol — Diário de Leituras Inteligente",
    short_name: "Farol",
    description:
      "Acompanhe suas leituras, registre emoções, metas literárias e monitore preços de livros.",
    start_url: "/",
    display: "standalone",
    background_color: "#080d16",
    theme_color: "#080d16",
    orientation: "portrait",
    categories: ["books", "lifestyle", "education"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
