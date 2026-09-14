import { handleApi, json, parseJsonBody } from "@/lib/api";
import { parseSchema } from "@/lib/validation/helpers";
import { noteInputSchema } from "@/lib/validation/note";
import { requireUser } from "@/server/authorization/require-user";
import { createNote, listApplicationNotes } from "@/server/services/note-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await listApplicationNotes(user.id, id));
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(noteInputSchema, await parseJsonBody(request));
    return json({ note: await createNote(user.id, id, input) }, 201);
  });
}
