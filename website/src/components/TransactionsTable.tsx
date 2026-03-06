import Link from "next/link";

interface Tx {
  signature: string;
  slot: number;
  success: boolean;
  fee: number;
  time: string | null;
}

function truncSig(sig: string): string {
  if (sig.length <= 16) return sig;
  return sig.slice(0, 8) + "\u2026" + sig.slice(-8);
}

export default function TransactionsTable({ txs, network = "mainnet" }: { txs: Tx[]; network?: string }) {
  return (
    <div className="bg-[#08080C] border border-white/[0.06]">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-[#686878]">
          Recent Transactions
        </h2>
        <span className="font-mono text-[0.5rem] tracking-[0.1em] uppercase text-[#686878] border border-white/[0.06] px-1.5 py-0.5">
          {txs.length}
        </span>
      </div>
      <div>
        {txs.map((tx) => (
          <Link
            key={tx.signature}
            href={`/${network}/tx/${tx.signature}`}
            className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-block w-1.5 h-1.5 flex-shrink-0 ${
                  tx.success ? "bg-[#34D399]" : "bg-[#F87171]"
                }`}
              />
              <span className="font-mono text-[0.7rem] text-text-200 truncate max-w-[200px] hover:text-[#39FF14] transition-colors">
                {truncSig(tx.signature)}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="font-mono text-[0.6rem] text-[#686878]">
                Slot {tx.slot.toLocaleString("en-US")}
              </span>
              {tx.fee > 0 && (
                <span className="font-mono text-[0.55rem] text-[#686878]">
                  {tx.fee} MYTH
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

