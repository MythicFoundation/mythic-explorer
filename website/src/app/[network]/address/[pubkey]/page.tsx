import { getAddressInfo } from "@/lib/rpc";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 10;

export default async function AddressPage({
  params,
}: {
  params: Promise<{ network: string; pubkey: string }>;
}) {
  const { network, pubkey } = await params;
  const info = await getAddressInfo(pubkey).catch(() => null);
  if (!info) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">Address</p>
        <h1 className="font-mono text-sm text-mythic-green break-all">{info.address}</h1>
      </div>
      <div className="grid sm:grid-cols-2 gap-px bg-mythic-border">
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Balance</p>
          <p className="text-white text-xl font-heading font-bold">
            {info.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} MYTH
          </p>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Transactions</p>
          <p className="text-white text-xl font-heading font-bold">{info.transactions.length}</p>
        </div>
      </div>
      {info.tokenBalances.length > 0 && (
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border">
            <h2 className="font-heading font-semibold text-sm text-white">Token Balances</h2>
          </div>
          <div className="divide-y divide-mythic-border">
            {info.tokenBalances.map((t: any) => (
              <div key={t.mint} className="flex items-center justify-between px-4 py-2.5">
                <Link href={`/${network}/address/${t.mint}`} className="font-mono text-xs text-mythic-green hover:underline truncate max-w-[300px]">
                  {t.mint}
                </Link>
                <span className="text-white text-sm font-mono">{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {info.transactions.length > 0 && (
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border">
            <h2 className="font-heading font-semibold text-sm text-white">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-mythic-border">
            {info.transactions.map((tx: any) => (
              <Link
                key={tx.signature}
                href={`/${network}/tx/${tx.signature}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-mythic-border/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`inline-block w-1.5 h-1.5 ${tx.success ? "bg-mythic-green" : "bg-red-400"}`} />
                  <span className="font-mono text-xs text-mythic-text truncate max-w-[250px]">{tx.signature}</span>
                </div>
                <span className="text-mythic-muted text-xs font-mono flex-shrink-0">
                  Slot {tx.slot.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
