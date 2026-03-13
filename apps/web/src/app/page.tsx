import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bitcoin,
  Blocks,
  Eye,
  Fingerprint,
  LockKeyhole,
  Orbit,
  Radar,
  ScanLine,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { LandingFooter } from '@/components/landing-footer';
import { LandingNavbar } from '@/components/landing-navbar';

const featureCards = [
  {
    icon: Fingerprint,
    title: 'Unlinkable by design',
    description:
      'Every payment derives a fresh one-time destination, so repeat transfers never collapse into a visible identity trail.',
  },
  {
    icon: Shield,
    title: 'BitGo-backed execution',
    description:
      'Wallet creation, balances, and broadcasting ride on proven institutional wallet rails instead of experimental custody paths.',
  },
  {
    icon: Eye,
    title: 'View-key scanning',
    description:
      'Receivers detect payments privately using the view key, while the spend key remains isolated for actual fund control.',
  },
  {
    icon: Radar,
    title: 'Real-time detection loop',
    description:
      'A dedicated scanner watches transfers, extracts ephemeral metadata, and resolves which payments belong to you.',
  },
  {
    icon: LockKeyhole,
    title: 'Cryptographic privacy layer',
    description:
      'ECDH shared secrets on secp256k1 make the payment graph opaque to observers without changing the Bitcoin network itself.',
  },
  {
    icon: Wallet,
    title: 'Built for shipping',
    description:
      'Supabase auth, typed APIs, and a monorepo architecture keep the demo fast while preserving a clean upgrade path.',
  },
];

const steps = [
  {
    id: '01',
    title: 'Publish a stealth address',
    text: 'A receiver exposes only the public view and public spend keys. No static receiving address is reused on-chain.',
  },
  {
    id: '02',
    title: 'Derive a one-time output',
    text: 'The sender generates a fresh ephemeral key, computes the shared secret, and creates a unique destination address.',
  },
  {
    id: '03',
    title: 'Scan and recognize privately',
    text: 'The scanner evaluates transaction metadata and outputs with the private view key to identify inbound funds.',
  },
];

