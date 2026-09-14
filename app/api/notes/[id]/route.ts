import { handleApi, json, parseJsonBody } from "@/lib/api";
import { parseSchema } from "@/lib/validation/helpers";
import { noteUpdateSchema } from "@/lib/validation/note";
import { requireUser } from "@/server/authorization/require-user";
import { deleteNote, updateNote } from "@/server/services/note-service";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(noteUpdateSchema, await parseJsonBody(request));
    return json({ note: await updateNote(user.id, id, input) });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await deleteNote(user.id, id));
  });
}
