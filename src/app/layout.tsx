import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "あかり | 新卒看護師の就活支援",
  description:
    "新卒看護師のための就職活動支援アプリ。自己分析・履歴書・小論文・面接をAIがサポートします。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "あかり",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-icon.png",
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
