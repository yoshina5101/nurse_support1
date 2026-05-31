import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICE_ID, STRIPE_PRICE_ID_6MO } from "@/lib/stripe";
import {
  getPremiumPriceJpy,
  getSixMonthPriceJpy,
  SIX_MONTH_MONTHS,
  addMonths,
} from "@/lib/settings";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.plan === "PREMIUM") {
    return NextResponse.json(
      { error: "すでにプレミアム会員です。" },
      { status: 400 }
    );
  }

  const { kind } = (await req.json().catch(() => ({}))) as {
    kind?: "monthly" | "sixmonth";
  };
  const plan = kind === "sixmonth" ? "sixmonth" : "monthly";
  const origin = new URL(req.url).origin;

  // ダミーモード：Stripe未設定なら即時アップグレード（動作確認用）。
  if (!stripe) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "PREMIUM",
        // 6ヶ月パックは買い切り → 期限をセット。月額は期限なし（null）。
        premiumUntil:
          plan === "sixmonth" ? addMonths(new Date(), SIX_MONTH_MONTHS) : null,
      },
    });
    return NextResponse.json({ url: "/billing?success=dummy" });
  }

  // 本番モード：Stripe Checkout を作成。
  if (plan === "sixmonth") {
    if (!STRIPE_PRICE_ID_6MO) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID_6MO が未設定です。" },
        { status: 500 }
      );
    }
    const priceJpy = await getSixMonthPriceJpy();
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // 買い切り（自動更新なし）
      line_items: [{ price: STRIPE_PRICE_ID_6MO, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { userId: user.id, kind: "sixmonth", priceJpy: String(priceJpy) },
      success_url: `${origin}/billing?success=1`,
      cancel_url: `${origin}/billing?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  }

  // 月額サブスク
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
    metadata: { userId: user.id, kind: "monthly", priceJpy: String(priceJpy) },
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
  });
  return NextResponse.json({ url: session.url });
}
