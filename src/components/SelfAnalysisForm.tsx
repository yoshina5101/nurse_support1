"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SelfAnalysisForm({
  questions,
  initialAnswers,
}: {
  questions: readonly string[];
  initialAnswers?: Record<string, string>;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialAnswers ?? {}
  );
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/self-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setSummary(data.aiSummary);
      router.refresh();
    } catch {
      setError("分析に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-5">
        {questions.map((q, i) => (
          <div key={i}>
            <label className="label">{q}</label>
            <textarea
              className="input min-h-[80px]"
              value={answers[q] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
              }
            />
          </div>
        ))}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "AIが分析中..." : "AIに分析してもらう"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {summary && (
        <div className="card border-brand-200 bg-brand-50">
          <h3 className="mb-2 font-semibold text-brand-700">AIによる自己分析結果</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {summary}
          </pre>
        </div>
      )}
    </div>
  );
}
