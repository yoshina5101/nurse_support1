import { requireUser } from "@/lib/session";
import { getPremiumPriceJpy, getAiDailyLimit } from "@/lib/settings";
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

  const [price, usage, freeLimit, premiumLimit] = await Promise.all([
    getPremiumPriceJpy(),
    checkAiUsage(user.id, user.plan),
    getAiDailyLimit("FREE"),
    getAiDailyLimit("PREMIUM"),
  ]);

  const notice =
    params.success
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
        <p className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {notice}
        </p>
      )}

      {!stripeEnabled && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          現在テスト環境（Stripe未設定）のため、アップグレード／解約は即時に反映されます（実際の決済は行われません）。
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 無料プラン */}
        <div
          className={`card ${
            user.plan === "FREE" ? "border-brand-500 ring-1 ring-brand-500" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">無料プラン</h3>
            {user.plan === "FREE" && (
              <span className="badge bg-brand-600 text-white">利用中</span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">¥0</p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>・AI機能 1日{freeLimit}回まで</li>
            <li>・基本機能（自己分析・履歴書・小論文・面接・チャット）</li>
            <li>・無料コンテンツの閲覧</li>
          </ul>
        </div>

        {/* プレミアムプラン */}
        <div
          className={`card ${
            user.plan === "PREMIUM"
              ? "border-amber-500 ring-1 ring-amber-500"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">プレミアムプラン</h3>
            {user.plan === "PREMIUM" && (
              <span className="badge bg-amber-500 text-white">利用中</span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            ¥{price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">/月</span>
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>
              ・AI機能 1日
              {premiumLimit < 0 ? "無制限" : `${premiumLimit}回`}まで
            </li>
            <li>・有料お題・有料質問・有料コンテンツの利用</li>
            <li>・有料チャットルームへの参加</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-1 font-semibold text-gray-800">本日のAI利用状況</h3>
        <p className="text-sm text-gray-600">
          {usage.limit < 0
            ? `本日 ${usage.used} 回利用（無制限）`
            : `本日 ${usage.used} / ${usage.limit} 回利用（残り ${usage.remaining} 回）`}
        </p>
        <div className="mt-4">
          <BillingButtons plan={user.plan} />
        </div>
      </div>
    </div>
  );
}
