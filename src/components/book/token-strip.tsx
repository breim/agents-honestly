export function TokenStrip({
  tokens,
  stats = true,
  markSpaces = false,
}: {
  tokens: string[];
  stats?: boolean;
  markSpaces?: boolean;
}) {
  const chars = tokens.join('').length;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((token, i) => {
          const color = `var(--viz-${(i % 5) + 1})`;

          return (
            <span
              key={i}
              className="inline-flex items-baseline gap-1.5 rounded border px-1.5 py-1"
              style={{
                borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
                background: `color-mix(in oklab, ${color} 15%, transparent)`,
              }}
            >
              <span className="font-mono text-sm whitespace-pre">
                {markSpaces ? token.replaceAll(' ', '␣') : token}
              </span>
              <span className="text-[0.65rem]" style={{ color }}>
                {i + 1}
              </span>
            </span>
          );
        })}
      </div>
      {stats && (
        <p className="mt-3.5 text-sm text-fd-muted-foreground">
          <strong>{tokens.length}</strong> tokens · <strong>{chars}</strong> characters ·{' '}
          {(chars / tokens.length).toFixed(2)} chars per token
        </p>
      )}
    </div>
  );
}
