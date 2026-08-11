import { Children, isValidElement, type ReactNode } from 'react';

const optionLabels = [
  { name: 'plain', label: 'Plain code' },
  { name: 'langgraph', label: 'LangGraph' },
  { name: 'temporal', label: 'Temporal' },
  { name: 'ai-sdk', label: 'AI SDK' },
  { name: 'mcp', label: 'MCP' },
  { name: 'a2a', label: 'A2A' },
];

export function FrameworkOption({ children }: { name: string; children: ReactNode }) {
  return <>{children}</>;
}

export function FrameworkCheck({
  decision,
  title = 'Framework check',
  children,
}: {
  decision: string;
  title?: string;
  children: ReactNode;
}) {
  const bodies = new Map<string, ReactNode>();

  Children.forEach(children, (child) => {
    if (isValidElement<{ name?: string; children?: ReactNode }>(child) && child.props.name) {
      bodies.set(child.props.name, child.props.children);
    }
  });

  const present = optionLabels.filter((option) => bodies.has(option.name));

  return (
    <aside className="my-8 overflow-hidden rounded-xl border bg-fd-card">
      <p className="m-0 bg-fd-muted px-3.5 py-2.5 text-xs font-bold tracking-widest uppercase text-fd-muted-foreground">
        {title}
      </p>

      <div
        className="md:grid"
        style={{ gridTemplateColumns: `repeat(${present.length}, minmax(0, 1fr))` }}
      >
        {present.map((option, i) => (
          <section
            key={option.name}
            className={`min-w-0 p-3.5 text-sm ${i > 0 ? 'border-t md:border-t-0 md:border-s' : ''}`}
          >
            <h3 className="mt-0 mb-1.5 text-sm font-semibold">{option.label}</h3>
            {bodies.get(option.name)}
          </section>
        ))}
      </div>

      <p className="m-0 border-t px-3.5 py-3 text-sm">
        <strong>Decision:</strong> {decision}
      </p>
    </aside>
  );
}
