<p align="center">
  <img src="https://mythic.sh/brand/mythic-logo.svg" alt="Mythic Explorer" width="120" />
</p>

<h1 align="center">Mythic Explorer</h1>

<p align="center">
  <strong>Block explorer for the Mythic L2 network</strong>
</p>

<p align="center">
  <a href="https://github.com/MythicFoundation/mythic-explorer/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-39FF14?style=flat-square" alt="License" /></a>
  <a href="https://github.com/MythicFoundation/mythic-explorer/actions"><img src="https://img.shields.io/badge/Build-Passing-39FF14?style=flat-square" alt="Build" /></a>
  <a href="https://explorer.mythic.sh"><img src="https://img.shields.io/badge/App-Live-39FF14?style=flat-square" alt="App" /></a>
  <a href="https://solana.com"><img src="https://img.shields.io/badge/Solana-v2.0-7B2FFF?style=flat-square" alt="Solana" /></a>
</p>

<p align="center">
  <a href="https://explorer.mythic.sh">Live Explorer</a> &nbsp;|&nbsp;
  <a href="https://api.mythic.sh">API</a> &nbsp;|&nbsp;
  <a href="https://mythic.sh/docs">Documentation</a> &nbsp;|&nbsp;
  <a href="https://mythic.sh">Mythic L2</a>
</p>

---

## Overview

Mythic Explorer is the official block explorer for the Mythic L2 network. It provides real-time visibility into blocks, transactions, accounts, and program activity across the network. Built as a high-performance Next.js 14 application, it connects directly to Mythic L2 RPC nodes and the Explorer REST API.

## Features

- **Live Dashboard** -- Real-time network stats including TPS, slot height, and epoch progress
- **Block Inspector** -- Browse blocks with full transaction lists and metadata
- **Transaction Viewer** -- Detailed transaction breakdowns with instruction-level decoding
- **Account Lookup** -- Search any address to view balances, token holdings, and transaction history
- **Program Inspection** -- View deployed programs and their execution stats
- **Network Switcher** -- Toggle between mainnet, testnet, and devnet
- **Universal Search** -- Search by transaction signature, block number, or account address
- **Paginated History** -- Efficiently browse large transaction histories

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **RPC Client:** `@solana/web3.js 1.95`
- **API:** REST integration with [api.mythic.sh](https://api.mythic.sh)
- **Typography:** Sora (display), Inter (body), JetBrains Mono (code)

## Getting Started

### Prerequisites

- Node.js 20+

### Run Locally

```bash
git clone https://github.com/MythicFoundation/mythic-explorer.git
cd mythic-explorer/website
npm install
npm run dev
```

The explorer will be available at `http://localhost:3000`.

### Build for Production

```bash
cd mythic-explorer/website
npm run build
npm start
```

## Directory Structure

```
mythic-explorer/
└── website/                     # Next.js 14 explorer application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Home dashboard with live stats
    │   │   ├── [network]/       # Network-scoped routes
    │   │   │   ├── address/     # Account detail pages
    │   │   │   ├── block/       # Block detail pages
    │   │   │   └── tx/          # Transaction detail pages
    │   │   ├── api/
    │   │   │   ├── rpc/         # RPC proxy endpoint
    │   │   │   └── address-txs/ # Transaction history API
    │   │   ├── layout.tsx       # Root layout with navigation
    │   │   └── not-found.tsx    # 404 page
    │   ├── components/
    │   │   ├── LiveDashboard.tsx       # Real-time network metrics
    │   │   ├── BlocksTable.tsx         # Block listing table
    │   │   ├── TransactionsTable.tsx   # Transaction listing
    │   │   ├── PaginatedTransactions.tsx # Paginated tx history
    │   │   ├── SearchBar.tsx           # Universal search
    │   │   └── StatsGrid.tsx           # Network statistics grid
    │   └── lib/
    │       └── rpc.ts           # RPC connection utilities
    └── package.json
```

## API Integration

Mythic Explorer integrates with two data sources:

| Source | URL | Purpose |
|--------|-----|---------|
| Mythic L2 RPC | `rpc.mythic.sh` | Direct chain queries (blocks, txs, accounts) |
| Explorer API | `api.mythic.sh` | Indexed data (search, history, analytics) |

### Explorer API Endpoints

```
GET /api/supply          # Token supply data
GET /api/supply/stats    # Network statistics
GET /api/supply/validators  # Active validator set
GET /api/supply/history  # Historical supply data
```

## Contributing

We welcome contributions. To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Ensure the build passes (`cd website && npm run build`)
4. Submit a pull request

## Security

If you discover a vulnerability, please report it responsibly:

- Email: security@mythic.sh
- Do NOT open public issues for security vulnerabilities

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built by <a href="https://mythiclabs.io">MythicLabs</a> &nbsp;|&nbsp; Part of the <a href="https://mythic.sh">Mythic L2</a> ecosystem
</p>
