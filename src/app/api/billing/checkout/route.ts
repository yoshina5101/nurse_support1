import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";
import { getPremiumPriceJpy } from "@/lib/settings";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.plan === "PREMIUM") {
    return NextResponse.json(
      { error: "すでにプレミアム会員です。" },
      { status: 400 }
    );
  }

  const origin = new URL(req.url).origin;

  // ダミーモード：Stripe未設定なら即時アップグレード（動作確認用）。
  if (!stripe) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "PREMIUM" },
    });
    return NextResponse.json({ url: "/billing?success=dummy" });
  }

  // 本番モード：Stripe Checkout（サブスク）を作成。
  if (!STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID が未設定です。" },
      { status: 500 }
    );
  }

  const priceJpy = await getPremiumPriceJpy();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { userId: user.id, priceJpy: String(priceJpy) },
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
