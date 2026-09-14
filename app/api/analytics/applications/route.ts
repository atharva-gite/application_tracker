import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { getAnalyticsApplications } from "@/server/services/dashboard-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    return json(await getAnalyticsApplications(user.id));
  });
}
