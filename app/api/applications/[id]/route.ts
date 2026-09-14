import { handleApi, json, parseJsonBody } from "@/lib/api";
import { applicationUpdateSchema } from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  archiveApplication,
  getApplication,
  updateApplication,
} from "@/server/services/application-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json({ application: await getApplication(user.id, id) });
  });
}

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(applicationUpdateSchema, await parseJsonBody(request));
    return json({ application: await updateApplication(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json({ application: await archiveApplication(user.id, id) });
  });
}
