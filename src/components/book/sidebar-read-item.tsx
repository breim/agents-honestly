'use client';

import type * as PageTree from 'fumadocs-core/page-tree';
import { usePathname } from 'fumadocs-core/framework';
import { SidebarItem, useFolderDepth } from 'fumadocs-ui/components/sidebar/base';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsRead } from '@/lib/read-progress';

/** The docs layout styles its own sidebar item but keeps that component private, so overriding
    the item to carry a read mark means restating its classes and depth offset here. Both come
    from `fumadocs-ui/dist/layouts/docs/slots/sidebar.js` and have to be re-checked on upgrade. */
const itemClasses =
  'relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors';

const nestedClasses =
  "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:inset-s-2.5";

function trimTrailingSlash(path: string) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function SidebarReadItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  const read = useIsRead(item.url);

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={trimTrailingSlash(item.url) === trimTrailingSlash(pathname)}
      icon={item.icon}
      className={cn(itemClasses, depth >= 1 && nestedClasses)}
      style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
    >
      {item.name}
      {read && <Check className="ms-auto opacity-50" aria-label="Read" />}
    </SidebarItem>
  );
}
