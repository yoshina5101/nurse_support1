import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { SignOutButton } from "@/components/SignOutButton";

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
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <Link href="/" className="mb-6 px-2 text-lg font-bold text-brand-700">
          ナースキャリア
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-base font-semibold text-gray-800">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{userName} さん</span>
            {badge}
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
