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
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {label}
    </Link>
  );
}
