import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { InterviewForm } from "@/components/InterviewForm";

export default async function InterviewPage() {
  const user = await requireUser();

  const [questions, pastSessions] = await Promise.all([
    prisma.interviewQuestion.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const questionOptions = questions.map((q) => ({
    id: q.id,
    text: q.text,
    category: q.category,
    isPremium: q.isPremium,
    locked: q.isPremium && user.plan !== "PREMIUM",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">面接練習・AIレビュー</h2>
        <p className="mt-1 text-sm text-gray-500">
          質問を選び、声に出して回答（録音）しましょう。話した内容を文字起こしし、AIが面接官目線でレビューします。
        </p>
      </div>

      <InterviewForm questions={questionOptions} />

      {pastSessions.length > 0 && (
        <div className="card">
          <h3 className="mb-3 font-semibold text-gray-800">これまでの練習</h3>
          <ul className="divide-y divide-gray-100">
            {pastSessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="truncate text-gray-600">{s.questionText}</span>
                <span className="ml-3 shrink-0 text-gray-400">
                  {s.score !== null ? `${s.score}点` : "—"} ・{" "}
                  {new Date(s.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
