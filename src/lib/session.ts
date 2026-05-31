import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

// セッション(JWT)のユーザーに、DBの最新プランを反映して返す。
// - plan は JWT 上ではログイン時点のまま古くなるため、毎回DBの値で上書きする
//   （購入直後でも即座に反映される）。
// - 6ヶ月パック等の買い切りプレミアムは premiumUntil で期限管理し、
//   期限切れなら自動的に FREE に戻す（アクセス時チェック方式）。
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      role: true,
      premiumUntil: true,
      organization: { select: { premiumUntil: true } },
    },
  });
  if (!dbUser) return session.user;

  let plan = dbUser.plan;

  // 買い切りプレミアムの期限切れ → FREE へダウングレード
  if (
    plan === "PREMIUM" &&
    dbUser.premiumUntil &&
    dbUser.premiumUntil.getTime() < Date.now()
  ) {
    plan = "FREE";
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "FREE", premiumUntil: null },
    });
  }

  // B2B：所属組織が有効なプレミアム契約中なら、メンバーはプレミアム扱い。
  const orgUntil = dbUser.organization?.premiumUntil;
  if (plan === "FREE" && orgUntil && orgUntil.getTime() > Date.now()) {
    plan = "PREMIUM";
  }

  return { ...session.user, plan, role: dbUser.role };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
