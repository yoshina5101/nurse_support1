import { prisma } from "@/lib/db";

// 管理画面から変更可能なアプリ設定。未設定時は既定値を使う。
export const SETTING_DEFAULTS = {
  freeDailyLimit: "3", // 無料会員の1日あたりAI利用回数
  premiumDailyLimit: "30", // 有料会員の1日あたりAI利用回数（-1で無制限）
  premiumPriceJpy: "980", // プレミアムの月額（円）
  sixMonthPriceJpy: "4980", // 6ヶ月パックの価格（円・買い切り）
} as const;

// 6ヶ月パックの有効月数。
export const SIX_MONTH_MONTHS = 6;

// 基準日から Nヶ月後の日時を返す。
export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

export type SettingKey = keyof typeof SETTING_DEFAULTS;

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key];
}

export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.appSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result = {} as Record<SettingKey, string>;
  (Object.keys(SETTING_DEFAULTS) as SettingKey[]).forEach((k) => {
    result[k] = map.get(k) ?? SETTING_DEFAULTS[k];
  });
  return result;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

// プランごとの1日あたりAI利用上限。-1 は無制限。
export async function getAiDailyLimit(
  plan: "FREE" | "PREMIUM"
): Promise<number> {
  const raw = await getSetting(
    plan === "PREMIUM" ? "premiumDailyLimit" : "freeDailyLimit"
  );
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : SETTING_DEFAULTS.freeDailyLimit === raw ? 3 : 0;
}

export async function getPremiumPriceJpy(): Promise<number> {
  const n = parseInt(await getSetting("premiumPriceJpy"), 10);
  return Number.isFinite(n) ? n : 980;
}

export async function getSixMonthPriceJpy(): Promise<number> {
  const n = parseInt(await getSetting("sixMonthPriceJpy"), 10);
  return Number.isFinite(n) ? n : 4980;
}
