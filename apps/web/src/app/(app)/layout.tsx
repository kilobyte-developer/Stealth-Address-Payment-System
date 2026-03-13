import { NavBar } from '@/components/nav-bar';

export default function AppLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">{children}</main>
    </div>
  );
}
