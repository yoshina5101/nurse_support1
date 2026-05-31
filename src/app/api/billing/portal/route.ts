import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// プラン管理・解約。本番は Stripe Customer Portal、ダミーは即時FREE化。
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const origin = new URL(req.url).origin;

  if (!stripe) {
    // ダミーモード：即時に無料会員へ戻す（動作確認用）。
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "FREE" },
    });
    return NextResponse.json({ url: "/billing?downgraded=dummy" });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json(
      { error: "顧客情報が見つかりません。" },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
