import { getRootFolderForUser } from "~/server/db/queries";
import { auth } from "~/server/auth";
import { notFound, redirect } from "next/navigation";
import { onboardUser } from "~/server/db/mutations";
import { getFileUrl } from "~/server/actions";

export default async function FilePage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;

  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const { success, data } = await getFileUrl(fileId);

  if (!success) notFound();

  return redirect(data!);
}
