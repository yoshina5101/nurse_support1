"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-brand-600 text-white shadow-soft"
          : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {icon && <span className="text-base" aria-hidden>{icon}</span>}
      {label}
    </Link>
  );
}
