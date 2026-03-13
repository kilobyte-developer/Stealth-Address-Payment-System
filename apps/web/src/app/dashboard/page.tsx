export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Balance (confirmed)', value: '— BTC' },
          { label: 'Pending payments', value: '—' },
          { label: 'Detected payments', value: '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        <div className="rounded-xl border border-border divide-y divide-border">
          <p className="p-6 text-sm text-muted-foreground text-center">No transactions yet.</p>
        </div>
      </section>
    </div>
  );
}
