import { handleApi, json, parseJsonBody } from "@/lib/api";
import { companyUpdateSchema } from "@/lib/validation/company";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  deleteCompany,
  getCompany,
  updateCompany,
} from "@/server/services/company-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json({ company: await getCompany(user.id, id) });
  });
}

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(companyUpdateSchema, await parseJsonBody(request));
    return json({ company: await updateCompany(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteCompany(user.id, id));
  });
}
