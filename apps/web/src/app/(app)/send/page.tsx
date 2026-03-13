export default function SendPage(): React.JSX.Element {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Send Payment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter the receiver&apos;s stealth address and amount. A unique one-time address will be
          derived automatically.
        </p>
      </div>

      {/* TODO: wire up useSendPayment mutation */}
      <form className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="viewKey">
            Receiver Public View Key (A)
          </label>
          <input
            id="viewKey"
            type="text"
            placeholder="02abc..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="spendKey">
            Receiver Public Spend Key (B)
          </label>
          <input
            id="spendKey"
            type="text"
            placeholder="03def..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="amount">
            Amount (satoshis)
          </label>
          <input
            id="amount"
            type="number"
            min="1000"
            placeholder="100000"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Derive Address & Send
        </button>
      </form>
    </div>
  );
}
