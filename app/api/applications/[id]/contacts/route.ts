import { handleApi, json, parseJsonBody } from "@/lib/api";
import { applicationContactSchema } from "@/lib/validation/contact";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  linkApplicationContact,
  listApplicationContacts,
} from "@/server/services/contact-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await listApplicationContacts(user.id, id));
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(applicationContactSchema, await parseJsonBody(request));
    return json(await linkApplicationContact(user.id, id, input), 201);
  });
}
