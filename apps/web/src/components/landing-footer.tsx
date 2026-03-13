import Link from 'next/link';
import { Github, Shield, Sparkles } from 'lucide-react';

const footerLinks = [
  { href: '#features', label: 'Features' },
  { href: '#flow', label: 'Flow' },
  { href: '#proof', label: 'Security' },
  { href: '/dashboard', label: 'Launch app' },
];

export function LandingFooter(): React.JSX.Element {
  return (
    <footer className="relative border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr,1fr] md:px-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/75">
            <Shield className="h-3.5 w-3.5" />
            Privacy infrastructure for Bitcoin
          </div>
          <div className="max-w-xl text-2xl font-medium tracking-tight text-white md:text-3xl">
            Institutional-grade wallet flows with stealth-address privacy layered on top.
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/55">
            Built for fast demoability, clean architecture, and a product feel that matches the
            cryptographic sophistication underneath.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Navigate</div>
            <div className="space-y-3">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/68 transition hover:text-cyan-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Stack</div>
            <div className="space-y-3 text-white/68">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" /> Next.js + shadcn
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-300" /> Supabase + RLS
              </div>
              <Link
                href="https://github.com/YogeshK34/Stealth-Address-Payment-System"
                className="flex items-center gap-2 transition hover:text-cyan-200"
              >
                <Github className="h-4 w-4" /> GitHub repository
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-6 py-5 text-center text-xs text-white/35 md:px-8">
        © 2026 Stealth Pay · Modern stealth-address UX for private Bitcoin payments.
      </div>
    </footer>
  );
}
