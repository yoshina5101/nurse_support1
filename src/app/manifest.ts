import type { MetadataRoute } from "next";

// PWA マニフェスト。Android（TWA）でアプリ化する際の基本情報。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "あかり｜新卒看護師の就活支援",
    short_name: "あかり",
    description:
      "新卒看護師のための就職活動支援アプリ。自己分析・履歴書・小論文・面接をAIがサポートします。",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf7",
    theme_color: "#2a9d87",
    lang: "ja",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
