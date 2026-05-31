import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { RESUME_FIELDS } from "@/lib/resumeFields";
import { PrintButton } from "@/components/PrintButton";

// 履歴書の印刷用ページ。ブラウザの印刷機能でPDF保存できる、A4向けの清書レイアウト。
export default async function ResumePrintPage() {
  const user = await requireUser();

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  if (!resume) notFound();

  const content = (resume.content as Record<string, string>) ?? {};

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* 操作バー（印刷時は非表示） */}
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 print:hidden">
        <a href="/resume" className="text-sm text-brand-600 hover:underline">
          ← 履歴書編集に戻る
        </a>
        <PrintButton />
      </div>

      {/* A4用紙イメージ */}
      <div className="mx-auto my-6 max-w-[800px] bg-white p-12 shadow-soft print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="mb-8 border-b-2 border-brand-600 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">履歴書</h1>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500">氏名</p>
              <p className="text-xl font-semibold text-gray-900">{user.name}</p>
            </div>
            <p className="text-xs text-gray-500">
              作成日：
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </header>

        <dl className="space-y-5">
          {RESUME_FIELDS.map((f) => (
            <div
              key={f.key}
              className="grid grid-cols-[140px_1fr] gap-4 border-b border-gray-100 pb-4"
            >
              <dt className="text-sm font-semibold text-gray-700">{f.key}</dt>
              <dd className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {content[f.key] || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
