import { DashboardLogin, DashboardWorkspace } from "@/components/dashboard";
import { AuthError, requireAdmin } from "@/lib/auth/server";
import { getAdminContent } from "@/lib/cms/repository";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
async function loadWorkspace() {
  try {
    const owner = await requireAdmin();
    const state = await getAdminContent();
    return {
      state,
      user: { name: owner.session.user.name, image: owner.session.user.image },
    };
  } catch (error) {
    const reason =
      error instanceof AuthError
        ? error.code === "FORBIDDEN"
          ? ("forbidden" as const)
          : error.code === "UNAUTHENTICATED"
            ? ("unauthenticated" as const)
            : ("unconfigured" as const)
        : ("unconfigured" as const);
    return { reason };
  }
}
export default async function DashboardPage() {
  const data = await loadWorkspace();
  if (data.reason || !data.state)
    return <DashboardLogin reason={data.reason ?? "unconfigured"} />;
  return (
    <DashboardWorkspace
      initialContent={data.state.content}
      initialRevision={data.state.revision}
      publishedRevision={data.state.publishedRevision}
      user={data.user}
      configured
    />
  );
}
