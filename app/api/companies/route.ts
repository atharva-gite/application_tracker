import { handleApi, json, parseJsonBody, parseQuery } from "@/lib/api";
import { companyInputSchema, companyListQuerySchema } from "@/lib/validation/company";
import { parseSchema } from "@/lib/validation/helpers";
import { requireUser } from "@/server/authorization/require-user";
import { createCompany, listCompanies } from "@/server/services/company-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const query = parseQuery(request, companyListQuerySchema);
    return json(await listCompanies(user.id, query));
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const user = await requireUser();
    const input = parseSchema(companyInputSchema, await parseJsonBody(request));
    return json({ company: await createCompany(user.id, input) }, 201);
  });
}
