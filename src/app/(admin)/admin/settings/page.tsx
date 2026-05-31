import { getAllSettings } from "@/lib/settings";
import { stripeEnabled } from "@/lib/stripe";
import { updateSettings } from "@/app/(admin)/actions";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">利用上限・料金設定</h2>
        <p className="mt-1 text-sm text-gray-500">
          AI機能の1日あたり利用回数と、プレミアムの月額料金を設定できます。
        </p>
      </div>

      <form action={updateSettings} className="card space-y-5">
        <div>
          <label className="label" htmlFor="freeDailyLimit">
            無料会員のAI利用上限（1日あたりの回数）
          </label>
          <input
            id="freeDailyLimit"
            name="freeDailyLimit"
            type="number"
            min={0}
            defaultValue={settings.freeDailyLimit}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="premiumDailyLimit">
            プレミアム会員のAI利用上限（1日あたりの回数。-1で無制限）
          </label>
          <input
            id="premiumDailyLimit"
            name="premiumDailyLimit"
            type="number"
            min={-1}
            defaultValue={settings.premiumDailyLimit}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="premiumPriceJpy">
            プレミアム月額料金（円）
          </label>
          <input
            id="premiumPriceJpy"
            name="premiumPriceJpy"
            type="number"
            min={0}
            defaultValue={settings.premiumPriceJpy}
            className="input"
          />
          {stripeEnabled ? (
            <p className="mt-1 text-xs text-gray-400">
              ※ 実際の請求額は Stripe の価格（Price）設定に従います。表示価格の
              整合にご注意ください。
            </p>
          ) : (
            <p className="mt-1 text-xs text-amber-600">
              ※ 現在 Stripe 未設定（テストモード）。この金額は画面表示にのみ
              使用されます。
            </p>
          )}
        </div>

        <button className="btn-primary">保存する</button>
      </form>
    </div>
  );
}
