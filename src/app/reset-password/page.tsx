import Link from "next/link";
import { redirect } from "next/navigation";
import { consumeToken } from "@/lib/tokens";
import { updatePassword } from "@/app/(auth-actions)/authActions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  async function submit(formData: FormData) {
    "use server";
    const t = String(formData.get("token") || "");
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password.length < 6) {
      redirect(`/reset-password?token=${t}&error=short`);
    }
    if (password !== confirm) {
      redirect(`/reset-password?token=${t}&error=mismatch`);
    }

    const result = await consumeToken(t, "PASSWORD_RESET");
    if (!result.ok || !result.userId) {
      redirect(`/reset-password?token=${t}&error=invalid`);
    }

    await updatePassword(result.userId!, password);
    redirect("/login?reset=1");
  }

  const errorMessage =
    params.error === "short"
      ? "パスワードは6文字以上で入力してください。"
      : params.error === "mismatch"
        ? "確認用パスワードが一致しません。"
        : params.error === "invalid"
          ? "リンクが無効か、有効期限が切れています。再度お試しください。"
          : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">ナースキャリア</h1>
          <p className="mt-1 text-sm text-gray-500">新しいパスワードの設定</p>
        </div>

        {!token ? (
          <div className="card text-center text-sm text-gray-600">
            リンクが正しくありません。
            <Link
              href="/forgot-password"
              className="ml-1 text-brand-600 hover:underline"
            >
              再度リクエストする
            </Link>
          </div>
        ) : (
          <form action={submit} className="card space-y-4">
            <input type="hidden" name="token" value={token} />
            {errorMessage && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            <div>
              <label className="label" htmlFor="password">
                新しいパスワード（6文字以上）
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="confirm">
                新しいパスワード（確認）
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                minLength={6}
                required
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              パスワードを変更する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
