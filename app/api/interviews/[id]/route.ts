import { handleApi, json, parseJsonBody } from "@/lib/api";
import { parseSchema } from "@/lib/validation/helpers";
import { interviewUpdateSchema } from "@/lib/validation/interview";
import { requireUser } from "@/server/authorization/require-user";
import {
  deleteInterview,
  getInterview,
  updateInterview,
} from "@/server/services/interview-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json({ interview: await getInterview(user.id, id) });
  });
}

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(interviewUpdateSchema, await parseJsonBody(request));
    return json({ interview: await updateInterview(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteInterview(user.id, id));
  });
}
