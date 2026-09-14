import { handleApi } from "@/lib/api";
import { documentFileResponse } from "@/lib/document-file";
import { requireUser } from "@/server/authorization/require-user";
import { getDocumentFile } from "@/server/services/document-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const { document, bytes } = await getDocumentFile(user.id, id);
    return documentFileResponse(document, bytes, "inline");
  });
}
