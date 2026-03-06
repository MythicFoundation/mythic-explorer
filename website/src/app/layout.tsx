import type { Metadata } from "next";
import Link from "next/link";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Mythic Explorer | Mythic L2 Block Explorer",
  description: "Real-time blockchain explorer for the Mythic L2 network. Search transactions, accounts, tokens, and blocks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable} ${jetbrains.variable} min-h-screen bg-[#060609] text-[#D8D8E4] font-body`}>

        {/* ── Navbar ──────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 h-14 border-b border-[#39FF14]/[0.08] bg-[#060609]/95 backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

            {/* Logo */}
            <Link href="/mainnet" className="flex items-center gap-3 group">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,8 20,44 50,56" fill="#39FF14" opacity="0.95" />
                  <polygon points="50,8 80,44 50,56" fill="#6FFF4F" opacity="0.75" />
                  <polygon points="20,44 50,56 80,44 50,92" fill="#2ACC10" opacity="0.85" />
                </svg>
              </div>
              <span className="font-display font-bold text-[0.9rem] tracking-[0.15em] uppercase text-white">
                Mythic
              </span>
              <span className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-[#39FF14] border border-[#39FF14]/20 bg-[#39FF14]/[0.04] px-2 py-0.5">
                Explorer
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-5">
              <a href="https://mythic.sh" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-[#39FF14] transition-colors">
                mythic.sh
              </a>
              <a href="https://mythic.sh/bridge" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-[#39FF14] transition-colors">
                Bridge
              </a>
              <a href="https://mythicswap.app" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-[#39FF14] transition-colors">
                Swap
              </a>
              <a href="https://mythic.money" target="_blank" rel="noopener noreferrer"
                className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-[#39FF14] transition-colors">
                Launchpad
              </a>
              <span className="w-px h-4 bg-[#39FF14]/10" />
              <Link href="/mainnet" className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-[#39FF14] transition-colors flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-[#39FF14] pulse-dot" />
                Mainnet
              </Link>
              <Link href="/testnet" className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#8888A0] hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-400" />
                Testnet
              </Link>
            </div>
          </div>
        </nav>

        <main className="grid-bg min-h-[calc(100vh-3.5rem-4rem)]">{children}</main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-[#39FF14]/[0.06] py-6 bg-[#060609]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-[#39FF14] pulse-dot" />
              <span className="font-mono text-[0.55rem] tracking-[0.1em] text-[#555568] uppercase">
                Mythic L2 Network
              </span>
            </div>
            <div className="flex items-center gap-5">
              <a href="https://mythic.sh/docs" className="font-mono text-[0.55rem] tracking-[0.08em] text-[#555568] hover:text-[#39FF14] transition-colors uppercase">Docs</a>
              <a href="https://mythic.sh/whitepaper" className="font-mono text-[0.55rem] tracking-[0.08em] text-[#555568] hover:text-[#39FF14] transition-colors uppercase">Whitepaper</a>
              <a href="https://mythic.sh" className="font-mono text-[0.55rem] tracking-[0.08em] text-[#555568] hover:text-[#39FF14] transition-colors uppercase">mythic.sh</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
