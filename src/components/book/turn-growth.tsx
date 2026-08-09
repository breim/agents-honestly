const WIDTH = 720;
const HEIGHT = 280;
const PAD = { left: 62, right: 16, top: 16, bottom: 34 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

const format = (n: number) => n.toLocaleString('en-US');
const abbreviate = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

export function TurnGrowth({
  turns = 30,
  system = 6000,
  perTurn = 900,
  cap,
  summaryCap,
}: {
  turns?: number;
  system?: number;
  perTurn?: number;
  cap?: number;
  summaryCap?: number;
}) {
  const naive = Array.from({ length: turns }, (_, i) => system + perTurn * i);
  const summarized = summaryCap ? naive.map((v) => Math.min(v, system + summaryCap)) : null;

  const totalNaive = naive.reduce((a, b) => a + b, 0);
  const totalSummarized = summarized?.reduce((a, b) => a + b, 0) ?? 0;

  const ceiling = cap && cap <= naive[turns - 1] * 1.6 ? cap : null;
  const yMax = Math.max(naive[turns - 1], ceiling ?? 0) * 1.08;

  const x = (i: number) => PAD.left + (PLOT_W / turns) * (i + 0.5);
  const y = (v: number) => PAD.top + PLOT_H - (v / yMax) * PLOT_H;
  const barWidth = Math.max(2, (PLOT_W / turns) * 0.68);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));
  const xLabels = Array.from({ length: turns }, (_, i) => i).filter(
    (i) => i === 0 || (i + 1) % 5 === 0,
  );

  const linePath = summarized
    ?.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        className="block overflow-visible"
        role="img"
        aria-label={`Input tokens per turn over ${turns} turns, growing from ${format(naive[0])} to ${format(naive[turns - 1])}`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--viz-grid)"
            />
            <text
              x={PAD.left - 8}
              y={y(tick)}
              fill="var(--viz-muted)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {abbreviate(tick)}
            </text>
          </g>
        ))}

        {naive.map((v, i) => (
          <rect
            key={i}
            x={x(i) - barWidth / 2}
            y={y(v)}
            width={barWidth}
            height={PAD.top + PLOT_H - y(v)}
            rx="1.5"
            fill="var(--viz-1)"
            opacity="0.8"
          />
        ))}

        {ceiling && (
          <g>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(ceiling)}
              y2={y(ceiling)}
              stroke="var(--viz-5)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text
              x={WIDTH - PAD.right}
              y={y(ceiling) - 6}
              fill="var(--viz-5)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              context window · {abbreviate(ceiling)}
            </text>
          </g>
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--viz-3)"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
        )}

        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={PAD.top + PLOT_H}
          y2={PAD.top + PLOT_H}
          stroke="var(--viz-muted)"
        />
        {xLabels.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={PAD.top + PLOT_H + 18}
            fill="var(--viz-muted)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {i + 1}
          </text>
        ))}
        <text
          x={PAD.left + PLOT_W / 2}
          y={HEIGHT - 2}
          fill="var(--viz-muted)"
          fontSize="10"
          textAnchor="middle"
        >
          turn
        </text>
      </svg>

      <div className="mt-4 flex flex-col gap-1 text-sm text-fd-muted-foreground">
        <span className="flex items-center gap-2">
          <i
            className="inline-block h-2.5 w-3.5 flex-none rounded-[0.1rem] opacity-80"
            style={{ background: 'var(--viz-1)' }}
          />
          full transcript: {format(naive[turns - 1])} input tokens on turn {turns},{' '}
          {format(totalNaive)} paid across the conversation
        </span>
        {summarized && (
          <span className="flex items-center gap-2">
            <i
              className="inline-block w-3.5 flex-none border-t-2"
              style={{ borderColor: 'var(--viz-3)' }}
            />
            rolling summary: capped at {format(system + (summaryCap ?? 0))}, {format(totalSummarized)}{' '}
            total ({Math.round((1 - totalSummarized / totalNaive) * 100)}% cheaper)
          </span>
        )}
      </div>
    </div>
  );
}
