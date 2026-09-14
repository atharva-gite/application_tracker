import { handleApi, json, parseJsonBody } from "@/lib/api";
import { followUpInputSchema } from "@/lib/validation/follow-up";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  createFollowUp,
  listApplicationFollowUps,
} from "@/server/services/follow-up-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await listApplicationFollowUps(user.id, id));
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(followUpInputSchema, await parseJsonBody(request));
    return json({ followUp: await createFollowUp(user.id, id, input) }, 201);
  });
}
