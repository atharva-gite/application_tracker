import { handleApi, json, parseJsonBody } from "@/lib/api";
import { applicationDocumentSchema } from "@/lib/validation/document";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  linkApplicationDocument,
  listApplicationDocuments,
} from "@/server/services/document-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await listApplicationDocuments(user.id, id));
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(applicationDocumentSchema, await parseJsonBody(request));
    return json(await linkApplicationDocument(user.id, id, input.documentId), 201);
  });
}
