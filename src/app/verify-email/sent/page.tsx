import Link from "next/link";

export default async function VerifyEmailSentPage({
  searchParams,
}: {
  searchParams: Promise<{ devToken?: string }>;
}) {
  const { devToken } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card space-y-4 text-center">
          <div className="text-4xl">📧</div>
          <h1 className="text-lg font-semibold text-gray-800">
            確認メールを送信しました
          </h1>
          <p className="text-sm text-gray-600">
            ご登録のメールアドレスに確認用のリンクをお送りしました。
            メール内のリンクをクリックして登録を完了してください。
          </p>

          {devToken && (
            <div className="rounded-md bg-amber-50 p-3 text-left text-xs text-amber-700">
              <p className="font-medium">
                【開発モード】メール送信が未設定のため、確認リンクを表示しています：
              </p>
              <Link
                href={`/verify-email?token=${devToken}`}
                className="mt-1 block break-all text-brand-600 underline"
              >
                メールアドレスを確認する
              </Link>
            </div>
          )}

          <Link href="/login" className="btn-secondary inline-block">
            ログイン画面へ
          </Link>
        </div>
      </div>
    </main>
  );
}
