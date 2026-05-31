"use client";

import { useState } from "react";

export function VerifyBanner() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/verify-email/resend", { method: "POST" });
      const data = await res.json();
      setDevLink(data.devLink ?? null);
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span>
        📩 メールアドレスが未確認です。確認するとすべての機能を安心してご利用いただけます。
      </span>
      <div className="flex items-center gap-3">
        {state === "sent" ? (
          devLink ? (
            <a href={devLink} className="font-medium underline">
              確認リンクを開く（開発モード）
            </a>
          ) : (
            <span className="text-amber-700">確認メールを再送しました</span>
          )
        ) : (
          <button
            onClick={resend}
            disabled={state === "sending"}
            className="font-medium underline disabled:opacity-50"
          >
            {state === "sending" ? "送信中..." : "確認メールを再送"}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
