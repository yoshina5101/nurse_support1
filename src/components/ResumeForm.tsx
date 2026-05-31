"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

type Field = { key: string; label: string; multiline?: boolean; hint?: string };

export function ResumeForm({
  fields,
  initial,
}: {
  fields: Field[];
  initial?: {
    id: string;
    title: string;
    content: Record<string, string>;
    aiFeedback: string | null;
  };
}) {
  const router = useRouter();
  const toast = useToast();
  const [id, setId] = useState<string | undefined>(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "私の履歴書");
  const [content, setContent] = useState<Record<string, string>>(
    initial?.content ?? {}
  );
  const [feedback, setFeedback] = useState<string | null>(
    initial?.aiFeedback ?? null
  );
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(review: boolean) {
    review ? setReviewing(true) : setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, content, review }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "処理に失敗しました。");
      setId(data.id);
      if (review) setFeedback(data.aiFeedback);
      const msg = review ? "AI添削が完了しました。" : "保存しました。";
      setMessage(msg);
      toast.show(msg, "success");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "処理に失敗しました。もう一度お試しください。";
      setMessage(msg);
      toast.show(msg, "error");
    } finally {
      setReviewing(false);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-5">
        <div>
          <label className="label">履歴書タイトル</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            {f.hint && (
              <p className="mb-1 text-xs text-brand-600">{f.hint}</p>
            )}
            {f.multiline ? (
              <textarea
                className="input min-h-[90px]"
                value={content[f.key] ?? ""}
                onChange={(e) =>
                  setContent((p) => ({ ...p, [f.key]: e.target.value }))
                }
              />
            ) : (
              <input
                className="input"
                value={content[f.key] ?? ""}
                onChange={(e) =>
                  setContent((p) => ({ ...p, [f.key]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-secondary"
            onClick={() => submit(false)}
            disabled={saving || reviewing}
          >
            {saving ? "保存中..." : "下書き保存"}
          </button>
          <button
            className="btn-primary"
            onClick={() => submit(true)}
            disabled={saving || reviewing}
          >
            {reviewing ? "AIが添削中..." : "保存してAI添削を受ける"}
          </button>
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      {feedback && (
        <div className="card border-brand-200 bg-brand-50">
          <h3 className="mb-2 font-semibold text-brand-700">AIによる添削</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {feedback}
          </pre>
        </div>
      )}
    </div>
  );
}
