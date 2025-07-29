import { auth } from "~/server/auth";
import { notFound, redirect } from "next/navigation";
import { getFileViewingUrl } from "~/server/actions";

export default async function FilePage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;

  const session = await auth();

  if (!session?.userId) return redirect("/sign-in");

  const { success, data } = await getFileViewingUrl(fileId);

  if (!success) notFound();

  return redirect(data!);
}
