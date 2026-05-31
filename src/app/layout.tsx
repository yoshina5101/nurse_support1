import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "ナースキャリア | 新卒看護師の就活支援",
  description: "新卒看護師のための就職活動支援アプリ。自己分析・履歴書・小論文をAIが添削します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <Suspense>
          <ToastProvider>{children}</ToastProvider>
        </Suspense>
      </body>
    </html>
  );
}
