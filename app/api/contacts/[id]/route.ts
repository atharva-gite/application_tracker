import { handleApi, json, parseJsonBody } from "@/lib/api";
import { contactUpdateSchema } from "@/lib/validation/contact";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { deleteContact, updateContact } from "@/server/services/contact-service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(contactUpdateSchema, await parseJsonBody(request));
    return json({ contact: await updateContact(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteContact(user.id, id));
  });
}
