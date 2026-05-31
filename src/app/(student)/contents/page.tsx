import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function ContentsPage() {
  const user = await requireUser();
  const contents = await prisma.content.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">お役立ち記事</h2>
        <p className="mt-1 text-sm text-gray-500">
          就職活動に役立つ情報をまとめています。
          {user.plan !== "PREMIUM" && "（有料記事はプレミアム会員限定です）"}
        </p>
      </div>

      <div className="space-y-4">
        {contents.map((c) => {
          const locked = c.isPremium && user.plan !== "PREMIUM";
          return (
            <article key={c.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge bg-gray-100 text-gray-600">
                    {c.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-gray-800">{c.title}</h3>
                </div>
                {c.isPremium && (
                  <span className="badge bg-amber-100 text-amber-700">有料</span>
                )}
              </div>
              {locked ? (
                <p className="mt-2 text-sm text-amber-700">
                  🔒 この記事はプレミアム会員限定です。アップグレードするとお読みいただけます。
                </p>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                  {c.body}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
