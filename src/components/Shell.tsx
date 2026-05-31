import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";

export type NavItem = { href: string; label: string; icon?: string };

export function Shell({
  title,
  userName,
  badge,
  nav,
  children,
}: {
  title: string;
  userName: string;
  badge?: React.ReactNode;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-cream-200 bg-white/80 p-4 backdrop-blur md:flex print:!hidden">
        <Link href="/" className="mb-7 px-2 pt-2">
          <Logo />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
          <p className="font-semibold">💡 ヒント</p>
          <p className="mt-1 leading-relaxed text-brand-600">
            毎日少しずつ進めるのが就活成功のコツ。今日も一歩進めましょう。
          </p>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-cream-200 bg-white/80 px-6 py-3 backdrop-blur print:!hidden">
          <div className="flex items-center gap-2">
            <Link href="/" className="md:hidden">
              <Logo textClass="text-base" />
            </Link>
            <h1 className="hidden text-base font-bold text-gray-800 md:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {userName} さん
            </span>
            {badge}
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 print:overflow-visible print:p-0">
          <div className="mx-auto max-w-4xl animate-fade-in-up print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
