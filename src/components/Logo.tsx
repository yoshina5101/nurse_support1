// ハート＋医療の十字を組み合わせたロゴマーク（温かみ＋看護らしさ）。
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="ナースキャリア"
    >
      {/* ハート */}
      <path
        d="M16 27.5C16 27.5 4 20.5 4 12.2 4 8.2 7 5.5 10.4 5.5c2.3 0 4.4 1.3 5.6 3.3 1.2-2 3.3-3.3 5.6-3.3C25 5.5 28 8.2 28 12.2 28 20.5 16 27.5 16 27.5z"
        fill="#2a9d87"
      />
      {/* 中央の十字（白抜き） */}
      <path
        d="M14.6 9.8h2.8v3.4h3.4v2.8h-3.4v3.4h-2.8v-3.4h-3.4v-2.8h3.4z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  textClass = "text-lg",
}: {
  className?: string;
  textClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className={`font-bold text-brand-700 ${textClass}`}>
        ナースキャリア
      </span>
    </span>
  );
}
