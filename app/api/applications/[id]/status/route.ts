import { handleApi, json, parseJsonBody } from "@/lib/api";
import { applicationStatusSchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { changeApplicationStatus } from "@/server/services/application-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(applicationStatusSchema, await parseJsonBody(request));
    return json({ application: await changeApplicationStatus(user.id, id, input) });
  });
}
