"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "monthly" | "sixmonth" | "cancel";

export function BillingButtons({
  kind,
  label,
  accent = false,
}: {
  kind: Kind;
  label: string;
  accent?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const path =
        kind === "cancel" ? "/api/billing/portal" : "/api/billing/checkout";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: kind === "cancel" ? undefined : JSON.stringify({ kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "処理に失敗しました。");
      if (data.url) {
        if (data.url.startsWith("http")) {
          window.location.href = data.url;
        } else {
          router.push(data.url);
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "処理に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  const cls =
    kind === "cancel"
      ? "btn-secondary"
      : accent
        ? "btn-accent w-full"
        : "btn-primary w-full";

  return (
    <div className="space-y-2">
      <button className={cls} disabled={loading} onClick={go}>
        {loading ? "処理中..." : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
