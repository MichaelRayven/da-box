import { notFound, redirect, RedirectType } from "next/navigation";
import { getFileViewingUrl } from "~/server/actions";
import { auth } from "~/server/auth";

export default async function FilePage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;

  const session = await auth();

  if (!session?.userId) return redirect("/sign-in", RedirectType.replace);

  const { success, data } = await getFileViewingUrl(fileId);

  if (!success) notFound();

  return redirect(data!, RedirectType.replace);
}
