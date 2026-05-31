"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // プロバイダ外でも落ちないようにフォールバック
    return { show: () => {} };
  }
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <FlashFromQuery />
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-fade-in-up rounded-full px-4 py-2.5 text-sm font-medium shadow-soft-lg ${
              t.type === "success"
                ? "bg-brand-600 text-white"
                : t.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-white"
            }`}
          >
            {t.type === "success" ? "✓ " : t.type === "error" ? "⚠ " : ""}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// URLクエリ（?flash=...&flashType=...）に応じてトーストを表示する。
// サーバーアクションのリダイレクト後にメッセージを出すために使う。
function FlashFromQuery() {
  const { show } = useToast();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    const flash = params.get("flash");
    if (!flash) return;
    const type = (params.get("flashType") as ToastType) || "success";
    show(flash, type);
    // クエリを消してリロード時の再表示を防ぐ
    const url = new URL(window.location.href);
    url.searchParams.delete("flash");
    url.searchParams.delete("flashType");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, params]);

  return null;
}
