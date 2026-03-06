import { redirect } from "next/navigation";

export default async function BlockRedirect({
  params,
}: {
  params: Promise<{ slot: string }>;
}) {
  const { slot } = await params;
  redirect(`/mainnet/block/${slot}`);
}
