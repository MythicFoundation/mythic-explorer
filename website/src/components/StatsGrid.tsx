interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div className="bg-mythic-surface border border-mythic-border p-4">
      <p className="text-mythic-muted text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-heading font-bold text-white">{value}</p>
      {sub && <p className="text-mythic-muted text-xs mt-1 font-mono">{sub}</p>}
    </div>
  );
}

function formatSupply(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-mythic-border">
      <Stat label="Slot" value={stats.slot.toLocaleString()} />
      <Stat label="Block Height" value={stats.blockHeight.toLocaleString()} />
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
