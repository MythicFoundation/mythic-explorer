interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div className="bg-[#08080C] border border-white/[0.06] p-4 hover:border-[#7B2FFF]/20 transition-colors duration-300">
      <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#686878] mb-2">
        {label}
      </p>
      <p className="font-mono text-[1.2rem] text-white font-medium tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="font-mono text-[0.55rem] tracking-[0.08em] text-[#686878] mt-1.5">
          {sub}
        </p>
      )}
    </div>
  );
}

function formatSupply(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

interface StatsGridProps {
  stats: {
    slot: number;
    blockHeight: number;
    epoch: number;
    epochProgress: number;
    tps?: number;
    blockTimeMs?: number;
    totalSupply: number;
    l1Supply?: number;
    l2Supply?: number;
    bridgeLocked?: number;
  };
  network?: string;
}

export default function StatsGrid({ stats, network = "mainnet" }: StatsGridProps) {
  const netLabel = network === "testnet" ? "Testnet" : "Mainnet";

  const l1 = stats.l1Supply ?? 0;
  const l2 = stats.l2Supply ?? 0;
  const supplySub = l1 > 0 && l2 > 0
    ? `L1: ${formatSupply(l1)} | L2: ${formatSupply(l2)}`
    : "$MYTH";

  const blockTimeDisplay = stats.blockTimeMs != null
    ? `${stats.blockTimeMs}ms`
    : "\u2014";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px">
      <Stat label="Slot" value={stats.slot.toLocaleString("en-US")} />
      <Stat label="Block Height" value={stats.blockHeight.toLocaleString("en-US")} />
      <Stat label="Epoch" value={stats.epoch} sub={`${stats.epochProgress}% complete`} />
      <Stat label="Block Time" value={blockTimeDisplay} />
      <Stat
        label="Total Supply"
        value={formatSupply(stats.totalSupply)}
        sub={supplySub}
      />
      <Stat label="Network" value={netLabel} sub="Mythic L2" />
    </div>
  );
}

