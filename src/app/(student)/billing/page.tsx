import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  getPremiumPriceJpy,
  getSixMonthPriceJpy,
  getAiDailyLimit,
  SIX_MONTH_MONTHS,
} from "@/lib/settings";
import { checkAiUsage } from "@/lib/usage";
import { stripeEnabled } from "@/lib/stripe";
import { BillingButtons } from "@/components/BillingButtons";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    downgraded?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [price, sixMonthPrice, usage, freeLimit, premiumLimit, dbUser] =
    await Promise.all([
      getPremiumPriceJpy(),
      getSixMonthPriceJpy(),
      checkAiUsage(user.id, user.plan),
      getAiDailyLimit("FREE"),
      getAiDailyLimit("PREMIUM"),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { premiumUntil: true },
      }),
    ]);

  const premiumUntil = dbUser?.premiumUntil ?? null;
  // 月額換算（6ヶ月パックの割安感を見せる）
  const sixMonthPerMonth = Math.round(sixMonthPrice / SIX_MONTH_MONTHS);

  const notice = params.success
    ? "プレミアムへのアップグレードが完了しました。ありがとうございます！"
    : params.canceled
      ? "お支払いはキャンセルされました。"
      : params.downgraded
        ? "無料会員に変更しました。"
        : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">プラン・お支払い</h2>
        <p className="mt-1 text-sm text-gray-500">
          現在のプランの確認、アップグレード・解約ができます。
        </p>
      </div>

      {notice && (
        <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {notice}
        </p>
      )}

      {!stripeEnabled && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          現在テスト環境（Stripe未設定）のため、お支払いは即時に反映されます（実際の決済は行われません）。
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 無料プラン */}
        <div
          className={`card ${
            user.plan === "FREE" ? "border-brand-400 ring-2 ring-brand-100" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">無料プラン</h3>
            {user.plan === "FREE" && (
              <span className="badge bg-brand-600 text-white">利用中</span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">¥0</p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            <li>・AI機能 1日{freeLimit}回まで</li>
            <li>・基本機能（自己分析・履歴書・小論文・面接・チャット）</li>
            <li>・無料コンテンツの閲覧</li>
          </ul>
        </div>

        {/* 月額プレミアム */}
        <div
          className={`card ${
            user.plan === "PREMIUM" && !premiumUntil
              ? "border-amber-400 ring-2 ring-amber-100"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">月額プレミアム</h3>
            {user.plan === "PREMIUM" && !premiumUntil && (
              <span className="badge bg-amber-500 text-white">利用中</span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            ¥{price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">/月</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            <li>
              ・AI機能 1日{premiumLimit < 0 ? "無制限" : `${premiumLimit}回`}まで
            </li>
            <li>・有料お題・有料質問・限定コンテンツ</li>
            <li>・個別キャリア相談ルーム</li>
          </ul>
          {user.plan === "FREE" && (
            <div className="mt-4">
              <BillingButtons kind="monthly" label="月額ではじめる" />
            </div>
          )}
        </div>

        {/* 6ヶ月パック（おすすめ） */}
        <div
          className={`card relative ${
            user.plan === "PREMIUM" && premiumUntil
              ? "border-accent-400 ring-2 ring-accent-100"
              : "border-accent-200"
          }`}
        >
          <span className="badge absolute -top-3 left-6 bg-accent-500 text-white">
            おすすめ・お得
          </span>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">6ヶ月パック</h3>
            {user.plan === "PREMIUM" && premiumUntil && (
              <span className="badge bg-accent-500 text-white">利用中</span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            ¥{sixMonthPrice.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">/6ヶ月</span>
          </p>
          <p className="text-xs text-accent-600">
            月あたり ¥{sixMonthPerMonth.toLocaleString()}（月額より約
            {Math.round((1 - sixMonthPerMonth / price) * 100)}%お得）
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
            <li>・プレミアム機能をすべて利用</li>
            <li>・就活期間にぴったりの買い切り（自動更新なし）</li>
            <li>・支払いは一度きりで安心</li>
          </ul>
          {user.plan === "FREE" && (
            <div className="mt-4">
              <BillingButtons kind="sixmonth" label="6ヶ月パックを購入" accent />
            </div>
          )}
        </div>
      </div>

      {/* 現在の状態・利用状況 */}
      <div className="card">
        {user.plan === "PREMIUM" && premiumUntil && (
          <p className="mb-2 text-sm text-gray-700">
            🎫 6ヶ月パックの有効期限：
            <span className="font-semibold">
              {premiumUntil.toLocaleDateString("ja-JP")}
            </span>
            まで
          </p>
        )}
        <h3 className="mb-1 font-bold text-gray-800">本日のAI利用状況</h3>
        <p className="text-sm text-gray-600">
          {usage.limit < 0
            ? `本日 ${usage.used} 回利用（無制限）`
            : `本日 ${usage.used} / ${usage.limit} 回利用（残り ${usage.remaining} 回）`}
        </p>

        {user.plan === "PREMIUM" && (
          <div className="mt-4">
            <BillingButtons kind="cancel" label="プランを管理・解約する" />
          </div>
        )}
      </div>
    </div>
  );
}
