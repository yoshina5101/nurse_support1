import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import type Stripe from "stripe";

// Stripe Webhook：決済完了でPREMIUM化、サブスク解約でFREE化。
export async function POST(req: Request) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.metadata?.userId || session.client_reference_id || null;
      const kind = session.metadata?.kind;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PREMIUM",
            // 6ヶ月パックは買い切り → 期限をセット。月額サブスクは期限なし。
            premiumUntil:
              kind === "sixmonth"
                ? addMonths(new Date(), SIX_MONTH_MONTHS)
                : null,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : null;
      if (customerId) {
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });
        // 有効な6ヶ月パック（premiumUntilが未来）が残っている場合は維持する。
        const hasActivePack =
          user?.premiumUntil && user.premiumUntil.getTime() > Date.now();
        if (user && !hasActivePack) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "FREE" },
          });
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
