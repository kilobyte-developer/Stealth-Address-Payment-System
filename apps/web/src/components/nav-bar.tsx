'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/receive', label: 'Receive' },
  { href: '/send', label: 'Send' },
  { href: '/scan', label: 'Scan' },
];

export function NavBar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          ⛁ Stealth Pay
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
