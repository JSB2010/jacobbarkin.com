"use client";

type Datum = {
  date: string;
  value: number;
};

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function EmbedLineChart({
  data,
  color = "#2563eb",
  height = 180,
  title,
}: {
  data: Datum[];
  color?: string;
  height?: number;
  title?: string;
}) {
  const width = 640;
  const padding = 20;
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - (item.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      {title ? <div className="text-sm font-medium">{title}</div> : null}
      <div className="rounded-xl border bg-background/80 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title || "Trend chart"}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" opacity="0.12" />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
          {data.map((item, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
            const y = height - padding - (item.value / max) * (height - padding * 2);
            return (
              <circle key={`${item.date}-${index}`} cx={x} cy={y} r="4" fill={color}>
                <title>{`${formatShortDate(item.date)}: ${item.value.toLocaleString()}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          {data.filter((_, index) => index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2) || index === Math.floor(data.length / 3)).map((item) => (
            <div key={item.date} className="truncate">
              <span className="font-medium text-foreground">{formatShortDate(item.date)}</span>
              {" · "}
              {item.value.toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
