// 灯り（看護のランプ）をモチーフにしたロゴマーク。やわらかな光で「そばに灯る」イメージ。
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="あかり"
    >
      {/* 灯りのまわりのやわらかな光 */}
      <circle cx="16" cy="13" r="11" fill="#ffe6dc" />
      {/* 炎（しずく型のあかり） */}
      <path
        d="M16 4c3.4 3.2 5.6 6.2 5.6 9.4a5.6 5.6 0 1 1-11.2 0C10.4 10.2 12.6 7.2 16 4z"
        fill="#f96a3d"
      />
      {/* 炎の内側のハイライト */}
      <path
        d="M16 9.5c1.6 1.6 2.6 3.1 2.6 4.6a2.6 2.6 0 1 1-5.2 0c0-1.5 1-3 2.6-4.6z"
        fill="#ffd0bd"
      />
      {/* 台座（やさしい曲線） */}
      <path
        d="M9.5 24.5c2-1.4 4.2-2.1 6.5-2.1s4.5.7 6.5 2.1c-1.8 2.2-4 3.3-6.5 3.3s-4.7-1.1-6.5-3.3z"
        fill="#2a9d87"
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
      <span className={`font-bold text-brand-700 ${textClass}`}>あかり</span>
    </span>
  );
}
