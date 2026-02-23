import { getBlockDetail } from "@/lib/rpc";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 30;

export default async function BlockPage({
  params,
}: {
  params: Promise<{ network: string; slot: string }>;
}) {
  const { network, slot: slotStr } = await params;
  const slot = parseInt(slotStr, 10);
  if (isNaN(slot)) notFound();

  const block = await getBlockDetail(slot).catch(() => null);
  if (!block) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">Block</p>
        <h1 className="font-heading font-bold text-2xl text-white">
          Slot {block.slot.toLocaleString()}
        </h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mythic-border">
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Block Time</p>
          <p className="text-white text-sm font-mono">
            {block.blockTime ? new Date(block.blockTime).toLocaleString() : "N/A"}
          </p>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Transactions</p>
          <p className="text-white text-sm font-mono">{block.txCount}</p>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Parent Slot</p>
          <Link href={`/${network}/block/${block.parentSlot}`} className="text-mythic-green text-sm font-mono hover:underline">
            {block.parentSlot.toLocaleString()}
          </Link>
        </div>
        <div className="bg-mythic-surface p-4">
          <p className="text-mythic-muted text-xs uppercase mb-1">Network</p>
          <p className="text-white text-sm font-mono capitalize">{network}</p>
        </div>
      </div>
      {block.signatures.length > 0 && (
        <div className="bg-mythic-surface border border-mythic-border">
          <div className="px-4 py-3 border-b border-mythic-border">
            <h2 className="font-heading font-semibold text-sm text-white">Transactions</h2>
          </div>
          <div className="divide-y divide-mythic-border">
            {block.signatures.map((sig: string) => (
              <Link
                key={sig}
                href={`/${network}/tx/${sig}`}
                className="block px-4 py-2.5 font-mono text-xs text-mythic-green hover:bg-mythic-border/30 truncate transition-colors"
              >
                {sig}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
