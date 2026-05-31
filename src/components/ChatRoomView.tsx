"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  body: string;
  isDeleted: boolean;
  authorName: string;
  isMine: boolean;
  createdAt: string;
};

export function ChatRoomView({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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
    const body = input;
    setInput("");
    try {
      await fetch(`/api/chat/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      await load();
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
      alert("通報を受け付けました。ご協力ありがとうございます。");
    } else {
      alert("通報に失敗しました。");
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
      <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-3">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <button className="btn-primary shrink-0" disabled={sending}>
          送信
        </button>
      </form>
    </div>
  );
}
