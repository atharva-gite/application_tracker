import { handleApi, json, parseQuery } from "@/lib/api";
import { analyticsQuerySchema } from "@/lib/validation/analytics";
import { requireUser } from "@/server/authorization/require-user";
import { getAnalyticsConversion } from "@/server/services/analytics-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { range } = parseQuery(request, analyticsQuerySchema);
    return json(await getAnalyticsConversion(user.id, range));
  });
}
