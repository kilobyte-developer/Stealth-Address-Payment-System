export default function ScanPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Blockchain</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Check recent transactions for payments addressed to your stealth address using your
          private view key.
        </p>
      </div>

      {/* TODO: wire up useScan mutation + useDetectedPayments query */}
      <div className="flex gap-3">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Run Scan Now
        </button>
        <span className="flex items-center text-sm text-muted-foreground">
          Auto-scan every 30s (daemon)
        </span>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Detected Payments</h2>
        <div className="rounded-xl border border-border divide-y divide-border">
          <p className="p-6 text-sm text-muted-foreground text-center">No payments detected yet.</p>
        </div>
      </section>
    </div>
  );
}
