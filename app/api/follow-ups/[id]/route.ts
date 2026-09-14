import { handleApi, json, parseJsonBody } from "@/lib/api";
import { followUpUpdateSchema } from "@/lib/validation/follow-up";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { deleteFollowUp, updateFollowUp } from "@/server/services/follow-up-service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(followUpUpdateSchema, await parseJsonBody(request));
    return json({ followUp: await updateFollowUp(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteFollowUp(user.id, id));
  });
}
