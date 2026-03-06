import Link from "next/link";
import { notFound } from "next/navigation";

const VALID = ["mainnet", "testnet"] as const;
type Net = (typeof VALID)[number];
const CFG: Record<Net, { label: string; color: string; dot: string }> = {
  mainnet: { label: "Mainnet", color: "text-[#39FF14]", dot: "bg-[#39FF14]" },
  testnet: { label: "Testnet", color: "text-yellow-400", dot: "bg-yellow-400" },
};

export function generateStaticParams() { return VALID.map(n => ({ network: n })); }

export default async function NetworkLayout({ children, params }: { children: React.ReactNode; params: Promise<{ network: string }> }) {
  const { network } = await params;
  if (!VALID.includes(network as Net)) notFound();
  const c = CFG[network as Net];
  const other = network === "mainnet" ? "testnet" : "mainnet";
  const oc = CFG[other];

  return (
    <div>
      <div className="bg-[#060609]/80 border-b border-[#39FF14]/[0.05] backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`pulse-dot inline-block w-1.5 h-1.5 ${c.dot}`} />
              <span className={`font-mono text-[0.55rem] tracking-[0.14em] uppercase font-bold ${c.color}`}>{c.label}</span>
            </div>
            <span className="text-[#555568] text-[0.4rem]">\u2502</span>
            <Link href={`/${other}`} className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[#555568] hover:text-white transition-colors">
              Switch to {oc.label}
            </Link>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-block w-1 h-1 bg-[#34D399]" />
            <span className="font-mono text-[0.5rem] tracking-[0.08em] text-[#555568]">
              RPC Connected
            </span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
