import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
  }

  const features = [
    {
      icon: "🔍",
      title: "自己分析",
      desc: "5つの問いに答えるだけ。AIがあなたの強みを見つけ、深掘りの問いを返します。",
    },
    {
      icon: "📄",
      title: "履歴書づくり",
      desc: "志望動機・自己PRを、採用担当者の視点でAIが温かく添削します。",
    },
    {
      icon: "✍️",
      title: "小論文の練習",
      desc: "お題に沿って書いて、構成・看護観・表現を点数つきでフィードバック。",
    },
    {
      icon: "🎤",
      title: "面接の練習",
      desc: "声に出して回答するだけ。話した内容を文字にしてAIがレビューします。",
    },
    {
      icon: "💬",
      title: "なかま と相談",
      desc: "同じ道を歩む就活生や先輩と、安心して情報交換ができます。",
    },
    {
      icon: "📚",
      title: "お役立ち記事",
      desc: "病院選びから面接対策まで、就活に役立つ情報をまとめています。",
    },
  ];

  return (
    <main className="min-h-screen bg-cream-50">
      {/* ヘッダー */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary">
            ログイン
          </Link>
          <Link href="/register" className="btn-primary">
            無料ではじめる
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
          <div className="animate-fade-in-up">
            <span className="badge bg-accent-100 text-accent-700">
              新卒看護師のための就活サポート
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-800 sm:text-4xl md:text-[2.7rem]">
              あなたらしい看護を、
              <br />
              <span className="text-brand-600">自信</span>をもって
              <span className="text-accent-500">伝える</span>ために。
            </h1>
            <p className="mt-5 text-base leading-relaxed text-gray-600">
              自己分析から履歴書・小論文・面接まで。
              AIがあなたの良さを引き出し、一人ひとりに寄り添って就職活動を応援します。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-7 py-3 text-base">
                無料ではじめる
              </Link>
              <Link href="/login" className="btn-secondary px-7 py-3 text-base">
                ログイン
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              クレジットカード不要・無料で主要機能をお試しいただけます。
            </p>
          </div>

          {/* ヒーロー右：やわらかいカード演出 */}
          <div className="relative animate-fade-in-up">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-accent-100 blur-2xl" />
            <div className="absolute -bottom-8 -left-4 h-44 w-44 rounded-full bg-brand-100 blur-2xl" />
            <div className="relative space-y-3 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg">
                  🩺
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    AIキャリアアドバイザー
                  </p>
                  <p className="text-xs text-gray-500">いつでもあなたのそばに</p>
                </div>
              </div>
              <div className="rounded-xl bg-cream-100 p-3 text-sm text-gray-700">
                あなたの「患者さんに寄り添いたい」という想い、とても素敵ですね。
                その気持ちが伝わる志望動機を一緒に作っていきましょう 🌱
              </div>
              <div className="flex justify-end">
                <div className="rounded-xl bg-brand-600 p-3 text-sm text-white">
                  ありがとうございます！お願いします。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            就活のすべてを、ひとつのアプリで
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            準備から本番まで、必要な機能がそろっています。
          </p>
        </div>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card transition-all hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                {f.icon}
              </div>
              <h3 className="mt-4 font-bold text-gray-800">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金 */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">料金プラン</h2>
          <p className="mt-2 text-sm text-gray-600">
            まずは無料で。もっと使いたくなったらプレミアムへ。
          </p>
        </div>
        <div className="mx-auto mt-9 grid max-w-4xl gap-5 lg:grid-cols-3">
          <div className="card">
            <h3 className="font-bold text-gray-800">無料プラン</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">¥0</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ 自己分析・履歴書・小論文・面接</li>
              <li>✓ AI添削 1日3回まで</li>
              <li>✓ チャット・お役立ち記事</li>
            </ul>
            <Link href="/register" className="btn-secondary mt-6 w-full">
              無料ではじめる
            </Link>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800">月額プレミアム</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              ¥980
              <span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ AI添削 1日30回まで</li>
              <li>✓ 有料お題・有料質問・限定コンテンツ</li>
              <li>✓ 個別キャリア相談ルーム</li>
            </ul>
            <Link href="/register" className="btn-primary mt-6 w-full">
              月額ではじめる
            </Link>
          </div>
          <div className="card relative border-accent-200 ring-2 ring-accent-200">
            <span className="badge absolute -top-3 left-6 bg-accent-500 text-white">
              おすすめ・お得
            </span>
            <h3 className="font-bold text-gray-800">6ヶ月パック</h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              ¥4,980
              <span className="text-sm font-normal text-gray-500">/6ヶ月</span>
            </p>
            <p className="text-xs text-accent-600">
              月あたり ¥830（月額より約15%お得）
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ プレミアム機能をすべて利用</li>
              <li>✓ 就活期間にぴったりの買い切り</li>
              <li>✓ 自動更新なしで安心</li>
            </ul>
            <Link href="/register" className="btn-accent mt-6 w-full">
              6ヶ月パックを試す
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          ※ AIによる添削・分析は参考情報です。最終的な判断はご自身で行ってください。
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-9 text-center text-white shadow-soft-lg">
          <h2 className="text-2xl font-bold">あなたの一歩を、今日から。</h2>
          <p className="mt-2 text-sm text-brand-50">
            登録は1分。あなたらしい就職活動を、一緒にはじめましょう。
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-base font-semibold text-brand-700 shadow-soft transition hover:bg-cream-50"
          >
            無料ではじめる
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-cream-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Logo textClass="text-base" />
          <nav className="flex flex-wrap gap-4 text-xs text-gray-500">
            <Link href="/legal/terms" className="hover:text-brand-700">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="hover:text-brand-700">
              プライバシーポリシー
            </Link>
            <Link href="/legal/tokushoho" className="hover:text-brand-700">
              特定商取引法に基づく表記
            </Link>
          </nav>
          <p className="text-xs text-gray-400">© ナースキャリア</p>
        </div>
      </footer>
    </main>
  );
}
