import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <div className="landing-shell dark flex flex-1 flex-col">
      <HomeLayout {...baseOptions()} themeSwitch={{ enabled: false }}>
        {children}
      </HomeLayout>
    </div>
  );
}
