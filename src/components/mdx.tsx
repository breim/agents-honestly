import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { type ComponentProps, isValidElement, type ReactNode } from 'react';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { cn } from '@/lib/cn';
import {
  Aside,
  ContextBudget,
  Decision,
  Figure,
  Flow,
  FrameworkCheck,
  FrameworkOption,
  Ladder,
  Layers,
  TokenStrip,
  TurnGrowth,
} from '@/components/book';

/** Box-drawing and block-element glyphs. Their presence means the block is drawn on a
    character grid rather than written, which is the one thing on this site that cannot
    survive a proportional face. */
const DIAGRAM_GLYPH = /[─-▟]/;

function textOf(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);

  return '';
}

function CodeBlockOrDiagram({ children, className, ...props }: ComponentProps<'pre'>) {
  return (
    <CodeBlock
      className={cn(className, DIAGRAM_GLYPH.test(textOf(children)) && 'is-diagram')}
      {...props}
    >
      <Pre>{children}</Pre>
    </CodeBlock>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: CodeBlockOrDiagram,
    Aside,
    ContextBudget,
    Decision,
    Figure,
    Flow,
    FrameworkCheck,
    FrameworkOption,
    Ladder,
    Layers,
    Tab,
    Tabs,
    TokenStrip,
    TurnGrowth,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
