import { handleApi, json, parseQuery } from "@/lib/api";
import { documentListQuerySchema } from "@/lib/validation/document";
import { requireUser } from "@/server/authorization/require-user";
import { listDocuments } from "@/server/services/document-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const query = parseQuery(request, documentListQuerySchema);
    return json(await listDocuments(user.id, query));
  });
}
