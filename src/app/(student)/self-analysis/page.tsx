import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SELF_ANALYSIS_QUESTIONS } from "@/lib/selfAnalysisQuestions";
import { SelfAnalysisForm } from "@/components/SelfAnalysisForm";

export default async function SelfAnalysisPage() {
  const user = await requireUser();

  const latest = await prisma.selfAnalysis.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const initialAnswers = (latest?.answers as Record<string, string>) ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">自己分析ツール</h2>
        <p className="mt-1 text-sm text-gray-500">
          5つの設問に答えると、AIがあなたの強みを抽出し、就活で武器にするための深掘りの問いを返します。
        </p>
      </div>

      {latest?.aiSummary && (
        <div className="card border-brand-200 bg-brand-50">
          <h3 className="mb-2 font-semibold text-brand-700">前回の分析結果</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {latest.aiSummary}
          </pre>
        </div>
      )}

      <SelfAnalysisForm
        questions={SELF_ANALYSIS_QUESTIONS}
        initialAnswers={initialAnswers}
      />
    </div>
  );
}
