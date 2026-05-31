"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";

type Message = {
  id: string;
  body: string;
  isDeleted: boolean;
  authorName: string;
  isMine: boolean;
  createdAt: string;
};

export function ChatRoomView({ roomId }: { roomId: string }) {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    } catch {
      // ネットワーク一時エラーは無視（次のポーリングで回復）
    }
  }, [roomId]);

  // 3秒ごとにポーリング
  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setWarning(null);
    const body = input;
    try {
      const res = await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setInput("");
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        // 誹謗中傷ワード等でブロックされた場合は入力を残して警告表示
        setWarning(data.error || "メッセージを送信できませんでした。");
      }
    } catch {
      setWarning("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setSending(false);
    }
  }

  async function report(messageId: string) {
    const reason = window.prompt("通報理由を入力してください（任意）", "不適切な内容");
    if (reason === null) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, reason }),
    });
    if (res.ok) {
      toast.show("通報を受け付けました。ご協力ありがとうございます。", "success");
    } else {
      toast.show("通報に失敗しました。", "error");
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            まだメッセージはありません。最初の投稿をしてみましょう。
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
          >
            <div className={`group max-w-[75%] ${m.isMine ? "items-end" : ""}`}>
              {!m.isMine && (
                <p className="mb-0.5 text-xs text-gray-400">{m.authorName}</p>
              )}
              <div className="flex items-end gap-2">
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    m.isMine
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  } ${m.isDeleted ? "italic opacity-60" : ""}`}
                >
                  {m.body}
                </div>
                {!m.isMine && !m.isDeleted && (
                  <button
                    onClick={() => report(m.id)}
                    className="text-xs text-gray-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                    title="通報する"
                  >
                    🚩
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 p-3">
        {warning && (
          <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {warning}
          </p>
        )}
        <form onSubmit={send} className="flex gap-2">
          <input
            className="input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (warning) setWarning(null);
            }}
            placeholder="メッセージを入力..."
          />
          <button className="btn-primary shrink-0" disabled={sending}>
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