const faqs = [
  {
    q: 'What actually stays private?',
    a: 'Observers can still see that a Bitcoin transaction happened, but they cannot trivially correlate multiple incoming payments to the same receiver address because each payment lands at a unique derived output.',
  },
  {
    q: 'Why layer this on BitGo?',
    a: 'The privacy innovation is isolated to address derivation and scanning. BitGo still handles wallet infrastructure, balances, and transaction broadcasting.',
  },
  {
    q: 'Does the frontend ever hold private stealth keys?',
    a: 'No. The frontend only works with public information and app actions. Detection and sensitive key operations stay in the server and scanner layers.',
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <main className="relative overflow-hidden text-white">
      <LandingNavbar />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-grid absolute inset-0 opacity-40" />
        <div className="animate-float-slow absolute left-[8%] top-32 h-72 w-72 rounded-full bg-cyan-400/18 blur-[120px]" />
        <div className="animate-float-delay absolute right-[10%] top-28 h-80 w-80 rounded-full bg-violet-500/16 blur-[140px]" />
        <div className="animate-pulse-soft absolute bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-[120px]" />
      </div>

      <section className="relative px-6 pb-24 pt-32 md:px-8 md:pb-32 md:pt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Stealth-address payments for Bitcoin
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-medium leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
                Private Bitcoin payments with a{' '}
                <span className="text-gradient-premium">glass-smooth product experience</span>.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/62 md:text-xl">
                Stealth Pay turns every inbound payment into a fresh on-chain address, layered on
                top of BitGo wallet infrastructure and powered by modern scanning, secure auth, and
                premium UX.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 px-6 py-3.5 text-sm font-medium text-slate-950 shadow-[0_20px_60px_rgba(56,189,248,0.35)] transition hover:scale-[1.02]"
              >
                Launch app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/receive"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/88 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/8"
              >
                Generate stealth address
              </Link>
            </div>

            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                'Fresh destination per payment',
                'Scanner-backed inbound detection',
                'Supabase auth + BitGo wallet rails',
              ].map((item) => (
                <div key={item} className="glass-panel rounded-2xl px-4 py-4 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel shadow-glow-cyan relative overflow-hidden rounded-[2rem] p-6 md:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/38">
                    Live payment surface
                  </div>
                  <div className="mt-2 text-xl font-medium text-white">Privacy orchestration</div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  Scanner active
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/35">
                    <span>Derived payment route</span>
                    <span>ECDH</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/8 p-4">
                    <div>
                      <div className="text-xs text-white/45">Receiver stealth address</div>
                      <div className="mt-1 font-mono text-sm text-cyan-100">A + B public keys</div>
                    </div>
                    <Orbit className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="mx-auto my-3 h-10 w-px bg-gradient-to-b from-cyan-300/70 to-violet-400/10" />
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-violet-400/10 bg-violet-400/8 p-4">
                    <div>
                      <div className="text-xs text-white/45">One-time address</div>
                      <div className="mt-1 font-mono text-sm text-violet-100">P = H(r·A)·G + B</div>
                    </div>
                    <Bitcoin className="h-5 w-5 text-violet-300" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/85">
                      <ScanLine className="h-4 w-4 text-cyan-300" />
                      Detection loop
                    </div>
                    <div className="mt-4 text-3xl font-medium tracking-tight">30s</div>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Default scan interval tuned for live demo responsiveness and clean ops.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/85">
                      <BadgeCheck className="h-4 w-4 text-emerald-300" />
                      Privacy invariant
                    </div>
                    <div className="mt-4 text-3xl font-medium tracking-tight">1 tx → 1 address</div>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Every transfer gets a fresh ephemeral key, eliminating static receive-address
                      reuse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl space-y-4">
            <div className="text-sm font-medium uppercase tracking-[0.26em] text-cyan-200/70">
              Premium capability stack
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-white md:text-5xl">
              A landing experience that reflects the sophistication of the protocol underneath.
            </h2>
            <p className="text-lg leading-8 text-white/55">
              The product story centers on three ideas: stealth-address privacy, trusted wallet
              infrastructure, and a scan layer that makes cryptography feel usable.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="glass-panel group rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/15 hover:bg-white/10"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/18 to-violet-400/18 text-cyan-200 transition group-hover:scale-105 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-medium text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/55">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flow" className="relative px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="space-y-5">
            <div className="text-sm font-medium uppercase tracking-[0.26em] text-violet-200/70">
              Payment flow
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-white md:text-5xl">
              Sender simplicity. Receiver privacy. Scanner intelligence.
            </h2>
            <p className="text-lg leading-8 text-white/55">
              The homepage explains the system in product language while staying faithful to the
              actual cryptographic and operational flow in the codebase.
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((step) => (
              <div key={step.id} className="glass-panel rounded-[1.75rem] p-6 md:p-7">
                <div className="flex items-start gap-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-medium text-cyan-200">
                    {step.id}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/55">{step.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="relative px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="glass-panel rounded-[2rem] p-7 md:p-8">
            <div className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.24em] text-cyan-200/70">
              <Blocks className="h-4 w-4" />
              Why this architecture works
            </div>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight text-white md:text-4xl">
              Privacy is introduced as a layer, not as a replacement for the wallet stack.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [
                  'Crypto layer',
                  'Stealth address derivation and shared-secret math produce unlinkable outputs.',
                ],
                [
                  'Execution layer',
                  'BitGo handles wallet operations, transfers, and operational trust.',
                ],
                [
                  'Detection layer',
                  'Scanner services map blockchain outputs back to the rightful receiver.',
                ],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="font-medium text-white">{title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/52">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-7 md:p-8">
            <div className="mb-6 text-sm font-medium uppercase tracking-[0.24em] text-emerald-200/70">
              System signals
            </div>
            <div className="space-y-5">
              {[
                { label: 'Stealth address export', value: 'Public view + spend keys' },
                { label: 'Auth model', value: 'Supabase session-backed access' },
                { label: 'Wallet backend', value: 'BitGo testnet and wallet helpers' },
                { label: 'Detection strategy', value: 'Ephemeral metadata + output scan' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="text-sm text-white/45">{item.label}</div>
                  <div className="text-right text-sm font-medium text-white/80">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl space-y-4">
            <div className="text-sm font-medium uppercase tracking-[0.26em] text-cyan-200/70">
              FAQ
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-white md:text-5xl">
              Product clarity without flattening the cryptography.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.q} className="glass-panel rounded-[1.75rem] p-6">
                <div className="text-lg font-medium text-white">{item.q}</div>
                <p className="mt-4 text-sm leading-7 text-white/55">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-6 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/15"
            >
              Enter the product
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
