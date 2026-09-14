import { handleApi, json, parseJsonBody } from "@/lib/api";
import { parseSchema } from "@/lib/validation/helpers";
import { interviewInputSchema } from "@/lib/validation/interview";
import { requireUser } from "@/server/authorization/require-user";
import {
  createInterview,
  listApplicationInterviews,
} from "@/server/services/interview-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return json(await listApplicationInterviews(user.id, id));
  });
}

export async function POST(request: Request, context: Context) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const { id } = await context.params;
    const input = parseSchema(interviewInputSchema, await parseJsonBody(request));
    return json({ interview: await createInterview(user.id, id, input) }, 201);
  });
}
