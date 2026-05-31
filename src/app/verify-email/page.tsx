import Link from "next/link";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let status: "ok" | "invalid" | "missing" = "missing";
  if (token) {
    const result = await consumeToken(token, "EMAIL_VERIFY");
    if (result.ok && result.userId) {
      await prisma.user.update({
        where: { id: result.userId },
        data: { emailVerified: new Date() },
      });
      status = "ok";
    } else {
      status = "invalid";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card space-y-4 text-center">
          {status === "ok" ? (
            <>
              <div className="text-4xl">✅</div>
              <h1 className="text-lg font-semibold text-gray-800">
                メールアドレスを確認しました
              </h1>
              <p className="text-sm text-gray-600">
                ご登録ありがとうございます。ログインしてご利用いただけます。
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl">⚠️</div>
              <h1 className="text-lg font-semibold text-gray-800">
                確認できませんでした
              </h1>
              <p className="text-sm text-gray-600">
                リンクが無効か、有効期限が切れています。お手数ですが、
                ログイン後に確認メールを再送してください。
              </p>
            </>
          )}
          <Link href="/login" className="btn-primary inline-block">
            ログイン画面へ
          </Link>
        </div>
      </div>
    </main>
  );
}
