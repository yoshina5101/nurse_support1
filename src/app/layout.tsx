import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ServiceWorker } from "@/components/ServiceWorker";

// 本番URL（OGP・sitemap・canonicalの基準）。未設定時はローカル。
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const siteName = "あかり";
const title = "あかり | 新卒看護師の就活支援アプリ";
const description =
  "新卒看護師のための就職活動支援アプリ「あかり」。自己分析・履歴書・小論文・面接練習をAIがサポート。応募先管理や点数推移で就活を一歩ずつ前に進めましょう。";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: title,
    template: "%s | あかり",
  },
  description,
  keywords: [
    "看護師",
    "新卒看護師",
    "就活",
    "就職活動",
    "自己分析",
    "履歴書",
    "小論文",
    "面接対策",
    "AI添削",
    "看護学生",
  ],
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: appUrl,
    siteName,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2a9d87",
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
        <ServiceWorker />
      </body>
    </html>
  );
}
