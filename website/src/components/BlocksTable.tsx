import Link from "next/link";

interface Block {
  slot: number;
  txCount: number;
  time: string | null;
  parentSlot: number;
}

export default function BlocksTable({ blocks, network = "mainnet" }: { blocks: Block[]; network?: string }) {
  return (
    <div className="bg-[#08080C] border border-white/[0.06]">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-[#686878]">
          Recent Blocks
        </h2>
        <span className="font-mono text-[0.5rem] tracking-[0.1em] uppercase text-[#686878] border border-white/[0.06] px-1.5 py-0.5">
          {blocks.length}
        </span>
      </div>
      <div>
        {blocks.map((b) => (
          <Link
            key={b.slot}
            href={`/${network}/block/${b.slot}`}
            className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.75rem] text-[#39FF14]">
                {b.slot.toLocaleString("en-US")}
              </span>
              {b.time && (
                <span className="font-mono text-[0.65rem] text-[#686878]">
                  {new Date(b.time).toLocaleTimeString("en-US")}
                </span>
              )}
            </div>
            <span className="font-mono text-[0.6rem] text-[#686878]">
              {b.txCount} txs
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

