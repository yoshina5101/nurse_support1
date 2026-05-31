import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SelfAnalysisWizard } from "@/components/SelfAnalysisWizard";

export default async function SelfAnalysisPage() {
  const user = await requireUser();

  const latest = await prisma.selfAnalysis.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">自己分析</h2>
        <p className="mt-1 text-sm text-gray-500">
          5つの質問に答えるだけ。あなたの強みを診断し、AIが就活で活かすための深掘りをします。
        </p>
      </div>

      {latest?.aiSummary && (
        <details className="card">
          <summary className="cursor-pointer font-semibold text-brand-700">
            前回の分析結果を見る
          </summary>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-gray-700">
            {latest.aiSummary}
          </pre>
        </details>
      )}

      <SelfAnalysisWizard />
    </div>
  );
}
