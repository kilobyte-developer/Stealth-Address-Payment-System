'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '#features', label: 'Features' },
  { href: '#flow', label: 'Flow' },
  { href: '#proof', label: 'Architecture' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingNavbar(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:px-6 md:pt-6">
      <header
        className={cn(
          'pointer-events-auto w-full max-w-6xl rounded-full border border-white/12 bg-white/8 backdrop-blur-2xl transition-all duration-500',
          scrolled
            ? 'shadow-[0_20px_80px_rgba(0,0,0,0.45)] ring-1 ring-cyan-400/10'
            : 'shadow-[0_12px_60px_rgba(0,0,0,0.28)]'
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-5 md:h-[72px] md:px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200/70">
                Stealth Pay
              </div>
              <div className="text-sm text-white/55">Private Bitcoin rails</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/10 p-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/68 transition hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className="hidden rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/8 hover:text-white md:inline-flex"
            >
              Live scanner
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.35)] transition hover:scale-[1.02]"
            >
              Launch app
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
