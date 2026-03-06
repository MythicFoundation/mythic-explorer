import { redirect } from "next/navigation";

export default async function AddressRedirect({
  params,
}: {
  params: Promise<{ pubkey: string }>;
}) {
  const { pubkey } = await params;
  redirect(`/mainnet/address/${pubkey}`);
}
