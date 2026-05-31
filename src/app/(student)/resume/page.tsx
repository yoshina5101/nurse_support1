import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { RESUME_FIELDS } from "@/lib/resumeFields";
import { ResumeForm } from "@/components/ResumeForm";

export default async function ResumePage() {
  const user = await requireUser();

  const latest = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const initial = latest
    ? {
        id: latest.id,
        title: latest.title,
        content: (latest.content as Record<string, string>) ?? {},
        aiFeedback: latest.aiFeedback,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">履歴書作成・AI添削</h2>
        <p className="mt-1 text-sm text-gray-500">
          各項目を入力し、採用担当者目線でのAI添削を受けましょう。志望動機は「なぜその病院・施設か／看護観」、
          自己PRは「強みのエビデンス（経験・行動・結果）／強みの生かし方」を基準に添削します。
        </p>
      </div>
      <ResumeForm fields={RESUME_FIELDS} initial={initial} />
    </div>
  );
}
