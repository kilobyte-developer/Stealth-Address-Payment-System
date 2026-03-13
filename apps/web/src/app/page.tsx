import Link from 'next/link';

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4 max-w-2xl">
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          Bitcoin · Privacy · BitGo
        </span>
        <h1 className="text-5xl font-bold tracking-tight">Stealth Pay</h1>
        <p className="text-muted-foreground text-lg">
          Send and receive Bitcoin privately. Every payment goes to a unique, unlinkable address —
          your identity never appears on-chain.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
          >
            Launch App
          </Link>
          <Link
            href="/receive"
            className="rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
          >
            Get Stealth Address
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-8">
        {[
          {
            title: 'Unlinkable Addresses',
            desc: 'Each payment produces a unique on-chain address. No observer can connect multiple payments to you.',
          },
          {
            title: 'Built on BitGo',
            desc: 'Institutional-grade wallet security, multisig, and transaction infrastructure. Zero custody trade-off.',
          },
          {
            title: 'Scan & Spend',
            desc: 'Your scanner detects incoming payments using your private view key. Spend with your spend key only.',
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6 space-y-2">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
