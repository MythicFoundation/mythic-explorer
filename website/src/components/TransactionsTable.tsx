import Link from "next/link";

interface Tx {
  signature: string;
  slot: number;
  success: boolean;
  fee: number;
  time: string | null;
}

export default function TransactionsTable({ txs, network = "mainnet" }: { txs: Tx[]; network?: string }) {
  return (
    <div className="bg-mythic-surface border border-mythic-border">
      <div className="px-4 py-3 border-b border-mythic-border">
        <h2 className="font-heading font-semibold text-sm text-white">Recent Transactions</h2>
      </div>
      <div className="divide-y divide-mythic-border">
        {txs.map((tx) => (
          <Link
            key={tx.signature}
            href={`/${network}/tx/${tx.signature}`}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-mythic-border/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-block w-1.5 h-1.5 ${tx.success ? "bg-mythic-green" : "bg-red-400"}`}
              />
              <span className="font-mono text-xs text-mythic-text truncate max-w-[200px]">
                {tx.signature}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-mythic-muted text-xs font-mono">
                Slot {tx.slot.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
