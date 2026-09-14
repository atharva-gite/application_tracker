import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { unlinkApplicationContact } from "@/server/services/contact-service";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; contactId: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id, contactId } = await context.params;
    return json(await unlinkApplicationContact(user.id, id, contactId));
  });
}
