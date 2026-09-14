import { handleApi, json, parseJsonBody, parseQuery } from "@/lib/api";
import { contactInputSchema, contactListQuerySchema } from "@/lib/validation/contact";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { createContact, listContacts } from "@/server/services/contact-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const query = parseQuery(request, contactListQuerySchema);
    return json(await listContacts(user.id, query));
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const input = parseSchema(contactInputSchema, await parseJsonBody(request));
    return json({ contact: await createContact(user.id, input) }, 201);
  });
}
