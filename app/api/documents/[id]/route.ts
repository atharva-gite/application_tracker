import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { deleteDocument } from "@/server/services/document-service";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteDocument(user.id, id));
  });
}
