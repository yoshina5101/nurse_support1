export const metadata = { title: "特定商取引法に基づく表記 | ナースキャリア" };

export default function TokushohoPage() {
  const rows: [string, string][] = [
    ["販売事業者", "____________________"],
    ["運営責任者", "____________________"],
    ["所在地", "____________________"],
    ["連絡先（メール）", "____________________"],
    ["電話番号", "____________________（請求があれば遅滞なく開示します）"],
    ["販売価格", "各プランの価格はサービス内に表示します（プレミアム：月額制）"],
    ["商品代金以外の必要料金", "インターネット接続に係る通信料等は利用者負担"],
    ["支払方法", "クレジットカード（決済代行サービスを利用）"],
    ["支払時期", "お申し込み時に課金され、以降は毎月自動更新"],
    [
      "サービス提供時期",
      "決済完了後、直ちにプレミアム機能をご利用いただけます",
    ],
    [
      "解約・返金",
      "マイページの「プラン」からいつでも解約可能。次回更新日以降は課金されません。サービスの性質上、原則として日割り返金は行いません。",
    ],
  ];

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800">
        特定商取引法に基づく表記
      </h1>
      <p>
        「特定商取引に関する法律」第11条に基づき、以下のとおり表示します。
      </p>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-gray-200 align-top">
              <th className="w-40 py-2 pr-4 text-left font-medium text-gray-700">
                {k}
              </th>
              <td className="py-2 text-gray-600">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
