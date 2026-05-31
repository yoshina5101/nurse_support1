"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BillingButtons({ plan }: { plan: "FREE" | "PREMIUM" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(path: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "処理に失敗しました。");
      if (data.url) {
        // 外部(Stripe)URLは遷移、内部URLはルーター更新
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

  return (
    <div className="space-y-2">
      {plan === "FREE" ? (
        <button
          className="btn-primary"
          disabled={loading}
          onClick={() => go("/api/billing/checkout")}
        >
          {loading ? "処理中..." : "プレミアムにアップグレード"}
        </button>
      ) : (
        <button
          className="btn-secondary"
          disabled={loading}
          onClick={() => go("/api/billing/portal")}
        >
          {loading ? "処理中..." : "プランを管理・解約する"}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
