type Point = { score: number; date: Date | string };

// 点数の推移を折れ線で表示する軽量チャート（チャートライブラリ不使用）。
// points は古い順（左→右が時系列）で渡す。
export function ScoreTrend({
  points,
  label = "点数の推移",
}: {
  points: Point[];
  label?: string;
}) {
  const valid = points.filter((p) => typeof p.score === "number");
  if (valid.length < 2) return null;

  const W = 320;
  const H = 120;
  const PAD = 28;
  const n = valid.length;

  const xs = (i: number) =>
    n === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (n - 1);
  // Y軸は0〜100固定（評価点が100点満点のため）
  const ys = (score: number) => H - PAD - (score / 100) * (H - PAD * 2);

  const linePath = valid
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(p.score).toFixed(1)}`)
    .join(" ");

  const first = valid[0].score;
  const last = valid[n - 1].score;
  const diff = last - first;
  const best = Math.max(...valid.map((p) => p.score));

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">{label}</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="badge bg-brand-100 text-brand-700">最高 {best}点</span>
          <span
            className={`badge ${
              diff > 0
                ? "bg-green-100 text-green-700"
                : diff < 0
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff} 点（初回比）
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={label}
      >
        {/* 目盛り線（0/50/100） */}
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line
              x1={PAD}
              y1={ys(g)}
              x2={W - PAD}
              y2={ys(g)}
              stroke="#e9e2d4"
              strokeWidth="1"
            />
            <text x={4} y={ys(g) + 3} fontSize="9" fill="#9ca3af">
              {g}
            </text>
          </g>
        ))}

        {/* 折れ線 */}
        <path
          d={linePath}
          fill="none"
          stroke="#2a9d87"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 点 */}
        {valid.map((p, i) => (
          <circle
            key={i}
            cx={xs(i)}
            cy={ys(p.score)}
            r="3.5"
            fill="#fff"
            stroke="#2a9d87"
            strokeWidth="2"
          />
        ))}
      </svg>

      <p className="mt-1 text-center text-xs text-gray-400">
        左（古い）→ 右（新しい）。直近 {n} 回の評価点
      </p>
    </div>
  );
}
