import { redirect } from "next/navigation";

export default async function TxRedirect({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const { signature } = await params;
  redirect(`/mainnet/tx/${signature}`);
}
