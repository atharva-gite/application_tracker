import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";
import { getCurrentUser } from "@/server/services/auth-service";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const sessionUser = await requireUser();
    const user = await getCurrentUser(sessionUser.id);
    return json({ user });
  });
}
