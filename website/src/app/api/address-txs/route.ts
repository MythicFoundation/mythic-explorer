import { NextRequest, NextResponse } from "next/server";
import { getAddressTransactions } from "@/lib/rpc";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const before = request.nextUrl.searchParams.get("before") || undefined;
  const network = request.nextUrl.searchParams.get("network") || "mainnet";

  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }

  try {
    const txs = await getAddressTransactions(address, 25, before, network);
    return NextResponse.json(txs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
