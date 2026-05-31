import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  async function register(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!name || !email || password.length < 6) {
      redirect("/register?error=invalid");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect("/register?error=exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, passwordHash, role: "STUDENT", plan: "FREE" },
    });

    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  }

  const errorMessage =
    params.error === "exists"
      ? "このメールアドレスは既に登録されています。"
      : params.error === "invalid"
        ? "入力内容を確認してください（パスワードは6文字以上）。"
        : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">ナースキャリア</h1>
          <p className="mt-1 text-sm text-gray-500">新規アカウント登録</p>
        </div>
        <form action={register} className="card space-y-4">
          <h2 className="text-lg font-semibold">学生として登録</h2>
          {errorMessage && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}
          <div>
            <label className="label" htmlFor="name">
              お名前
            </label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              メールアドレス
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              パスワード（6文字以上）
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
          <button type="submit" className="btn-primary w-full">
            登録する
          </button>
          <p className="text-center text-sm text-gray-500">
            既にアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-brand-600 hover:underline">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
