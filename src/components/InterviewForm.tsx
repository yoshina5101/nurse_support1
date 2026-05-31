"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

type Question = {
  id: string;
  text: string;
  category: string;
  isPremium: boolean;
  locked: boolean;
};

export function InterviewForm({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string>(
    questions[0]?.id ?? "custom"
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    feedback: string;
    score: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // 録音開始時点までに確定済みのテキスト（確定分に追記していく）
  const baseTextRef = useRef("");

  const selected = questions.find((q) => q.id === selectedId);
  const isCustom = selectedId === "custom";
  const locked = selected?.locked ?? false;

  // ブラウザの音声認識対応を判定
  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setSupported(Boolean(SR));
  }, []);

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    baseTextRef.current = answer ? answer.trim() + " " : "";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) baseTextRef.current += finalText;
      setAnswer(baseTextRef.current + interimText);
    };
    recognition.onerror = () => {
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setError(null);
  }

  // アンマウント時に録音を止める
  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (locked) {
      setError("この質問はプレミアム会員限定です。");
      return;
    }
    if (recording) stopRecording();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: isCustom ? undefined : selectedId,
          questionText: isCustom ? customQuestion : undefined,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setResult({ feedback: data.feedback, score: data.score });
      toast.show(
        data.score != null
          ? `AIレビューが完了しました（${data.score}点）`
          : "AIレビューが完了しました",
        "success"
      );
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "レビューに失敗しました。";
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
          <label className="label">質問を選ぶ</label>
          <select
            className="input"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.text}
                {q.isPremium ? "（有料）" : ""}
                {q.locked ? " 🔒" : ""}
              </option>
            ))}
            <option value="custom">自分で質問を入力する</option>
          </select>
        </div>

        {isCustom ? (
          <div>
            <label className="label">質問（自由入力）</label>
            <input
              className="input"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="例：あなたが看護師に向いていると思う理由は？"
              required
            />
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            {locked ? (
              <span className="text-amber-700">
                🔒 この質問はプレミアム会員限定です。プランをアップグレードすると利用できます。
              </span>
            ) : (
              selected?.text
            )}
          </div>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label mb-0">あなたの回答</label>
            {supported ? (
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                disabled={locked}
                className={`btn text-sm ${
                  recording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-white text-brand-700 border border-brand-600 hover:bg-brand-50"
                }`}
              >
                {recording ? "■ 録音停止" : "🎤 録音して回答"}
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                音声入力非対応のブラウザです
              </span>
            )}
          </div>
          {recording && (
            <p className="mb-1 text-xs text-red-500">
              録音中… 話した内容がテキストに反映されます。
            </p>
          )}
          <textarea
            className="input min-h-[180px]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              supported
                ? "「🎤 録音して回答」で話すか、ここに直接入力できます。"
                : "ここに回答を入力してください。"
            }
            disabled={locked}
          />
          <p className="mt-1 text-xs text-gray-400">{answer.length} 文字</p>
        </div>

        <button className="btn-primary" disabled={loading || locked}>
          {loading ? "AIがレビュー中..." : "AIにレビューしてもらう"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="card border-brand-200 bg-brand-50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-brand-700">AIによるレビュー</h3>
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

      <p className="text-xs text-gray-400">
        ※ 音声は端末内で文字起こしされ、サーバーには保存されません（保存されるのは文字起こしテキストとレビューのみ）。
      </p>
    </div>
  );
}
