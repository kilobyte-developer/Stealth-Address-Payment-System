export default function ReceivePage(): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Receive Payment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share your stealth address. Each sender will derive a unique one-time address — your
          identity is never revealed on-chain.
        </p>
      </div>

      {/* TODO: wire up useStealthAddress hook */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Public View Key (A)
          </label>
          <p className="font-mono text-sm mt-1 break-all text-muted-foreground">
            Generating…
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Public Spend Key (B)
          </label>
          <p className="font-mono text-sm mt-1 break-all text-muted-foreground">
            Generating…
          </p>
        </div>

        <div className="flex justify-center pt-2">
          {/* QR code placeholder */}
          <div className="w-40 h-40 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
            QR Code
          </div>
        </div>

        <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Copy Stealth Address
        </button>
      </div>
    </div>
  );
}
