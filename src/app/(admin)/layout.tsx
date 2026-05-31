import { requireAdmin } from "@/lib/session";
import { Shell, type NavItem } from "@/components/Shell";

const nav: NavItem[] = [
  { href: "/admin/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/users", label: "ユーザー管理", icon: "👥" },
  { href: "/admin/organizations", label: "組織契約(B2B)", icon: "🏫" },
  { href: "/admin/reports", label: "通報管理", icon: "🚩" },
  { href: "/admin/contents", label: "コンテンツ管理", icon: "📚" },
  { href: "/admin/essay-themes", label: "小論文お題管理", icon: "✍️" },
  { href: "/admin/interview-questions", label: "面接質問管理", icon: "🎤" },
  { href: "/admin/settings", label: "利用上限・料金", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const badge = (
    <span className="badge bg-brand-100 text-brand-700">管理者</span>
  );

  return (
    <Shell title="管理メニュー" userName={user.name ?? ""} badge={badge} nav={nav}>
      {children}
    </Shell>
  );
}
