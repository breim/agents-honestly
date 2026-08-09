import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Aside, ContextBudget, Figure, TokenStrip, TurnGrowth } from '@/components/book';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Aside,
    ContextBudget,
    Figure,
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
