"use client";

import { useEffect } from "react";

// Service Worker を登録する（PWA / インストール可能化のため）。
// 本番（https）でのみ登録する。
export function ServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 登録失敗は致命的ではないため握りつぶす
      });
    }
  }, []);

  return null;
}
