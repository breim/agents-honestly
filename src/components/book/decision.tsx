interface DecisionNode {
  on?: string;
  q?: string;
  outcome?: string;
  note?: string;
  tone?: number;
  branches?: DecisionNode[];
}

interface DecisionProps {
  node: DecisionNode;
  root?: string;
}

const RULE = 'color-mix(in oklab, var(--viz-muted) 55%, transparent)';
const toneColor = (tone?: number) => (tone ? `var(--viz-${tone})` : 'var(--viz-muted)');

function TreeNode({ node }: { node: DecisionNode }) {
  const branches = node.branches;
  const color = toneColor(node.tone);

  return (
    <div className="flex flex-col items-center max-[40rem]:items-start">
      {node.outcome && (
        <p
          className="m-0 rounded-[0.35rem] px-[0.6rem] py-[0.3rem] text-center text-[0.8125rem] leading-[1.3] font-semibold whitespace-nowrap text-fd-foreground max-[40rem]:whitespace-normal"
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: `color-mix(in oklab, ${color} 45%, var(--viz-grid))`,
            borderBlockEndWidth: '2px',
            borderBlockEndColor: color,
            background: `color-mix(in oklab, ${color} 10%, transparent)`,
          }}
        >
          {node.outcome}
          {node.note && <span className="block text-xs font-normal text-fd-muted-foreground">{node.note}</span>}
        </p>
      )}

      {node.q && (
        <p
          className={`m-0 max-w-[9.5rem] text-center text-xs leading-[1.4] text-balance text-fd-muted-foreground max-[40rem]:max-w-none max-[40rem]:text-start ${
            node.outcome ? 'mt-[0.9rem]' : ''
          }`}
        >
          {node.q}
        </p>
      )}

      {branches && branches.length > 0 && (
        <div className="relative flex items-start justify-center pt-[1.1rem] max-[40rem]:flex-col max-[40rem]:gap-[0.9rem] max-[40rem]:pt-[0.9rem] max-[40rem]:ps-[1.1rem]">
          <span
            aria-hidden="true"
            className="absolute top-0 left-1/2 h-[1.1rem] w-px -translate-x-1/2 max-[40rem]:left-[0.35rem] max-[40rem]:h-[0.9rem] max-[40rem]:translate-x-0"
            style={{ background: RULE }}
          />

          {branches.map((branch, i) => {
            const isFirst = i === 0;
            const isLast = i === branches.length - 1;
            const isOnly = branches.length === 1;
            const branchColor = toneColor(branch.tone);

            return (
              <div
                key={i}
                className={`relative flex flex-col items-center px-[0.4rem] max-[40rem]:items-start max-[40rem]:px-0 max-[40rem]:pt-0 ${branch.on ? 'pt-[0.8rem]' : 'pt-[1.75rem]'}`}
              >
                {!isOnly && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-px max-[40rem]:hidden"
                    style={{ left: isFirst ? '50%' : 0, right: isLast ? '50%' : 0, background: RULE }}
                  />
                )}
                {/* One column makes a bar-and-drop bracket a lie, so the siblings
                    hang off a single rail on the left instead. */}
                <span
                  aria-hidden="true"
                  className="absolute hidden w-px max-[40rem]:block"
                  style={{
                    top: '-0.9rem',
                    left: '-0.75rem',
                    height: isLast ? '1.6rem' : 'calc(100% + 0.9rem)',
                    background: RULE,
                  }}
                />
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-1/2 w-px -translate-x-1/2 max-[40rem]:hidden ${branch.on ? 'h-[0.8rem]' : 'h-[1.75rem]'}`}
                  style={{ background: RULE }}
                />
                {branch.on && (
                  <span
                    className="relative mb-[0.95rem] inline-flex items-center rounded-[0.3rem] px-[0.45rem] py-[0.15rem] text-xs leading-[1.3] font-medium whitespace-nowrap text-fd-foreground max-[40rem]:mb-2"
                    style={{
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: `color-mix(in oklab, ${branchColor} 45%, transparent)`,
                      background: `color-mix(in oklab, ${branchColor} 12%, transparent)`,
                    }}
                  >
                    {branch.on}
                    <span
                      aria-hidden="true"
                      className="absolute top-full left-1/2 h-[0.95rem] w-px -translate-x-1/2 max-[40rem]:hidden"
                      style={{ background: RULE }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute hidden h-px w-[0.75rem] max-[40rem]:block"
                      style={{ top: '50%', insetInlineEnd: '100%', background: RULE }}
                    />
                  </span>
                )}
                <TreeNode node={branch} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Decision({ node, root }: DecisionProps) {
  return (
    <div className="flex min-w-min flex-col items-center">
      {root && (
        <>
          <p className="m-0 text-[0.8125rem] font-semibold tracking-[0.06em] text-fd-primary uppercase">{root}</p>
          <span aria-hidden="true" className="h-[1.1rem] w-px" style={{ background: RULE }} />
        </>
      )}
      <TreeNode node={node} />
    </div>
  );
}
