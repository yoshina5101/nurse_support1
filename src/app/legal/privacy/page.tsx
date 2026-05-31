export const metadata = { title: "プライバシーポリシー | あかり" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-xl font-bold text-gray-800">プライバシーポリシー</h1>
      <p>
        あかり（以下「本サービス」）は、利用者の個人情報を適切に取り扱う
        ことを重要な責務と考え、個人情報の保護に関する法律その他関係法令を遵守
        します。
      </p>

      <h2 className="font-semibold text-gray-800">1. 取得する情報</h2>
      <ul className="list-disc pl-5">
        <li>氏名・メールアドレス等の登録情報</li>
        <li>
          自己分析の回答、履歴書・小論文・面接練習の内容等、利用者が入力した情報
        </li>
        <li>チャットへの投稿内容</li>
        <li>決済に関する情報（決済代行事業者を通じて処理されます）</li>
        <li>アクセスログ・利用状況等の情報</li>
      </ul>

      <h2 className="font-semibold text-gray-800">2. 利用目的</h2>
      <ul className="list-disc pl-5">
        <li>本サービスの提供・運営・本人確認のため</li>
        <li>AIによる添削・分析・レビュー等の機能提供のため</li>
        <li>利用料金の請求・決済のため</li>
        <li>お問い合わせ対応・重要なお知らせの通知のため</li>
        <li>不正利用の防止およびサービス改善のため</li>
      </ul>

      <h2 className="font-semibold text-gray-800">3. AI処理への提供</h2>
      <p>
        添削・分析等の機能提供のため、利用者が入力した内容を外部のAI事業者の
        APIに送信する場合があります。送信される情報は当該機能の提供に必要な
        範囲に限られます。
      </p>

      <h2 className="font-semibold text-gray-800">4. 第三者提供</h2>
      <p>
        運営者は、法令に基づく場合を除き、あらかじめ利用者の同意を得ることなく
        個人情報を第三者に提供しません。ただし、決済・クラウド等の業務委託先に、
        利用目的の達成に必要な範囲で取扱いを委託することがあります。
      </p>

      <h2 className="font-semibold text-gray-800">5. 安全管理</h2>
      <p>
        運営者は、個人情報の漏えい・滅失・毀損の防止その他の安全管理のために
        必要かつ適切な措置を講じます。
      </p>

      <h2 className="font-semibold text-gray-800">6. 開示・訂正・削除の請求</h2>
      <p>
        利用者は、自己の個人情報について、開示・訂正・利用停止・削除等を請求
        することができます。下記の連絡先までお問い合わせください。
      </p>

      <h2 className="font-semibold text-gray-800">7. お問い合わせ窓口</h2>
      <p>
        運営者名：____________________
        <br />
        連絡先（メール）：____________________
      </p>

      <p className="text-xs text-gray-400">制定日：____年__月__日</p>
    </>
  );
}
