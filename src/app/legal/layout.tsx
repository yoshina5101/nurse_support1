import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-bold text-brand-700">
            ナースキャリア
          </Link>
          <nav className="flex gap-4 text-sm text-gray-500">
            <Link href="/legal/terms" className="hover:text-brand-700">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="hover:text-brand-700">
              プライバシー
            </Link>
            <Link href="/legal/tokushoho" className="hover:text-brand-700">
              特商法
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <article className="prose-sm space-y-4 text-sm leading-relaxed text-gray-700">
          {children}
        </article>
        <p className="mt-10 text-xs text-gray-400">
          ※ 本ページは雛形です。実際の提供にあたっては、運営者情報・連絡先・
          条項の内容を必ず専門家（弁護士・行政書士等）の確認のうえ確定してください。
        </p>
      </main>
    </div>
  );
}
