import Link from "next/link";

// データが無いときの空状態表示。アイコン・説明・任意のアクションを表示する。
export function EmptyState({
  icon = "🌱",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        {icon}
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-1">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
