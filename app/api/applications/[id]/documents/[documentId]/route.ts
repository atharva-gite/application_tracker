import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { unlinkApplicationDocument } from "@/server/services/document-service";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; documentId: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id, documentId } = await context.params;
    return json(await unlinkApplicationDocument(user.id, id, documentId));
  });
}
