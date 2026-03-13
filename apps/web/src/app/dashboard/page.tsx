export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-8">
      <section className="app-shell-panel overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/75">
              Wallet command center
            </div>
            <div>
              <h1 className="app-section-title">
                Privacy dashboard for receiving, scanning, and moving stealth funds.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                Monitor balances, detect newly matched outputs, and keep the entire stealth-address
                lifecycle in one polished operational surface.
              </p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">System status</div>
            <div className="mt-4 space-y-4 text-sm text-white/68">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Supabase auth</span>
                <span className="text-emerald-300">Connected</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Scanner cadence</span>
                <span className="text-cyan-200">30s loop</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Privacy route</span>
                <span className="text-violet-200">ECDH enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Balance (confirmed)', value: '— BTC' },
          { label: 'Pending payments', value: '—' },
          { label: 'Detected payments', value: '—' },
        ].map((s) => (
          <div key={s.label} className="metric-tile">
            <p className="text-sm text-white/48">{s.label}</p>
            <p className="mt-2 text-3xl font-medium tracking-tight text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="app-shell-panel rounded-[1.75rem] p-6">
          <h2 className="text-lg font-medium text-white">Recent Transactions</h2>
          <div className="mt-4 rounded-[1.25rem] border border-white/10 divide-y divide-white/10">
            <p className="p-6 text-sm text-white/45 text-center">No transactions yet.</p>
          </div>
        </div>
        <div className="app-shell-panel rounded-[1.75rem] p-6">
          <h2 className="text-lg font-medium text-white">What to do next</h2>
          <div className="mt-4 space-y-3 text-sm text-white/60">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              1. Create or attach a wallet.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              2. Share your stealth address from Receive.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              3. Use Scan to detect fresh private payments.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
