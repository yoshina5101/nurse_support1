import { requireUser } from "@/lib/session";
import { Shell, type NavItem } from "@/components/Shell";

const nav: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "🏠" },
  { href: "/self-analysis", label: "自己分析", icon: "🔍" },
  { href: "/resume", label: "履歴書", icon: "📄" },
  { href: "/essay", label: "小論文", icon: "✍️" },
  { href: "/chat", label: "チャット", icon: "💬" },
  { href: "/contents", label: "お役立ち記事", icon: "📚" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const planBadge = (
    <span
      className={`badge ${
        user.plan === "PREMIUM"
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {user.plan === "PREMIUM" ? "プレミアム会員" : "無料会員"}
    </span>
  );

  return (
    <Shell
      title="学生メニュー"
      userName={user.name ?? ""}
      badge={planBadge}
      nav={nav}
    >
      {children}
    </Shell>
  );
}
