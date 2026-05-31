"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  WIZARD_QUESTIONS,
  STRENGTHS,
  aggregateStrengths,
  answersToLabels,
} from "@/lib/selfAnalysisWizard";

type Phase = "quiz" | "result";

export function SelfAnalysisWizard() {
  const router = useRouter();
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const q = WIZARD_QUESTIONS[step];
  const total = WIZARD_QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  function choose(optionIndex: number) {
    const next = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setPhase("result");
    }
  }

  const ranked = aggregateStrengths(answers);
  const top = ranked.slice(0, 3);

  async function runAi() {
    setLoading(true);
    try {
      const res = await fetch("/api/self-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersToLabels(answers),
          strengths: top.map((t) => STRENGTHS[t.key].label),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析に失敗しました。");
      setSummary(data.aiSummary);
      toast.show("AIによる深掘りが完了しました", "success");
      router.refresh();
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "分析に失敗しました。",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setSummary(null);
    setPhase("quiz");
  }

  // ===== クイズ画面 =====
  if (phase === "quiz") {
    return (
      <div className="card space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              質問 {step + 1} / {total}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800">{q.question}</h3>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className="w-full rounded-xl border border-cream-200 bg-cream-50/50 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-brand-300 hover:bg-brand-50"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← ひとつ戻る
          </button>
        )}
      </div>
    );
  }

  // ===== 結果画面 =====
  return (
    <div className="space-y-6">
      <div className="card border-brand-200 bg-brand-50/50">
        <h3 className="font-bold text-brand-700">
          🌟 あなたの強み（診断結果）
        </h3>
        <div className="mt-3 space-y-3">
          {top.map((t, i) => (
            <div key={t.key} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-gray-800">
                  {STRENGTHS[t.key].label}
                </p>
                <p className="text-sm text-gray-600">
                  {STRENGTHS[t.key].description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!summary ? (
        <div className="card flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-600">
            この強みを、就職活動でどう活かせるか。
            <br />
            AIがさらに深掘りして、具体的な問いかけとアドバイスを返します。
          </p>
          <button
            onClick={runAi}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "AIが深掘り中..." : "AIに強みを深掘りしてもらう"}
          </button>
          <button
            onClick={restart}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            もう一度診断する
          </button>
        </div>
      ) : (
        <>
          <div className="card border-brand-200 bg-brand-50">
            <h3 className="mb-2 font-semibold text-brand-700">
              AIによる強みの深掘り
            </h3>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {summary}
            </pre>
          </div>
          <button
            onClick={restart}
            className="text-sm text-brand-600 hover:underline"
          >
            もう一度診断する
          </button>
        </>
      )}
    </div>
  );
}
