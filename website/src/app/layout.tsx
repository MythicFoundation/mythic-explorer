import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mythic Explorer",
  description: "Explore transactions, accounts, and blocks on the Mythic L2 network.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-mythic-bg text-mythic-text">
        <nav className="border-b border-mythic-border bg-mythic-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/mainnet" className="flex items-center gap-3">
                <svg viewBox="0 0 100 100" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,8 20,44 50,56" fill="#39FF14" opacity="0.92" />
                  <polygon points="50,8 80,44 50,56" fill="#6FFF4F" opacity="0.78" />
                  <polygon points="20,44 50,56 80,44 50,92" fill="#2ACC10" opacity="0.88" />
                </svg>
                <span className="font-heading font-bold text-lg tracking-tight">
                  Mythic Explorer
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/mainnet" className="text-xs font-mono text-mythic-muted hover:text-mythic-green transition-colors">
                  Mainnet
                </Link>
                <Link href="/testnet" className="text-xs font-mono text-mythic-muted hover:text-yellow-400 transition-colors">
                  Testnet
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-mythic-border py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-mythic-muted text-xs">
            <span>Mythic L2 Block Explorer</span>
            <a href="https://mythic.sh" className="hover:text-mythic-green transition-colors">mythic.sh</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
