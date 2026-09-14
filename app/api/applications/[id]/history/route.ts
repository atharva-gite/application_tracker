import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { getApplicationHistory } from "@/server/services/application-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await getApplicationHistory(user.id, id));
  });
}
