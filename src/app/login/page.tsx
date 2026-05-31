import Link from "next/link";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; reset?: string }>;
}) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">ナースキャリア</h1>
          <p className="mt-1 text-sm text-gray-500">新卒看護師のための就活支援</p>
        </div>
        <form action={login} className="card space-y-4">
          <h2 className="text-lg font-semibold">ログイン</h2>
          {params.reset && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              パスワードを変更しました。新しいパスワードでログインしてください。
            </p>
          )}
          {params.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              メールアドレスまたはパスワードが正しくありません。
            </p>
          )}
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
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="password123"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            ログイン
          </button>
          <p className="text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-brand-600 hover:underline"
            >
              パスワードをお忘れですか？
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちでない方は{" "}
            <Link href="/register" className="text-brand-600 hover:underline">
              新規登録
            </Link>
          </p>
        </form>
        <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-gray-600">
          <p className="font-medium">デモ用アカウント（パスワード: password123）</p>
          <ul className="mt-1 space-y-0.5">
            <li>学生: student@example.com</li>
            <li>学生(有料): premium@example.com</li>
            <li>管理者: admin@example.com</li>
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          <a href="/legal/terms" className="hover:underline">
            利用規約
          </a>{" "}
          ・{" "}
          <a href="/legal/privacy" className="hover:underline">
            プライバシーポリシー
          </a>{" "}
          ・{" "}
          <a href="/legal/tokushoho" className="hover:underline">
            特定商取引法に基づく表記
          </a>
        </p>
      </div>
    </main>
  );
}
