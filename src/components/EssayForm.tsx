"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

type Theme = {
  id: string;
  title: string;
  prompt: string;
  isPremium: boolean;
  locked: boolean;
};

export function EssayForm({ themes }: { themes: Theme[] }) {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string>(themes[0]?.id ?? "custom");
  const [customTheme, setCustomTheme] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ feedback: string; score: number | null } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const selected = themes.find((t) => t.id === selectedId);
  const isCustom = selectedId === "custom";
  const locked = selected?.locked ?? false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (locked) {
      setError("このお題はプレミアム会員限定です。");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: isCustom ? undefined : selectedId,
          themeText: isCustom ? customTheme : undefined,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setResult({ feedback: data.feedback, score: data.score });
      toast.show(
        data.score != null
          ? `AI添削が完了しました（${data.score}点）`
          : "AI添削が完了しました",
        "success"
      );
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "添削に失敗しました。";
      setError(msg);
      toast.show(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label">お題を選ぶ</label>
          <select
            className="input"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
                {t.isPremium ? "（有料）" : ""}
                {t.locked ? " 🔒" : ""}
              </option>
            ))}
            <option value="custom">自分でお題を入力する</option>
          </select>
        </div>

        {isCustom ? (
          <div>
            <label className="label">お題（自由入力）</label>
            <input
              className="input"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="例：これからの看護師に求められる力とは"
              required
            />
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            {locked ? (
              <span className="text-amber-700">
                🔒 このお題はプレミアム会員限定です。プランをアップグレードすると利用できます。
              </span>
            ) : (
              selected?.prompt
            )}
          </div>
        )}

        <div>
          <label className="label">本文</label>
          <textarea
            className="input min-h-[220px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="ここに小論文を書いてください。"
            disabled={locked}
          />
          <p className="mt-1 text-xs text-gray-400">{body.length} 文字</p>
        </div>

        <button className="btn-primary" disabled={loading || locked}>
          {loading ? "AIが添削中..." : "AI添削を受ける"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="card border-brand-200 bg-brand-50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-brand-700">AIによる添削</h3>
            {result.score !== null && (
              <span className="badge bg-brand-600 text-white text-sm">
                {result.score} / 100 点
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {result.feedback}
          </pre>
        </div>
      )}
    </div>
  );
}
