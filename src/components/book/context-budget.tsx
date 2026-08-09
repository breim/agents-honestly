interface Segment {
  label: string;
  tokens: number;
  note?: string;
}

const format = (n: number) => n.toLocaleString('en-US');

export function ContextBudget({
  window: windowSize,
  segments,
  reserveOutput = 0,
}: {
  window: number;
  segments: Segment[];
  reserveOutput?: number;
}) {
  const used = segments.reduce((sum, s) => sum + s.tokens, 0);
  const free = Math.max(0, windowSize - used - reserveOutput);
  const percent = (n: number) => (n / windowSize) * 100;

  const rows: (Segment & { color: string; kind: 'used' | 'reserved' | 'free' })[] = [
    ...segments.map((s, i) => ({ ...s, color: `var(--viz-${(i % 5) + 1})`, kind: 'used' as const })),
    ...(reserveOutput
      ? [{ label: 'Reserved for output', tokens: reserveOutput, color: 'var(--viz-muted)', kind: 'reserved' as const }]
      : []),
    { label: 'Free', tokens: free, color: 'var(--viz-empty)', kind: 'free' as const },
  ];

  return (
    <div>
      <div
        className="flex h-9 w-full gap-0.5 overflow-hidden rounded"
        style={{ background: 'var(--viz-empty)' }}
        role="img"
        aria-label={`Context window usage: ${format(used)} of ${format(windowSize)} tokens used`}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className="min-w-px"
            style={{
              width: `${percent(row.tokens)}%`,
              background:
                row.kind === 'free'
                  ? 'transparent'
                  : row.kind === 'reserved'
                    ? `repeating-linear-gradient(45deg, ${row.color} 0 4px, transparent 4px 8px)`
                    : row.color,
              opacity: row.kind === 'reserved' ? 0.6 : undefined,
            }}
            title={`${row.label}: ${format(row.tokens)} tokens`}
          />
        ))}
      </div>

      <table className="mt-4 w-full border-collapse text-[0.8125rem]">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[var(--viz-grid)] last:border-b-0">
              <td className="w-5 py-1.5 pe-2">
                <span
                  className="block size-2.5 rounded-[0.15rem] border"
                  style={{ background: row.color, borderColor: 'var(--viz-grid)' }}
                />
              </td>
              <td className="w-full py-1.5 pe-2">
                {row.label}
                {row.note && <span className="text-fd-muted-foreground"> · {row.note}</span>}
              </td>
              <td className="py-1.5 pe-2 text-end whitespace-nowrap text-fd-muted-foreground">
                {format(row.tokens)}
              </td>
              <td className="w-14 py-1.5 text-end whitespace-nowrap text-fd-muted-foreground">
                {percent(row.tokens).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
