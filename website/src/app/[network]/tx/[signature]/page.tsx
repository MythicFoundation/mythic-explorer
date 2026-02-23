import { getTransactionDetail } from "@/lib/rpc";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 30;

export default async function TransactionPage({
  params,
}: {
  params: Promise<{ network: string; signature: string }>;
}) {
  const { network, signature } = await params;
  const tx = await getTransactionDetail(signature).catch(() => null);
  if (!tx) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">Transaction</p>
        <h1 className="font-mono text-sm text-mythic-green break-all">{tx.signature}</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mythic-border">
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Status</p>
          <p className={`text-sm font-semibold ${tx.success ? "text-mythic-green" : "text-red-400"}`}>
            {tx.success ? "Success" : "Failed"}
          </p>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Block</p>
          <Link href={`/${network}/block/${tx.slot}`} className="text-mythic-green text-sm font-mono hover:underline">
            {tx.slot.toLocaleString()}
          </Link>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Time</p>
          <p className="text-white text-sm font-mono">
            {tx.blockTime ? new Date(tx.blockTime).toLocaleString() : "N/A"}
          </p>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Fee</p>
          <p className="text-white text-sm font-mono">{tx.fee} MYTH</p>
        </div>
      </div>
      {tx.accounts.length > 0 && (
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border">
            <h2 className="font-heading font-semibold text-sm text-white">Accounts ({tx.accounts.length})</h2>
          </div>
          <div className="divide-y divide-mythic-border">
            {tx.accounts.map((addr: string, i: number) => (
              <Link
                key={`${addr}-${i}`}
                href={`/${network}/address/${addr}`}
                className="block px-4 py-2.5 font-mono text-xs text-mythic-green hover:bg-mythic-border/30 truncate transition-colors"
              >
                {addr}
              </Link>
            ))}
          </div>
        </div>
      )}
      {tx.logs.length > 0 && (
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border">
            <h2 className="font-heading font-semibold text-sm text-white">Logs</h2>
          </div>
          <div className="p-4">
            <pre className="text-xs font-mono text-mythic-muted whitespace-pre-wrap break-all">
              {tx.logs.join("\n")}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
