import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { SidebarReadItem } from '@/components/book/sidebar-read-item';

export default function Layout({ children }: LayoutProps<'/book'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      links={[]}
      sidebar={{ components: { Item: SidebarReadItem } }}
    >
      {children}
    </DocsLayout>
  );
}
