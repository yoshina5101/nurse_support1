import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/app/(auth-actions)/authActions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; devToken?: string }>;
}) {
  const params = await searchParams;

  async function submit(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    if (!email) redirect("/forgot-password");
    const result = await requestPasswordReset(email);
    // 存在有無を問わず同じ結果（列挙対策）。devLinkがあれば画面に表示。
    redirect(
      result.devLink
        ? `/forgot-password?sent=1&devToken=${encodeURIComponent(
            result.devLink.split("token=")[1] ?? ""
          )}`
        : "/forgot-password?sent=1"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">あかり</h1>
          <p className="mt-1 text-sm text-gray-500">パスワードの再設定</p>
        </div>

        {params.sent ? (
          <div className="card space-y-4 text-center">
            <div className="text-4xl">📧</div>
            <p className="text-sm text-gray-600">
              入力されたメールアドレスが登録されている場合、パスワード再設定用の
              リンクをお送りしました。メールをご確認ください。
            </p>
            {params.devToken && (
              <div className="rounded-md bg-amber-50 p-3 text-left text-xs text-amber-700">
                <p className="font-medium">
                  【開発モード】メール送信が未設定のため、再設定リンクを表示しています：
                </p>
                <Link
                  href={`/reset-password?token=${params.devToken}`}
                  className="mt-1 block break-all text-brand-600 underline"
                >
                  パスワードを再設定する
                </Link>
              </div>
            )}
            <Link href="/login" className="btn-secondary inline-block">
              ログイン画面へ
            </Link>
          </div>
        ) : (
          <form action={submit} className="card space-y-4">
            <h2 className="text-lg font-semibold">パスワードをお忘れですか？</h2>
            <p className="text-sm text-gray-500">
              ご登録のメールアドレスを入力してください。再設定用のリンクをお送りします。
            </p>
            <div>
              <label className="label" htmlFor="email">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              再設定リンクを送る
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-brand-600 hover:underline">
                ログインに戻る
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
