import { handleApi, json } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { documentMetaSchema } from "@/lib/validation/document";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { uploadDocument } from "@/server/services/document-service";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "Choose a file to upload.");
    }
    const input = parseSchema(documentMetaSchema, {
      name: formData.get("name") || file.name,
      type: formData.get("type"),
    });
    const bytes = Buffer.from(await file.arrayBuffer());
    const document = await uploadDocument(user.id, input, {
      name: file.name,
      type: file.type,
      size: file.size,
      bytes,
    });
    return json({ document }, 201);
  });
}
