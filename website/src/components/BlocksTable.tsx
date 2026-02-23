import Link from "next/link";

interface Block {
  slot: number;
  txCount: number;
  time: string | null;
  parentSlot: number;
}

export default function BlocksTable({ blocks, network = "mainnet" }: { blocks: Block[]; network?: string }) {
  return (
    <div className="bg-mythic-surface border border-mythic-border">
      <div className="px-4 py-3 border-b border-mythic-border">
        <h2 className="font-heading font-semibold text-sm text-white">Recent Blocks</h2>
      </div>
      <div className="divide-y divide-mythic-border">
        {blocks.map((b) => (
          <Link
            key={b.slot}
            href={`/${network}/block/${b.slot}`}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-mythic-border/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-mythic-green text-sm">{b.slot.toLocaleString()}</span>
              {b.time && (
                <span className="text-mythic-muted text-xs">
                  {new Date(b.time).toLocaleTimeString()}
                </span>
              )}
            </div>
            <span className="text-mythic-muted text-xs font-mono">{b.txCount} txs</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
