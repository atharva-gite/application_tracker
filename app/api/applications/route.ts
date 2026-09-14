import { handleApi, json, parseJsonBody, parseQuery } from "@/lib/api";
import {
  applicationCreateSchema,
  applicationListQuerySchema,
} from "@/lib/validation/application";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import {
  createApplication,
  listApplications,
} from "@/server/services/application-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const query = parseQuery(request, applicationListQuerySchema);
    return json(await listApplications(user.id, query));
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const input = parseSchema(applicationCreateSchema, await parseJsonBody(request));
    return json({ application: await createApplication(user.id, input) }, 201);
  });
}
