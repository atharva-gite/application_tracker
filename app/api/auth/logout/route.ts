import { signOut } from "@/lib/auth";
import { handleApi, json } from "@/lib/api";
import { requireUser } from "@/server/authorization/require-user";

export async function POST(request: Request) {
  return handleApi(request, async () => {
    await requireUser();
    await signOut({ redirect: false });
    return json({ success: true });
  });
}
